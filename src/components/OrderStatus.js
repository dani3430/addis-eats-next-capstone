"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { etb } from "@/lib/format";
import { cancelOrder } from "@/app/actions";
import StatusBadge from "./StatusBadge";

export default function OrderStatus({ id, initial, liveStatus, polling }) {
  // fallbackData is the server-rendered order: no spinner on first paint.
  // While the live stream works there is nothing to poll. If the stream is unavailable,
  // polling every 5 seconds takes over: the fallback.
  const { data, error, isLoading, mutate } = useSWR(`/api/orders/${id}`, fetcher, {
    fallbackData: initial,
    refreshInterval: polling ? 5000 : 0,
  });
  const [cancelling, setCancelling] = useState(false);
  const [message, setMessage] = useState("");

  if (error) {
    return (
      <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-800">
        Could not load this order.
      </p>
    );
  }
  if (isLoading && !data) {
    return <p className="text-stone-500">Loading order…</p>;
  }

  const order = data.order;
  // A cancellation we just made wins; otherwise the live status; otherwise the polled one.
  const status = order.status === "cancelled" ? "cancelled" : liveStatus ?? order.status;

  async function handleCancel() {
    setCancelling(true);
    const result = await cancelOrder(order.id);
    if (result.ok) {
      // Tell the cache what changed now, instead of waiting for the next update.
      mutate({ order: result.order }, false);
      setMessage("");
    } else {
      setMessage(result.error);
    }
    setCancelling(false);
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Order {order.id}</h2>
        <StatusBadge status={status} />
      </div>

      <ul className="mt-4 divide-y divide-amber-100 text-sm">
        {order.lines.map((line) => (
          <li key={line.id} className="flex justify-between py-2">
            <span>{line.qty} × {line.name}</span>
            <span className="tabular-nums">{etb(line.price * line.qty)}</span>
          </li>
        ))}
      </ul>

      <p className="mt-3 flex justify-between border-t border-amber-200 pt-3 font-bold">
        <span>Total</span>
        <span className="text-amber-700">{etb(order.total)}</span>
      </p>

      {["received", "preparing"].includes(status) && (
        <button
          type="button"
          onClick={handleCancel}
          disabled={cancelling}
          className="mt-5 rounded-lg border-2 border-red-600 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
        >
          {cancelling ? "Cancelling…" : "Cancel this order"}
        </button>
      )}
      {message && (
        <p role="alert" className="mt-3 text-sm font-medium text-red-700">
          {message}
        </p>
      )}
    </div>
  );
}