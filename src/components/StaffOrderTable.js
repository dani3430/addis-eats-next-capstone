import { etb, when } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import StaffOrderActions from "@/components/StaffOrderActions";

export default function StaffOrderTable({ orders, caption, emptyMessage, showActions = false }) {
  if (orders.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-amber-300 bg-white p-8 text-center text-stone-600">
        {emptyMessage}
      </p>
    );
  }

  return (
    <>
      <ul className="space-y-3 md:hidden">
        {orders.map((order) => (
          <li key={order.id} className="rounded-xl border border-amber-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-mono text-xs font-semibold text-stone-600">{order.id}</p>
                <p className="mt-1 font-semibold text-stone-900">{order.name}</p>
              </div>
              <StatusBadge status={order.status} />
            </div>
            <a
              href={`tel:${order.phone}`}
              className="mt-1 inline-flex min-h-11 items-center text-amber-800 underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700"
            >
              {order.phone}
            </a>
            <dl className="mt-3 grid gap-3 border-t border-amber-100 pt-3 text-sm">
              <div>
                <dt className="font-medium text-stone-600">Items</dt>
                <dd className="mt-1">
                  <ul className="space-y-1">
                    {order.lines.map((line) => (
                      <li key={line.id}>
                        {line.qty} × {line.name} <span className="text-stone-500">({etb(line.price * line.qty)})</span>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div>
                <dt className="font-medium text-stone-600">Delivery</dt>
                <dd className="mt-1">{order.area} · {order.address}</dd>
              </div>
              <div className="flex flex-wrap justify-between gap-2">
                <dt className="font-medium text-stone-600">Placed (EAT)</dt>
                <dd><time dateTime={order.createdAt}>{when(order.createdAt)}</time></dd>
              </div>
              <div className="flex flex-wrap justify-between gap-2">
                <dt className="font-medium text-stone-600">Total</dt>
                <dd className={`font-semibold tabular-nums ${order.status === "cancelled" ? "text-stone-500 line-through" : ""}`}>
                  {etb(order.total)}
                </dd>
              </div>
            </dl>
            {order.status === "cancelled" ? (
              <p className="mt-2 text-xs text-stone-500">Cancelled and retained in order history.</p>
            ) : showActions ? (
              <div className="mt-3 border-t border-amber-100 pt-3">
                <StaffOrderActions orderId={order.id} />
              </div>
            ) : null}
          </li>
        ))}
      </ul>
      <div
        role="region"
        aria-label={caption}
        tabIndex={0}
        className="hidden overflow-x-auto rounded-xl border border-amber-200 bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700 md:block"
      >
      <table className={`w-full text-left text-sm ${showActions ? "min-w-[1200px]" : "min-w-[1050px]"}`}>
        <caption className="p-4 text-left text-stone-600">{caption}</caption>
        <thead className="bg-amber-50 text-stone-700">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold">Order</th>
            <th scope="col" className="px-4 py-3 font-semibold">Customer</th>
            <th scope="col" className="px-4 py-3 font-semibold">Items</th>
            <th scope="col" className="px-4 py-3 font-semibold">Delivery</th>
            <th scope="col" className="px-4 py-3 font-semibold">Placed (EAT)</th>
            <th scope="col" className="px-4 py-3 font-semibold">Status</th>
            <th scope="col" className="px-4 py-3 text-right font-semibold">Total</th>
            {showActions && <th scope="col" className="px-4 py-3 font-semibold">Staff action</th>}
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-t border-amber-100 align-top odd:bg-white even:bg-amber-50/40 hover:bg-amber-100/60">
              <th scope="row" className="whitespace-nowrap px-4 py-3 font-mono text-xs font-medium text-stone-700">
                {order.id}
              </th>
              <td className="px-4 py-3">
                <p className="font-semibold text-stone-900">{order.name}</p>
                <a
                  href={`tel:${order.phone}`}
                  className="mt-1 inline-flex min-h-11 items-center text-amber-800 underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700"
                >
                  {order.phone}
                </a>
              </td>
              <td className="px-4 py-3">
                <ul className="space-y-1">
                  {order.lines.map((line) => (
                    <li key={line.id}>
                      {line.qty} × {line.name}
                      <span className="ml-1 text-stone-500">({etb(line.price * line.qty)})</span>
                    </li>
                  ))}
                </ul>
              </td>
              <td className="px-4 py-3">
                <p className="font-medium">{order.area}</p>
                <p className="mt-1 max-w-52 text-stone-600">{order.address}</p>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-stone-700">
                <time dateTime={order.createdAt}>{when(order.createdAt)}</time>
              </td>
              <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
              <td className="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums">
                <span className={order.status === "cancelled" ? "text-stone-500 line-through" : ""}>
                  {etb(order.total)}
                </span>
                {order.status === "cancelled" && (
                  <span className="mt-1 block text-xs font-normal text-stone-500">
                    Excluded from revenue
                  </span>
                )}
              </td>
              {showActions && (
                <td className="px-4 py-3">
                  {order.status === "cancelled" ? (
                    <span className="text-xs text-stone-500">Archived in history</span>
                  ) : (
                    <StaffOrderActions orderId={order.id} />
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </>
  );
}
