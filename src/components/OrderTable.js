import Link from "next/link";
import { etb, when } from "@/lib/format";
import StatusBadge from "./StatusBadge";


const COLUMNS = [
  { key: "order", label: "Order" },
  { key: "date", label: "Date" },
  { key: "area", label: "Neighbourhood" },
  { key: "status", label: "Status" },
  { key: "total", label: "Total", numeric: true },
];

// A column header that is also a link: clicking it sorts, clicking it again reverses.
function SortableHeader({ column, sort, dir }) {
  const active = sort === column.key;
  const nextDir = active && dir === "asc" ? "desc" : "asc";
  const ariaSort = active ? (dir === "asc" ? "ascending" : "descending") : undefined;

  return (
    <th
      scope="col"
      aria-sort={ariaSort}
      className={`px-3 py-2 font-semibold ${column.numeric ? "text-right" : ""}`}
    >
      <Link
        href={`/orders?sort=${column.key}&dir=${nextDir}`}
        className="inline-flex items-center gap-1 hover:text-amber-700"
      >
        {column.label}
        <span aria-hidden="true">{active ? (dir === "asc" ? "▲" : "▼") : ""}</span>
      </Link>
    </th>
  );
}

export default function OrderTable({ orders, sort, dir }) {
  const sortedBy = COLUMNS.find((column) => column.key === sort)?.label ?? "Date";

  return (
    // On a narrow screen the table scrolls sideways inside this labelled box.
    <div
      role="region"
      aria-label="Your orders"
      tabIndex={0}
      className="overflow-x-auto rounded-xl border border-amber-200 bg-white"
    >
      <table className="w-full min-w-[34rem] text-sm">
        <caption className="p-3 text-left text-stone-600">
          Your orders, sorted by {sortedBy} ({dir === "asc" ? "ascending" : "descending"})
        </caption>
        <thead>
          <tr className="border-y border-amber-200 bg-amber-50 text-left">
            {COLUMNS.map((column) => (
              <SortableHeader key={column.key} column={column} sort={sort} dir={dir} />
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const cancelled = order.status === "cancelled";
            return (
              <tr
                key={order.id}
                className={`border-b border-amber-100 ${
                  cancelled ? "bg-stone-100 text-stone-500" : ""
                }`}
              >
                <th scope="row" className="px-3 py-2 text-left font-medium">
                  <Link
                    href={`/orders/${order.id}`}
                    className="underline decoration-amber-400 underline-offset-2 hover:text-amber-700"
                  >
                    {order.id}
                  </Link>
                </th>
                   <td className="px-3 py-2">
                     <time dateTime={order.createdAt}>{when(order.createdAt)}</time>
                  </td>
                <td className="px-3 py-2">{order.area ?? "—"}</td>
                <td className="px-3 py-2">
                  <StatusBadge status={order.status} />
                </td>
                <td
                  className={`px-3 py-2 text-right font-semibold tabular-nums ${
                    cancelled ? "line-through" : ""
                  }`}
                >
                  {etb(order.total)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}