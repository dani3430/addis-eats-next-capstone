"use client";

import { useFavorites } from "./Providers";

export default function FavoritesBadge() {
  const { favoriteIds, favoritesLoaded } = useFavorites();

  if (!favoritesLoaded || favoriteIds.length === 0) {
    return null;
  }

  return (
    <>
      <span
        aria-hidden="true"
        className="ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-rose-700 px-1.5 text-xs font-bold text-white"
      >
        {favoriteIds.length}
      </span>
      <span className="sr-only">
        {favoriteIds.length === 1
          ? "1 favorite saved"
          : `${favoriteIds.length} favorites saved`}
      </span>
    </>
  );
}
