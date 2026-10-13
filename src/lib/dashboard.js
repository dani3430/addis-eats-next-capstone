import { AREAS } from "./areas";

// Pure functions that turn a long list of orders into a few summary rows.
// They run on the server, so the browser never receives the orders themselves.
// Cancelled orders are left out of every figure — they earned nothing.

const ADDIS_TZ = "Africa/Addis_Ababa";

// "2026-10-12" in Addis time. Slicing the UTC string would put an order
// placed at 23:30 in Addis on the wrong day.
const dayFormat = new Intl.DateTimeFormat("en-CA", { timeZone: ADDIS_TZ });

function dayOf(isoString) {
  return dayFormat.format(new Date(isoString));
}

function nextDay(day) {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

// One row per neighbourhood, including those with no orders, so a bar for
// every area always exists and the zero is visible. [{ area, revenue, orders }]
export function revenueByArea(orders) {
  const active = orders.filter((order) => order.status !== "cancelled");
  return AREAS.map((area) => {
    const inArea = active.filter((order) => order.area === area);
    return {
      area,
      revenue: inArea.reduce((sum, order) => sum + order.total, 0),
      orders: inArea.length,
    };
  });
}

// One row per calendar day from the first order to the last, with zero-order
// days filled in, so the line does not skip over quiet days. [{ date, orders }]
export function ordersPerDay(orders) {
  const counts = new Map();
  for (const order of orders) {
    if (order.status === "cancelled") continue;
    const day = dayOf(order.createdAt);
    counts.set(day, (counts.get(day) ?? 0) + 1);
  }
  if (counts.size === 0) return [];

  const days = [...counts.keys()].sort();
  const rows = [];
  for (let day = days[0]; day <= days[days.length - 1]; day = nextDay(day)) {
    rows.push({ date: day, orders: counts.get(day) ?? 0 });
  }
  return rows;
}