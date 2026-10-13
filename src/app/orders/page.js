import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getOrdersForUser, ORDERS_PAGE_SIZE } from "@/lib/orders";
import OrderTable from "@/components/OrderTable";
import Pager from "@/components/Pager";

export const metadata = {
  title: "Your orders",
  description: "See the orders you have placed with Addis Eats.",
};

const VALID_SORTS = ["order", "date", "area", "status", "total"];

export default async function OrdersPage({ searchParams }) {
  const session = await getSession();
  if (!session) {
    redirect("/signin?next=/orders");
  }

  // The URL is typed by whoever opens it, so anything unexpected falls back to a safe default.
  const params = await searchParams;
  const sort = VALID_SORTS.includes(params.sort) ? params.sort : "date";
  const dir = params.dir === "asc" ? "asc" : "desc";
  const requestedPage = Number.parseInt(params.page ?? "1", 10);

  // Demo switches, so each state can be shown on demand. They only change this person's own view.
  const demo = params.demo;
  if (demo === "slow") {
    await new Promise((resolve) => setTimeout(resolve, 3000)); // lets loading.js show
  }
  if (demo === "error") {
    throw new Error("Demo: a simulated failure while loading orders"); // caught by error.js
  }

  const { rows, total, page, pages } =
    demo === "empty"
      ? { rows: [], total: 0, page: 1, pages: 1 }
      : getOrdersForUser(session.id, {
          sort,
          dir,
          page: Number.isInteger(requestedPage) ? requestedPage : 1,
        });

  return (
    <section>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Your orders</h1>
        {total > 0 && (
          <a
            href="/api/orders/export"
            download
            className="rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm font-medium transition hover:bg-amber-100"
          >
            Export all orders (CSV)
          </a>
        )}
      </div>
      {total === 0 ? (
        <div className="rounded-xl border border-dashed border-amber-300 bg-white p-8 text-center">
          <p className="text-lg font-semibold">No orders yet</p>
          <p className="mt-1 text-stone-600">
            When you place an order, it will show up here so you can follow it.
          </p>
          <Link
            href="/menu"
            className="mt-4 inline-block rounded-lg bg-amber-600 px-4 py-2 font-medium text-white transition hover:bg-amber-700"
          >
            Browse the menu to place your first order
          </Link>
        </div>
      ) : (
        <>
          <OrderTable orders={rows} sort={sort} dir={dir} />
          <Pager
            page={page}
            pages={pages}
            total={total}
            pageSize={ORDERS_PAGE_SIZE}
            sort={sort}
            dir={dir}
          />
        </>
      )}

      <details className="mt-8 text-sm text-stone-600">
        <summary className="cursor-pointer font-medium">Demo the other states</summary>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <Link href="/orders?demo=slow" prefetch={false} className="underline">
              Loading (a 3-second delay)
            </Link>
          </li>
          <li>
            <Link href="/orders?demo=empty" prefetch={false} className="underline">
              Empty (as a brand-new customer)
            </Link>
          </li>
          <li>
            <Link href="/orders?demo=error" prefetch={false} className="underline">
              Error (a simulated failure)
            </Link>
          </li>
        </ul>
      </details>
    </section>
  );
}