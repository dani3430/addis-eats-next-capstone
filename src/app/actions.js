"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { createOrder, getOrder, markCancelled } from "@/lib/orders";
import { canCancel } from "@/lib/tracking";

export async function placeOrder(prevState, formData) {
  // Authentication: re-checked here, since middleware only proved a
  // cookie exists, nothing more. If the session expired mid-checkout,
  // this sends the person back to sign in rather than trusting the form.
  const session = await getSession();
  if (!session) {
    redirect("/signin?next=/checkout");
  }

  let items = [];
  try {
    items = JSON.parse(String(formData.get("items") ?? "[]"));
  } catch {
    items = [];
  }

  const values = {
    name: String(formData.get("name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    address: String(formData.get("address") ?? ""),
    area: String(formData.get("area") ?? ""),
  };

   const idempotencyKey = String(formData.get("idempotencyKey") ?? "").slice(0, 100);
  const result = await createOrder({ ...values, items }, session.id, idempotencyKey);

  if (!result.ok) {
    return {
      ok: false,
      message: "Please fix the highlighted fields.",
      fieldErrors: result.fieldErrors,
      values,
    };
  }
  return { ok: true, message: "Order placed!", order: result.order };
}

// Authentication, then authorisation — two different questions.
// Passing the first tells you nothing about the second.
export async function cancelOrder(orderId) {
  const session = await getSession();
  if (!session) {
    return { ok: false, error: "Not signed in" };
  }

  const order = getOrder(String(orderId));
  if (!order) {
    return { ok: false, error: "Order not found" };
  }
  if (order.userId !== session.id) {
    return { ok: false, error: "Not allowed" };
  }
 if (!canCancel(order)) {
      return { ok: false, error: "This order is already on its way and can no longer be cancelled." };
    }
  return { ok: true, order: markCancelled(order.id) };
}

export async function cancelStaffOrder(_previousState, formData) {
  const session = await getSession();
  if (!session) {
    return { ok: false, message: "Your session expired. Sign in again." };
  }
  if (session.role !== "staff") {
    return { ok: false, message: "Only staff can archive orders." };
  }

  const orderId = String(formData.get("orderId") ?? "");
  const order = getOrder(orderId);
  if (!order) {
    return { ok: false, message: "That order could not be found." };
  }
  if (order.status === "cancelled") {
    return { ok: false, message: "This order is already cancelled." };
  }

  markCancelled(order.id);
  revalidatePath("/dashboard");
  revalidatePath("/kitchen");
  return { ok: true, message: `${order.id} cancelled and retained in order history.` };
}
