import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

// Favourites live in the browser (localStorage), so no account is needed.
const KEY = "foi:favorites";
const Ctx = createContext(null);

const load = () => {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
};

export function FavoritesProvider({ children }) {
  const [ids, setIds] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(ids));
    } catch {
      /* private mode: favourites still work for this visit */
    }
  }, [ids]);

  // keep several open tabs in sync
  useEffect(() => {
    const onStorage = (e) => e.key === KEY && setIds(load());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggle = useCallback(
    (id) => setIds((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [id, ...cur])),
    []
  );
  const value = useMemo(() => ({ ids, has: (id) => ids.includes(id), toggle }), [ids, toggle]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useFavorites = () => useContext(Ctx);
