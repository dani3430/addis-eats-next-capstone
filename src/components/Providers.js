"use client";

import { createContext, useContext, useEffect, useReducer } from "react";
import { cartReducer, initialCart } from "@/lib/cart";

const CartContext = createContext(null);
const FavoritesContext = createContext(null);
const STORAGE_KEY = "addis-eats-cart";
const FAVORITES_STORAGE_KEY = "addis-eats-favorites";

function favoritesReducer(state, action) {
  if (action.type === "load") {
    return { ids: action.ids, loaded: true };
  }
  if (action.type === "toggle") {
    return {
      ...state,
      ids: state.ids.includes(action.id)
        ? state.ids.filter((id) => id !== action.id)
        : [...state.ids, action.id],
    };
  }
  return state;
}

export default function Providers({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialCart);
  const [favorites, favoritesDispatch] = useReducer(favoritesReducer, {
    ids: [],
    loaded: false,
  });

  // Read the saved cart once after mount, so server and first client render match.
  useEffect(() => {
    let saved = [];
    try {
      saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      // ignore a corrupted cart
    }
    dispatch({ type: "load", items: saved });
  }, []);

  useEffect(() => {
    let ids = [];
    try {
      const saved = JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY) || "[]");
      if (Array.isArray(saved)) {
        ids = saved.filter((id) => typeof id === "string");
      }
    } catch {
      // Ignore inaccessible or malformed browser storage.
    }
    favoritesDispatch({ type: "load", ids });
  }, []);

  useEffect(() => {
    if (favorites.loaded) {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites.ids));
    }
  }, [favorites.ids, favorites.loaded]);

  // Write to localStorage: this is the effect's real job, syncing to an external system.
  useEffect(() => {
    if (state.loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    }
  }, [state.items, state.loaded]);

  return (
    <CartContext.Provider value={{ items: state.items, loaded: state.loaded, dispatch }}>
      <FavoritesContext.Provider
        value={{
          favoriteIds: favorites.ids,
          favoritesLoaded: favorites.loaded,
          toggleFavorite(id) {
            favoritesDispatch({ type: "toggle", id });
          },
        }}
      >
        {children}
      </FavoritesContext.Provider>
    </CartContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used inside <Providers>");
  }
  return context;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside <Providers>");
  }
  return context;
}