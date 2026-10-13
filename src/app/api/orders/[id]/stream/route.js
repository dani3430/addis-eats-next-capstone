import { getSession } from "@/lib/session";
import { getOwnedTracking } from "@/lib/orders";

export const dynamic = "force-dynamic";

const UPDATE_EVERY_MS = 3000;

// Development only: a count of open streams, so you can check that they close.
globalThis.__openStreams ??= 0;
function logOpenStreams(change, id) {
  globalThis.__openStreams += change;
  if (process.env.NODE_ENV !== "production") {
    console.log(`[stream] ${change > 0 ? "opened" : "closed"} ${id}; open now: ${globalThis.__openStreams}`);
  }
}

export async function GET(request, { params }) {
  const { id } = await params;

  // Authentication first: who is asking?
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Not signed in" }, { status: 401 });
  }

  // Authorisation second: is this THEIR order? The middleware does not cover /api, so this is the real check.
  const first = getOwnedTracking(id, session.id);
  if (!first.ok) {
    return Response.json({ error: first.error }, { status: first.status });
  }

  const encoder = new TextEncoder();
  let timer;
  let closed = false;

  const stream = new ReadableStream({
    start(controller) {
      function close() {
        if (closed) return; // runs once, however it was triggered
        closed = true;
        clearInterval(timer);
        logOpenStreams(-1, id);
        try {
          controller.close();
        } catch {
          // already closed by the browser leaving
        }
      }

      function send() {
        const result = getOwnedTracking(id, session.id);
        if (!result.ok) {
          close();
          return;
        }
        // The message format is strict: "data: ", the payload, then TWO newlines.
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(result.tracking)}\n\n`));
        if (result.tracking.final) {
          close(); // delivered or cancelled: nothing more will change
        }
      }

      logOpenStreams(1, id);
      controller.enqueue(encoder.encode(`retry: ${UPDATE_EVERY_MS}\n\n`)); // reconnect delay if the line drops
      send(); // the first message goes out straight away
      if (!closed) {
        timer = setInterval(send, UPDATE_EVERY_MS);
      }

      // The visitor navigated away or closed the tab: stop, or the timer runs forever.
      request.signal.addEventListener("abort", close);
    },
    cancel() {
      clearInterval(timer);
      if (!closed) {
        closed = true;
        logOpenStreams(-1, id);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}