export default function OrdersLoading() {
  return (
    <section aria-busy="true" aria-label="Loading your orders">
      <div className="mb-5 h-8 w-40 animate-pulse rounded bg-amber-200" />
      <div className="overflow-hidden rounded-xl border border-amber-200 bg-white">
        <div className="h-10 animate-pulse bg-amber-100" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse border-t border-amber-100 bg-amber-50" />
        ))}
      </div>
      <p className="sr-only">Loading your orders…</p>
    </section>
  );
}