"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const MAX_FAILURES = 3;

// Of two snapshots, keep the newer one.
const newer = (a, b) => (!a ? b : new Date(a.at) >= new Date(b.at) ? a : b);

// Starts from the server-rendered tracking data, then keeps it current from the live stream.
export function useLiveTracking(id, initial) {
  const router = useRouter();
  const [streamed, setStreamed] = useState(null);
  const [connection, setConnection] = useState("connecting");

  useEffect(() => {
    if (initial.final) return; // delivered or cancelled: there is nothing left to follow

    let failures = 0;
    const source = new EventSource(`/api/orders/${id}/stream`);

    source.onopen = () => {
      failures = 0;
      setConnection("live");
    };

    source.onmessage = (event) => {
      const tracking = JSON.parse(event.data);
      setStreamed(tracking);
      if (tracking.final) {
        source.close(); // deliberately: nothing more will change
        setConnection("ended");
      }
    };

    source.onerror = () => {
      failures += 1;
      if (failures >= MAX_FAILURES) {
        source.close(); // stop retrying and fall back to polling
        setConnection("paused");
      } else {
        setConnection("reconnecting"); // the browser retries by itself
      }
    };

    // Cleanup on unmount: without this, every visit leaves a connection open.
    return () => source.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // The fallback: if the stream is unavailable, ask the server again every 5 seconds.
  useEffect(() => {
    if (connection !== "paused") return;
    const timer = setInterval(() => router.refresh(), 5000);
    return () => clearInterval(timer);
  }, [connection, router]);

  const tracking = newer(streamed, initial);
  return { tracking, connection: tracking.final ? "ended" : connection };
}