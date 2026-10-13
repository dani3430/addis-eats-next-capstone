import { DEMO_SEED_DISHES } from "./dishes";
import { AREAS } from "./areas";

// Demo data, so the dashboard and the orders table have something to show.
// It is deterministic (the same orders after every restart), and the dashboard labels it as demo data.
// Almaz and Biruk get orders of their own, so their orders table has enough rows to sort and page.
// The staff account gets none, which makes the "no orders yet" state easy to see.

const DAYS = 14;
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

// A tiny seeded random generator, so the demo data is the same every time.
function makeRandom(seed) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

// Bigger weight = picked more often, so the bar chart has differences to show.
const AREA_WEIGHTS = { Bole: 4, Kazanchis: 3, Piassa: 2, Megenagna: 2, Sarbet: 1 };
const AREA_POOL = AREAS.flatMap((area) => Array(AREA_WEIGHTS[area] ?? 1).fill(area));

const ALMAZ = { id: "usr_almaz", name: "Almaz Bekele", phone: "0912345678" };
const BIRUK = { id: "usr_biruk", name: "Biruk Tesfaye", phone: "0922334455" };
const DEMO_CUSTOMERS = [1, 2, 3, 4].map((n) => ({
  id: `usr_demo${n}`,
  name: "Demo Customer",
  phone: `091100000${n}`,
}));
const CUSTOMER_POOL = [
  ...Array(7).fill(ALMAZ),
  ...Array(5).fill(BIRUK),
  ...DEMO_CUSTOMERS.flatMap((customer) => [customer, customer]),
];

export function seedDemoOrders(store) {
  const random = makeRandom(46);
  const pick = (list) => list[Math.floor(random() * list.length)];
  const now = Date.now();
  let count = 0;

  for (let daysAgo = DAYS - 1; daysAgo >= 0; daysAgo--) {
    const ordersToday = 2 + Math.floor(random() * 6); // 2 to 7 orders a day

    for (let i = 0; i < ordersToday; i++) {
      const customer = pick(CUSTOMER_POOL);
      const area = pick(AREA_POOL);

      const lines = [];
      const lineCount = 1 + Math.floor(random() * 3);
      for (let l = 0; l < lineCount; l++) {
        const dish = pick(DEMO_SEED_DISHES);
        if (lines.some((line) => line.id === dish.id)) continue;
        lines.push({
          id: dish.id,
          name: dish.name,
          price: dish.price,
          qty: 1 + Math.floor(random() * 3),
        });
      }

      const total = lines.reduce((sum, line) => sum + line.price * line.qty, 0);
      const createdAt = new Date(
        now - daysAgo * DAY_MS - Math.floor(random() * 10) * HOUR_MS
      ).toISOString();

      count += 1;
      const id = `ord_demo${String(count).padStart(3, "0")}`;
      store.set(id, {
        id,
        userId: customer.id,
        name: customer.name,
        phone: customer.phone,
        address: `${area} (demo address)`,
        area,
        lines,
        total,
        status: random() < 0.08 ? "cancelled" : "received",
        createdAt,
      });
    }
  }
}