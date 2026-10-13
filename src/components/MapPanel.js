"use client";

import dynamic from "next/dynamic";

// Leaflet touches `window` the moment it loads, so it must never run on the server.
// The placeholder is exactly as tall as the map (320 px), so the page does not jump when the map arrives.
const DeliveryMap = dynamic(() => import("./DeliveryMap"), {
  ssr: false, // the important line
  loading: () => (
    <div
      className="flex items-center justify-center bg-amber-100 text-sm text-stone-600"
      style={{ height: "320px" }}
    >
      Loading map…
    </div>
  ),
});

export default function MapPanel({ tracking }) {
  return <DeliveryMap tracking={tracking} />;
}