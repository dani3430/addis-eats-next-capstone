"use client";

import { useActionState } from "react";
import { cancelStaffOrder } from "@/app/actions";

const initialState = { ok: false, message: "" };

export default function StaffOrderActions({ orderId }) {
  const [state, formAction, pending] = useActionState(cancelStaffOrder, initialState);

  return (
    <div className="min-w-36">
      <form
        action={formAction}
        onSubmit={(event) => {
          if (
            !window.confirm(
              `Cancel and archive ${orderId}? It will remain in the order history and revenue records.`
            )
          ) {
            event.preventDefault();
          }
        }}
      >
        <input type="hidden" name="orderId" value={orderId} />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-semibold text-red-800 transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? "Archiving…" : "Cancel & archive"}
        </button>
      </form>
      {state.message && (
        <p role={state.ok ? "status" : "alert"} className="mt-2 max-w-48 text-xs text-stone-600">
          {state.message}
        </p>
      )}
    </div>
  );
}
