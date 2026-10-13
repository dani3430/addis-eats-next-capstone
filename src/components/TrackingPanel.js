"use client";

import { useSyncExternalStore } from "react";
import MapPanel from "./MapPanel";
import { clock, relative } from "@/lib/format";

const CONNECTION = {
  connecting: { dot: "bg-stone-400", text: "Connecting…" },
  live: { dot: "bg-green-600", text: "Live" },
  reconnecting: { dot: "bg-amber-500", text: "Reconnecting…" },
  paused: { dot: "bg-red-500", text: "Live updates unavailable. Checking every 5 seconds." },
  ended: { dot: "bg-stone-400", text: "Finished: no more updates" },
};

// A clock that ticks every 10 seconds. Time is an outside system, so useSyncExternalStore is the right
// tool, and no state is set inside an effect. Before the first tick (and on the server) the value is 0,
// so the server render and the first client render match.
let currentTime = 0;

function subscribeToClock(onChange) {
  currentTime = Date.now();
  onChange();
  const timer = setInterval(() => {
    currentTime = Date.now();
    onChange();
  }, 10000);
  return () => {
    clearInterval(timer);
    currentTime = 0;
  };
}

const getClock = () => currentTime;
const getServerClock = () => 0;

// The same information as the map, in words, for anyone who cannot use the map.
function describeWhere(tracking) {
  switch (tracking.status) {
    case "received":
    case "preparing":
      return "Your order is being prepared at the Addis Eats kitchen near Meskel Square.";
    case "on_the_way":
      return `The courier has left the kitchen and is on the way to ${tracking.area}.`;
    case "delivered":
      return `Your order was delivered in ${tracking.area}.`;
    default:
      return "This order was cancelled.";
  }
}

export default function TrackingPanel({ tracking, connection }) {
  // "Arriving in 4 minutes" depends on the current moment, so it is only worked out in the browser.
  const now = useSyncExternalStore(subscribeToClock, getClock, getServerClock);

  const state = CONNECTION[connection] ?? CONNECTION.connecting;

  return (
    <div className="grid gap-4 md:grid-cols-[3fr_2fr]">
      <div className="overflow-hidden rounded-xl border border-amber-200">
        <MapPanel tracking={tracking} />
      </div>

      <section
        aria-labelledby="delivery-details"
        className="rounded-xl border border-amber-200 bg-white p-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="delivery-details" className="text-lg font-semibold">
            Delivery details
          </h2>
          <p
            role="status"
            className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-stone-700"
          >
            <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${state.dot}`} />
            {state.text}
          </p>
        </div>

        <p aria-live="polite" className="mt-3 text-sm text-stone-700">
          {describeWhere(tracking)}
        </p>
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="text-stone-500">Status</dt>
            <dd className="font-semibold">{tracking.label}</dd>
          </div>
          <div>
            <dt className="text-stone-500">Delivering to</dt>
            <dd className="font-semibold">{tracking.address}</dd>
            <dd>{tracking.area}, Addis Ababa</dd>
          </div>
          {tracking.eta && (
            <div>
              <dt className="text-stone-500">Estimated arrival</dt>
              <dd className="font-semibold">
                {clock(tracking.eta)} (Addis Ababa time)
                {now ? (
                  <span className="font-normal text-stone-600"> · {relative(tracking.eta, now)}</span>
                ) : null}
              </dd>
            </div>
          )}
        </dl>
        <p className="mt-4 text-xs text-stone-500">
          Last update {clock(tracking.at)}. Demo: the courier&apos;s position is simulated, there is no
          real GPS.
        </p>
      </section>
    </div>
  );
}