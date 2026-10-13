   import { AREAS } from "./areas";
// One schema, enforced server-side by both the route handler and the server action.
const PHONE_RE = /^(?:\+251|0)[79]\d{8}$/;

export function validateOrder(input) {
  const fieldErrors = {};

  const name = String(input?.name ?? "").trim();
  const phone = String(input?.phone ?? "").replace(/[\s-]/g, "");
  const address = String(input?.address ?? "").trim();
  const area = String(input?.area ?? "").trim();
  const items = input?.items;

  if (name.length < 2) {
    fieldErrors.name = "Enter your full name (at least 2 characters).";
  } else if (name.length > 60) {
    fieldErrors.name = "Name is too long (60 characters max).";
  }

  if (!PHONE_RE.test(phone)) {
    fieldErrors.phone = "Enter a valid Ethiopian phone number, e.g. 0912345678.";
  }

  if (address.length < 5) {
    fieldErrors.address = "Enter a delivery address (at least 5 characters).";
  }
  
  if (!AREAS.includes(area)) {
       fieldErrors.area = "Choose your neighbourhood.";
     }

  if (!Array.isArray(items) || items.length === 0) {
    fieldErrors.items = "Your cart is empty.";
  } else if (
    items.length > 30 ||
    items.some(
      (item) =>
        typeof item?.id !== "string" ||
        !Number.isInteger(item?.qty) ||
        item.qty < 1 ||
        item.qty > 20
    )
  ) {
    fieldErrors.items = "Your cart contains an invalid item.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  return {
    ok: true,
    data: {
      name,
      phone,
      address,
      area,
      items: items.map(({ id, qty }) => ({ id, qty })),
    },
  };
}