"use client";

import Link from "next/link";
import { useFavorites } from "./Providers";
import DishList from "./DishList";

export default function FavoriteDishes({ dishes }) {
  const { favoriteIds, favoritesLoaded } = useFavorites();

  if (!favoritesLoaded) {
    return <p role="status" className="text-stone-600">Loading your favorites…</p>;
  }

  const favorites = dishes.filter((dish) => favoriteIds.includes(dish.id));

  if (favorites.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-amber-300 bg-white p-8 text-center">
        <p className="text-lg font-semibold">No favorites saved yet</p>
        <p className="mt-2 text-stone-600">
          Tap the heart on a dish to keep it close.
        </p>
        <Link
          href="/menu"
          className="mt-4 inline-flex items-center justify-center rounded-lg bg-amber-600 px-5 py-3 font-semibold text-white transition hover:bg-amber-700"
        >
          Explore the menu
        </Link>
      </div>
    );
  }

  return <DishList dishes={favorites} />;
}
