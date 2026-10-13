"use client";

import { useFavorites } from "./Providers";

export default function FavoriteButton({ dishId, dishName, className = "" }) {
  const { favoriteIds, favoritesLoaded, toggleFavorite } = useFavorites();
  const isFavorite = favoriteIds.includes(dishId);

  return (
    <button
      type="button"
      aria-label={`${isFavorite ? "Remove" : "Add"} ${dishName} ${isFavorite ? "from" : "to"} favorites`}
      aria-pressed={isFavorite}
      disabled={!favoritesLoaded}
      onClick={() => toggleFavorite(dishId)}
      className={`inline-flex items-center justify-center rounded-full border border-amber-200 bg-white text-xl text-rose-700 shadow transition hover:bg-rose-50 disabled:cursor-wait disabled:opacity-60 ${className}`}
    >
      <span aria-hidden="true">{isFavorite ? "♥" : "♡"}</span>
    </button>
  );
}
