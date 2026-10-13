import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getRevenueByArea, getOrdersPerDay, getOrdersForStaff } from "@/lib/orders";
import { etb } from "@/lib/format";
import RevenueChart from "@/components/RevenueChart";
import OrdersPerDayChart from "@/components/OrdersPerDayChart";
import StaffOrderTable from "@/components/StaffOrderTable";

export const metadata = {
  title: "Dashboard",
  description: "Staff overview of Addis Eats revenue, order trends, and customer orders.",
};

export default async function DashboardPage() {
  const session = await getSession();

  // Authentication first: who is this?
  if (!session) {
    redirect("/signin?next=/dashboard");
  }

  // Authorisation second: staff only. This is the real check; a hidden link would not stop this page.
  if (session.role !== "staff") {
    redirect("/");
  }

  // Customer order details are loaded only after this staff-role check.
  const orders = getOrdersForStaff();
  const revenueByArea = getRevenueByArea();
  const ordersPerDay = getOrdersPerDay(14);
  const firstDay = ordersPerDay[0];
  const lastDay = ordersPerDay[ordersPerDay.length - 1];
  const totalOrders = orders.length;
  const cancelledOrders = orders.filter((order) => order.status === "cancelled").length;
  const revenueOrders = orders.filter((order) => order.status !== "cancelled");
  const totalRevenue = revenueOrders.reduce((sum, order) => sum + order.total, 0);
  const averageOrder = revenueOrders.length ? totalRevenue / revenueOrders.length : 0;

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Business overview</h1>
        <p className="mt-2 text-stone-600">
          Revenue, order activity, and customer details for the Addis Eats team.
        </p>
      </div>
      <p className="rounded-lg border border-amber-300 bg-amber-100 px-4 py-3 text-sm text-amber-950">
        Demo data: generated orders are for demonstration only and do not represent real sales.
      </p>

      <section aria-label="Business summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-xl border border-amber-200 bg-white p-5">
          <h2 className="text-sm font-medium text-stone-600">Revenue</h2>
          <p className="mt-2 text-2xl font-bold tabular-nums">{etb(totalRevenue)}</p>
          <p className="mt-1 text-xs text-stone-500">All non-cancelled orders</p>
        </article>
        <article className="rounded-xl border border-amber-200 bg-white p-5">
          <h2 className="text-sm font-medium text-stone-600">Orders</h2>
          <p className="mt-2 text-2xl font-bold tabular-nums">{totalOrders}</p>
          <p className="mt-1 text-xs text-stone-500">{cancelledOrders} cancelled</p>
        </article>
        <article className="rounded-xl border border-amber-200 bg-white p-5">
          <h2 className="text-sm font-medium text-stone-600">Average order value</h2>
          <p className="mt-2 text-2xl font-bold tabular-nums">{etb(averageOrder)}</p>
          <p className="mt-1 text-xs text-stone-500">Cancelled orders excluded</p>
        </article>
        <article className="rounded-xl border border-amber-200 bg-white p-5">
          <h2 className="text-sm font-medium text-stone-600">Last 14 days</h2>
          <p className="mt-2 text-2xl font-bold tabular-nums">
            {ordersPerDay.reduce((sum, day) => sum + day.orders, 0)}
          </p>
          <p className="mt-1 text-xs text-stone-500">Non-cancelled orders</p>
        </article>
      </section>

      <section aria-labelledby="revenue-heading">
        <h2 id="revenue-heading" className="text-xl font-semibold">Revenue by neighbourhood</h2>
        <p className="mb-3 mt-1 text-sm text-stone-600">
          All orders to date; cancelled orders are excluded. Values are in ETB.
        </p>
        <div className="rounded-xl border border-amber-200 bg-white p-3">
          <RevenueChart data={revenueByArea} />
        </div>
        <div
          role="region"
          aria-label="Revenue and order count by neighbourhood"
          tabIndex={0}
          className="mt-4 overflow-x-auto rounded-xl border border-amber-200 bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700"
        >
          <table className="w-full min-w-[360px] text-xs sm:text-sm">
            <caption className="p-3 text-left text-stone-600 sm:p-4">Revenue and order count by neighbourhood</caption>
            <thead className="bg-amber-50 text-left">
              <tr>
                <th scope="col" className="px-3 py-3 font-semibold sm:px-4">Neighbourhood</th>
                <th scope="col" className="px-3 py-3 text-right font-semibold sm:px-4">Orders</th>
                <th scope="col" className="px-3 py-3 text-right font-semibold sm:px-4">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {revenueByArea.map((row) => (
                <tr key={row.area} className="border-t border-amber-100 odd:bg-white even:bg-amber-50/40">
                  <th scope="row" className="px-3 py-3 text-left font-medium sm:px-4">{row.area}</th>
                  <td className="px-3 py-3 text-right tabular-nums sm:px-4">{row.orders}</td>
                  <td className="px-3 py-3 text-right tabular-nums sm:px-4">{etb(row.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="orders-chart-heading">
        <h2 id="orders-chart-heading" className="text-xl font-semibold">
          Order volume, {firstDay.label} – {lastDay.label} {lastDay.date.slice(0, 4)}
        </h2>
        <p className="mb-3 mt-1 text-sm text-stone-600">
          Daily non-cancelled orders. Days are counted in UTC.
        </p>
        <div className="rounded-xl border border-amber-200 bg-white p-3">
          <OrdersPerDayChart data={ordersPerDay} />
        </div>
        <div
          role="region"
          aria-label="Daily order volume shown in the chart"
          tabIndex={0}
          className="mt-4 overflow-x-auto rounded-xl border border-amber-200 bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700"
        >
          <table className="w-full min-w-[300px] text-sm">
            <caption className="p-3 text-left text-stone-600 sm:p-4">Daily order volume shown in the chart</caption>
            <thead className="bg-amber-50 text-left">
              <tr>
                <th scope="col" className="px-3 py-3 font-semibold sm:px-4">Day</th>
                <th scope="col" className="px-3 py-3 text-right font-semibold sm:px-4">Orders</th>
              </tr>
            </thead>
            <tbody>
              {ordersPerDay.map((day) => (
                <tr key={day.date} className="border-t border-amber-100 odd:bg-white even:bg-amber-50/40">
                  <th scope="row" className="px-3 py-3 text-left font-medium sm:px-4">{day.label}</th>
                  <td className="px-3 py-3 text-right tabular-nums sm:px-4">{day.orders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="all-orders-heading">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 id="all-orders-heading" className="text-xl font-semibold">Customer orders</h2>
            <p className="mt-1 text-sm text-stone-600">
              {orders.length} orders, newest first. Customer contact and delivery information is staff-only.
            </p>
          </div>
          <a
            href="/api/staff/orders/export"
            download
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-950 transition hover:bg-amber-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800"
          >
            Export for Excel (.csv)
          </a>
        </div>
        <StaffOrderTable
          orders={orders}
          caption="All customer orders, including items, delivery details, status, and order time in Addis Ababa time (EAT)."
          emptyMessage="No orders have been placed yet."
          showActions
        />
      </section>
    </section>
  );
}