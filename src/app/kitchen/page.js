import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { getOrdersForStaff } from "@/lib/orders";
import StaffOrderTable from "@/components/StaffOrderTable";

export const metadata = {
  title: "Kitchen",
  description: "Staff queue of incoming Addis Eats orders.",
};

export default async function KitchenPage() {
  const session = await getSession();

  // Authentication first: who is this?
  if (!session) {
    redirect("/signin?next=/kitchen");
  }

  // Authorisation second, a separate question: are they staff?
  // This is the real check — a hidden link alone would not stop this page from rendering.
  if (session.role !== "staff") {
    redirect("/");
  }

  const allOrders = getOrdersForStaff();
  const activeOrders = allOrders.filter(
    (order) => order.status === "received" || order.status === "preparing"
  );

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Kitchen queue</h1>
        <p className="mt-2 text-stone-600">
          Incoming orders for the kitchen team. Signed in as <strong>{session.name}</strong>.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-xl border border-amber-200 bg-white p-5">
          <h2 className="text-sm font-medium text-stone-600">Orders to prepare</h2>
          <p className="mt-2 text-2xl font-bold tabular-nums">{activeOrders.length}</p>
        </article>
        <article className="rounded-xl border border-amber-200 bg-white p-5">
          <h2 className="text-sm font-medium text-stone-600">All orders</h2>
          <p className="mt-2 text-2xl font-bold tabular-nums">{allOrders.length}</p>
        </article>
      </div>
      <section aria-labelledby="queue-heading">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 id="queue-heading" className="text-xl font-semibold">Received and preparing</h2>
          <Link
            href="/kitchen"
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-900 transition hover:bg-amber-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700"
          >
            Refresh queue
          </Link>
        </div>
        <StaffOrderTable
          orders={activeOrders}
          caption="Open kitchen orders, newest first. Times are shown in Addis Ababa time (EAT)."
          emptyMessage="The kitchen queue is clear. No received or preparing orders right now."
        />
      </section>
    </section>
  );
}