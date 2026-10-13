"use client";
import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { placeOrder, cancelOrder } from "@/app/actions";
import { useCart } from "./Providers";
import { AREAS } from "@/lib/areas";
import { etb } from "@/lib/format";

const initialState = {
  ok: false,
  message: "",
  fieldErrors: {},
  values: { name: "", phone: "", address: "", area: "" },
};

function Field({ id, label, type = "text", defaultValue, error, autoComplete }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-stone-700">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        defaultValue={defaultValue}
        autoComplete={autoComplete}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`mt-1 w-full rounded-lg border px-3 py-2.5 transition ${
          error
            ? "border-red-400 bg-red-50"
            : "border-amber-300 bg-white hover:border-amber-400"
        }`}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
// One key per checkout attempt. The server treats a repeat of the same key as the same order.
function newAttemptKey() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

export default function CheckoutForm({ items }) {
  const [state, formAction, pending] = useActionState(placeOrder, initialState);
  const { dispatch } = useCart();
   const [cancelResult, setCancelResult] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const attemptKey = useRef(null);

  // Wraps the form action: the key is made on the first submit and reused for every repeat.
  function submitOrder(formData) {
    attemptKey.current ??= newAttemptKey();
    formData.set("idempotencyKey", attemptKey.current);
    return formAction(formData);
  }

  // After a successful order, empty the cart and expire the checkout cookie.
  useEffect(() => {
    if (state.ok) {
      dispatch({ type: "clear" });
      document.cookie = "addis-cart=; path=/; max-age=0";
    }
  }, [state.ok, dispatch]);

   async function handleCancel() {
    if (cancelling) return;
    setCancelling(true);
    setCancelResult(await cancelOrder(state.order.id));
    setCancelling(false);
  }

  if (state.ok) {
    const cancelled = cancelResult?.ok;
    return (
      <div
        role="status"
        className="rounded-xl border border-green-300 bg-green-50 p-6 text-center sm:text-left"
      >
        <p className="text-4xl">✅</p>
        <h2 className="mt-2 text-xl font-bold text-green-800">{state.message}</h2>
        <dl className="mt-4 space-y-1 text-sm text-green-900">
          <div className="flex justify-between gap-4">
            <dt>Order</dt>
            <dd className="font-semibold">{state.order.id}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Total</dt>
            <dd className="font-semibold">{etb(state.order.total)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Status</dt>
            <dd className="font-semibold capitalize">
              {cancelled ? "cancelled" : state.order.status}
            </dd>
          </div>
        </dl>
<Link
  href={`/orders/${state.order.id}`}
  className="mt-4 inline-block text-sm font-medium text-amber-700 underline"
>
  Track this order →
</Link>
                {!cancelled && (
          <button
            type="button"
            onClick={handleCancel}
            disabled={cancelling}
            className="mt-5 rounded-lg border-2 border-red-600 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
          >
            {cancelling ? "Cancelling…" : "Cancel this order"}
          </button>
        )}
        {cancelResult && !cancelResult.ok && (
          <p role="alert" className="mt-2 text-sm font-medium text-red-700">
            {cancelResult.error}
          </p>
        )}
      </div>
    );
  }

  return (
           <form
      action={submitOrder}
      noValidate
      className="space-y-5 rounded-xl border border-amber-200 bg-white p-6 shadow-sm"
    >
      <input type="hidden" name="items" value={JSON.stringify(items)} />

      {state.message && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-800">
          {state.message}
        </p>
      )}
      {state.fieldErrors.items && (
        <p role="alert" className="text-sm font-medium text-red-700">
          {state.fieldErrors.items}
        </p>
      )}

      <Field id="name" label="Full name" autoComplete="name"
        defaultValue={state.values.name} error={state.fieldErrors.name} />
      <Field id="phone" label="Phone number" type="tel" autoComplete="tel"
        defaultValue={state.values.phone} error={state.fieldErrors.phone} />
      <Field id="address" label="Delivery address" autoComplete="street-address"
        defaultValue={state.values.address} error={state.fieldErrors.address} />
         <div>
           <label htmlFor="area" className="block text-sm font-medium text-stone-700">
             Neighbourhood
           </label>
           <select
             id="area"
             name="area"
             defaultValue={state.values.area}
             aria-invalid={state.fieldErrors.area ? "true" : undefined}
             aria-describedby={state.fieldErrors.area ? "area-error" : undefined}
             className={`mt-1 w-full rounded-lg border px-3 py-2.5 transition ${
               state.fieldErrors.area
                 ? "border-red-400 bg-red-50"
                 : "border-amber-300 bg-white hover:border-amber-400"
             }`}
           >
             <option value="">Choose your neighbourhood</option>
             {AREAS.map((area) => (
               <option key={area} value={area}>
                 {area}
               </option>
             ))}
           </select>
           {state.fieldErrors.area && (
             <p id="area-error" role="alert" className="mt-1 text-sm font-medium text-red-700">
               {state.fieldErrors.area}
             </p>
           )}
         </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-amber-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-amber-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Placing order…" : "Place order"}
      </button>
    </form>
  );
}