"use client";

import { useLiveTracking } from "@/lib/useLiveTracking";
import TrackingPanel from "./TrackingPanel";
import OrderStatus from "./OrderStatus";

export default function OrderLive({ id, initialTracking, initialOrder }) {
  const { tracking, connection } = useLiveTracking(id, initialTracking);

  return (
    <div className="space-y-5">
      <TrackingPanel tracking={tracking} connection={connection} />
      <OrderStatus
        id={id}
        initial={{ order: initialOrder }}
        liveStatus={tracking.status}
        polling={connection !== "live" && connection !== "ended"}
      />
    </div>
  );
}