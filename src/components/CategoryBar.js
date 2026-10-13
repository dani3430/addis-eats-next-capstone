"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { useDebouncedValue } from "@/lib/useDebounce";
import DishCard from "./DishCard";

export default function CategoryBar({ categories, initialPage }) {
  const router = useRouter();
  const pathname = usePathname();

  const [selected, setSelected] = useState("All");
  const [term, setTerm] = useState("");
  const [page, setPage] = useState(1);
  const debounced = useDebouncedValue(term, 300);

  const options = ["All", ...categories];

  const key = `/api/dishes?page=${page}&category=${encodeURIComponent(selected)}&q=${encodeURIComponent(debounced)}`;
  const isDefaultView = page === 1 && selected === "All" && debounced === "";

  useEffect(() => {
    function syncPageFromUrl() {
      const pageFromUrl = new URLSearchParams(window.location.search).get("page");
      setPage(Math.max(1, Number(pageFromUrl) || 1));
    }

    syncPageFromUrl();
    window.addEventListener("popstate", syncPageFromUrl);
    return () => window.removeEventListener("popstate", syncPageFromUrl);
  }, []);

  const { data, isLoading, isValidating } = useSWR(key, fetcher, {
    keepPreviousData: true,
    fallbackData: isDefaultView ? initialPage : undefined,
  });

  function goToPage(nextPage) {
    const params = new URLSearchParams(window.location.search);
    if (nextPage <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(nextPage));
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    setPage(Math.max(1, nextPage));
  }

  function handleCategoryChange(category) {
    setSelected(category);
    goToPage(1); // a new filter starts back at page 1
  }

  function handleSearchChange(value) {
    setTerm(value);
    goToPage(1);
  }

  return (
    <div>
      <div className="mb-4">
        <label htmlFor="dish-search" className="sr-only">
          Search dishes
        </label>
        <div className="relative">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
          >
            🔍
          </span>
          <input
            id="dish-search"
            type="search"
            value={term}
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder="Search dishes by name or ingredient…"
            className="w-full rounded-lg border border-amber-300 bg-white py-2.5 pl-10 pr-4 transition"
          />
        </div>
      </div>

      <div role="group" aria-label="Filter by category" className="mb-5 flex flex-wrap gap-2">
        {options.map((category) => (
          <button
            key={category}
            type="button"
            aria-pressed={selected === category}
            onClick={() => handleCategoryChange(category)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              selected === category
                ? "border-amber-600 bg-amber-600 text-white"
                : "border-amber-300 bg-white text-stone-700 hover:bg-amber-100"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-stone-500">Loading dishes…</p>}
      {!isLoading && data?.dishes.length === 0 && (
        <p className="text-stone-500">
          {debounced ? `No dishes match "${debounced}".` : "No dishes in this category."}
        </p>
      )}

      <div
        className={`grid gap-5 transition-opacity duration-150 sm:grid-cols-2 lg:grid-cols-3 ${
          isValidating ? "opacity-60" : "opacity-100"
        }`}
      >
        {data?.dishes.map((dish, index) => (
          <DishCard key={dish.id} dish={dish} priority={index === 0} />
        ))}
      </div>

      {data && data.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
            className="rounded-lg border border-amber-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Previous
          </button>
          <span className="text-sm text-stone-600">
            Page {data.page} of {data.totalPages}
          </span>
          <button
            type="button"
            onClick={() => goToPage(page + 1)}
            disabled={page >= data.totalPages}
            className="rounded-lg border border-amber-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}