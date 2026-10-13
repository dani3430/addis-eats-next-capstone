export default function MenuLoading() {
  return (
    <section aria-busy="true" aria-label="Loading the menu">
      <div className="mb-5 h-8 w-32 animate-pulse rounded bg-amber-200" />
      <div className="mb-5 flex gap-2">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="h-8 w-24 animate-pulse rounded-full bg-amber-200" />
        ))}
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div key={n} className="overflow-hidden rounded-lg border border-amber-200 bg-white">
            <div className="h-44 animate-pulse bg-amber-100" />
            <div className="space-y-2 p-4">
              <div className="h-3 w-16 animate-pulse rounded bg-amber-200" />
              <div className="h-5 w-40 animate-pulse rounded bg-amber-200" />
              <div className="h-4 w-full animate-pulse rounded bg-amber-100" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}