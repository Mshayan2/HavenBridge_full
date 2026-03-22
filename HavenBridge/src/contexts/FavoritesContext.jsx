/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { addFavorite, listMyFavoriteIds, removeFavoriteByProperty } from "../api/favorites";

const FavoritesContext = createContext(null);

function getToken() {
  const t = localStorage.getItem("token");
  if (!t) return null;
  const s = String(t).trim();
  if (!s || s === "null" || s === "undefined") return null;
  return s;
}

export function FavoritesProvider({ children }) {
  const [favoriteIds, setFavoriteIds] = useState(() => new Set());
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setFavoriteIds(new Set());
      return;
    }

    setLoading(true);
    try {
      const out = await listMyFavoriteIds();
      const ids = (out?.propertyIds || []).map(String);
      setFavoriteIds(new Set(ids));
    } catch (e) {
      console.error("Failed to load favorites", e);
      // If auth fails, clear (token might be stale)
      setFavoriteIds(new Set());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    const onStorage = (e) => {
      if (e.key === "token" || e.key === "user") {
        refresh();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refresh]);

  const isFavorite = useCallback(
    (propertyId) => {
      if (!propertyId) return false;
      return favoriteIds.has(String(propertyId));
    },
    [favoriteIds]
  );

  const toggleFavorite = useCallback(
    async (propertyId) => {
      const token = getToken();
      if (!token) {
        // Keep behavior consistent with the rest of the app: redirect to signin
        window.location.assign(`/signin`);
        return;
      }

      const id = String(propertyId);
      const currently = favoriteIds.has(id);

      // Optimistic UI
      const next = new Set(favoriteIds);
      if (currently) next.delete(id);
      else next.add(id);
      setFavoriteIds(next);

      try {
        if (currently) {
          await removeFavoriteByProperty(id);
        } else {
          await addFavorite(id);
        }
      } catch (e) {
        console.error("Failed to toggle favorite", e);
        // Revert on error
        setFavoriteIds(new Set(favoriteIds));
      }
    },
    [favoriteIds]
  );

  const value = useMemo(
    () => ({
      loading,
      favoriteIds,
      isFavorite,
      toggleFavorite,
      refresh,
    }),
    [loading, favoriteIds, isFavorite, toggleFavorite, refresh]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
