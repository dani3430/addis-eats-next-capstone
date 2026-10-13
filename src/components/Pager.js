import Link from "next/link";

function pageHref(page, sort, dir) {
  const params = new URLSearchParams({ sort, dir });
  if (page > 1) params.set("page", String(page));
  return `/orders?${params.toString()}`;
}

const linkClass =
  "justify-center rounded-lg border border-amber-300 bg-white px-3 font-medium transition hover:bg-amber-100";
const disabledClass =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-stone-200 bg-stone-100 px-3 text-stone-400";

export default function Pager({ page, pages, total, pageSize, sort, dir }) {
  if (pages <= 1) return null;

  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);
  const numbers = Array.from({ length: pages }, (_, i) => i + 1);

  return (
    <nav
      aria-label="Orders pages"
      className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm"
    >
      <p className="text-stone-600">
        Showing {first}–{last} of {total} orders
      </p>
      <ul className="flex flex-wrap items-center gap-1">
        <li>
          {page > 1 ? (
            <Link href={pageHref(page - 1, sort, dir)} rel="prev" className={linkClass}>
              Previous
            </Link>
          ) : (
            <span aria-disabled="true" className={disabledClass}>
              Previous
            </span>
          )}
        </li>
        {numbers.map((n) => (
          <li key={n}>
            {n === page ? (
              <span
                aria-current="page"
                                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-amber-600 bg-amber-600 px-3 font-semibold text-white"
              >
                {n}
              </span>
            ) : (
              <Link href={pageHref(n, sort, dir)} className={linkClass}>
                {n}
              </Link>
            )}
          </li>
        ))}
        <li>
          {page < pages ? (
            <Link href={pageHref(page + 1, sort, dir)} rel="next" className={linkClass}>
              Next
            </Link>
          ) : (
            <span aria-disabled="true" className={disabledClass}>
              Next
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}