import { getDish } from "./dishes";
import { validateOrder } from "./validation";
import { seedDemoOrders } from "./seed";
import { AREAS } from "./areas";
import { deriveStatus, getTracking } from "./tracking";

// In-memory store, kept on globalThis so it survives hot reloads in dev.
const store = globalThis.__addisOrders ?? (globalThis.__addisOrders = new Map());

   // Demo data, loaded once each time the server starts. See seed.js.
   if (!globalThis.__addisSeeded) {
     globalThis.__addisSeeded = true;
     seedDemoOrders(store);
   }
      function publicOrder(order) {
     const { id, total, lines, createdAt, area, address } = order;
     // The stored status is only "received" or "cancelled": the journey is worked out from the clock.
     return { id, status: deriveStatus(order), total, lines, createdAt, area, address };
   }

async function buildOrder(input, userId) {
  const result = validateOrder(input);
  if (!result.ok) {
    return { ok: false, status: 422, fieldErrors: result.fieldErrors };
  }

  const lines = [];
  for (const { id, qty } of result.data.items) {
    const dish = await getDish(id);
    if (!dish) {
      return { ok: false, status: 422, fieldErrors: { items: `Unknown dish: ${id}` } };
    }
    lines.push({ id: dish.id, name: dish.name, price: dish.price, qty });
  }

  const total = lines.reduce((sum, line) => sum + line.price * line.qty, 0);
  const order = {
    id: `ord_${crypto.randomUUID().slice(0, 8)}`,
    userId,
    name: result.data.name,
    phone: result.data.phone,
    address: result.data.address,
    area: result.data.area,
    lines,
    total,
    status: "received",
    createdAt: new Date().toISOString(),
  };

  store.set(order.id, order);
  return { ok: true, status: 201, order: publicOrder(order) };
}
// One slot per checkout attempt: the same key from the same person always gives
// back the same order, so a repeated submit cannot create a second one.
const attempts = globalThis.__addisOrderAttempts ?? (globalThis.__addisOrderAttempts = new Map());

export function createOrder(input, userId, idempotencyKey = "") {
  if (!idempotencyKey) return buildOrder(input, userId);

  const slot = `${userId}:${idempotencyKey}`;
  if (!attempts.has(slot)) {
    const attempt = buildOrder(input, userId);
    attempts.set(slot, attempt);
    // A failed attempt (e.g. validation) must not lock the key: let them fix and retry.
    attempt.then(
      (result) => { if (!result.ok) attempts.delete(slot); },
      () => attempts.delete(slot)
    );
  }
  return attempts.get(slot);
}
export function getOrder(id) {
  return store.get(id) ?? null;
}

// Staff-only views need customer and delivery details across all orders.
// Keep this separate from publicOrder so customer APIs never expose those fields.
export function getOrdersForStaff() {
  return [...store.values()]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((order) => ({
      id: order.id,
      name: order.name,
      phone: order.phone,
      address: order.address,
      area: order.area,
      lines: order.lines.map(({ id, name, price, qty }) => ({ id, name, price, qty })),
      total: order.total,
      status: deriveStatus(order),
      createdAt: order.createdAt,
    }));
}

export function markCancelled(id) {
  const order = store.get(id);
  order.status = "cancelled";
  return publicOrder(order);
}

// The query is scoped to userId, not an id the caller supplies —
// so whatever the request says, only the real owner's order can match.
export function getOwnedOrder(id, userId) {
  const order = store.get(id);
  if (!order) {
    return { ok: false, status: 404, error: "Order not found" };
  }
  if (!userId || order.userId !== userId) {
    return { ok: false, status: 403, error: "Not allowed" };
  }
  return { ok: true, order: publicOrder(order) };
}

const SORT_FIELDS = {
  order: "id",
  date: "createdAt",
  area: "area",
  status: "status",
  total: "total",
};

export const ORDERS_PAGE_SIZE = 10;

// Powers the /orders table, always scoped to the session's own id.
// `sort` is looked up in a fixed list: the URL can never choose an arbitrary field.
// Only one page of rows is returned, plus the total, so a long history never crosses whole.
export function getOrdersForUser(userId, { sort = "date", dir = "desc", page = 1 } = {}) {
  const field = SORT_FIELDS[sort] ?? SORT_FIELDS.date;
  const direction = dir === "asc" ? 1 : -1;

  const sorted = [...store.values()]
    .filter((order) => order.userId === userId)
    .sort((a, b) => {
        const x = (field === "status" ? deriveStatus(a) : a[field]) ?? "";
        const y = (field === "status" ? deriveStatus(b) : b[field]) ?? "";
      const compared = typeof x === "number" ? x - y : String(x).localeCompare(String(y));
      // Equal values: newest first, so the order is always the same.
      return compared * direction || b.createdAt.localeCompare(a.createdAt);
    });

  const total = sorted.length;
  const pages = Math.max(1, Math.ceil(total / ORDERS_PAGE_SIZE));
  const current = Math.min(Math.max(1, page), pages); // never outside the real pages
  const start = (current - 1) * ORDERS_PAGE_SIZE;

  return {
    rows: sorted.slice(start, start + ORDERS_PAGE_SIZE).map(publicOrder),
    total,
    page: current,
    pages,
  };
}
   const DAY_MS = 24 * 60 * 60 * 1000;

   // Revenue and order count for every neighbourhood, biggest first.
   // Cancelled orders are not sales, so they are left out.
   export function getRevenueByArea() {
     const totals = new Map(AREAS.map((area) => [area, { area, revenue: 0, orders: 0 }]));

     for (const order of store.values()) {
       if (order.status === "cancelled") continue;
       const row = totals.get(order.area);
       if (!row) continue;
       row.revenue += order.total;
       row.orders += 1;
     }

     return [...totals.values()].sort((a, b) => b.revenue - a.revenue);
   }

   // Orders per day for the last `days` days, oldest first, including days with no orders.
   // Days are counted in UTC, and cancelled orders are left out.
   export function getOrdersPerDay(days = 14) {
     const counts = new Map();
     for (let i = days - 1; i >= 0; i--) {
       counts.set(new Date(Date.now() - i * DAY_MS).toISOString().slice(0, 10), 0);
     }

     for (const order of store.values()) {
       if (order.status === "cancelled") continue;
       const day = order.createdAt.slice(0, 10);
       if (counts.has(day)) counts.set(day, counts.get(day) + 1);
     }

     return [...counts].map(([date, orders]) => ({
       date,
       label: new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", {
         day: "numeric",
         month: "short",
         timeZone: "UTC",
       }),
       orders,
     }));
   }
   
// The tracking data for the order page and the live stream, scoped to the owner like every other query.
export function getOwnedTracking(id, userId) {
  const order = store.get(id);
  if (!order) {
    return { ok: false, status: 404, error: "Order not found" };
  }
  if (!userId || order.userId !== userId) {
    return { ok: false, status: 403, error: "Not allowed" };
  }
  return { ok: true, tracking: getTracking(order) };
}

// Every order of one person, newest first, for the CSV export. Scoped to the session's id like every query.
export function getAllOrdersForUser(userId) {
  return [...store.values()]
    .filter((order) => order.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(publicOrder);
}