import { AREA_COORDS, KITCHEN } from "./areas";

// Presentation simulation: the full delivery journey completes 90 seconds
// after order creation. The courier position is interpolated, not real GPS.
const PREPARING_FROM = 10;
const ON_THE_WAY_FROM = 30;
const DELIVERED_AT = 90;

export const STATUS_LABELS = {
  received: "Received",
  preparing: "Preparing",
  on_the_way: "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function secondsSince(order, now) {
  return (now - new Date(order.createdAt).getTime()) / 1000;
}

export function deriveStatus(order, now = Date.now()) {
  if (order.status === "cancelled") return "cancelled";
  const seconds = secondsSince(order, now);
  if (seconds >= DELIVERED_AT) return "delivered";
  if (seconds >= ON_THE_WAY_FROM) return "on_the_way";
  if (seconds >= PREPARING_FROM) return "preparing";
  return "received";
}

// An order can only be cancelled before the courier leaves the kitchen.
export function canCancel(order, now = Date.now()) {
  const status = deriveStatus(order, now);
  return status === "received" || status === "preparing";
}

const lerp = (from, to, t) => from + (to - from) * t;

// Everything the tracking page and the live stream need, as plain data.
// All coordinates are [latitude, longitude].
export function getTracking(order, now = Date.now()) {
  const status = deriveStatus(order, now);
  const kitchen = KITCHEN.coords;
  const destination = AREA_COORDS[order.area] ?? kitchen;

  let courier = kitchen;
  if (status === "on_the_way") {
    const t = Math.min(
      1,
      Math.max(0, (secondsSince(order, now) - ON_THE_WAY_FROM) / (DELIVERED_AT - ON_THE_WAY_FROM))
    );
    courier = [lerp(kitchen[0], destination[0], t), lerp(kitchen[1], destination[1], t)];
  } else if (status === "delivered") {
    courier = destination;
  }

  const final = status === "delivered" || status === "cancelled";
  const eta = final
    ? null
    : new Date(new Date(order.createdAt).getTime() + DELIVERED_AT * 1000).toISOString();

  return {
    id: order.id,
    status,
    label: STATUS_LABELS[status],
    courier: status === "cancelled" ? null : courier,
    destination,
    kitchen,
    area: order.area,
    address: order.address,
    eta,
    final,
    at: new Date(now).toISOString(),
  };
}