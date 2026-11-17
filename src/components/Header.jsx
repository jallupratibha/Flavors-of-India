import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useFavorites } from "../hooks/useFavorites.jsx";

export default function Header() {
  const { ids } = useFavorites();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");

  // keep the box in sync when the address changes (e.g. back button)
  useEffect(() => {
    if (pathname === "/dishes") setQ(params.get("q") || "");
  }, [pathname, params]);

  const submit = (e) => {
    e.preventDefault();
    navigate(q.trim() ? `/dishes?q=${encodeURIComponent(q.trim())}` : "/dishes");
  };

  return (
    <>
    <header className="hdr">
      <Link to="/" className="logo" aria-label="Flavors of India, home">
        Flavors <span>of</span> India
      </Link>
      <form className="search" role="search" onSubmit={submit}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder='Search dishes, e.g. "biryani"'
          aria-label="Search dishes"
        />
      </form>
      <nav className="nav" aria-label="Main">
        <NavLink to="/" end>Explore</NavLink>
        <NavLink to="/dishes">All dishes</NavLink>
        <NavLink to="/about">About</NavLink>
        <NavLink to="/saved" className="fav" aria-label={`Saved dishes (${ids.length})`}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-9.3-8.6C1 8.2 3 4.5 6.6 4.5c2 0 3.4 1.1 4.2 2.4h2.4c.8-1.3 2.2-2.4 4.2-2.4 3.6 0 5.6 3.7 3.9 6.9C19 15.6 12 20 12 20Z" /></svg>
          {ids.length > 0 && <i>{ids.length}</i>}
        </NavLink>
      </nav>
    </header>
      {/* phones: app-style tab bar at the bottom of the screen */}
      <nav className="tabs" aria-label="Main">
        <NavLink to="/" end><span aria-hidden="true">◎</span>Explore</NavLink>
        <NavLink to="/dishes"><span aria-hidden="true">☰</span>All dishes</NavLink>
        <NavLink to="/saved"><span aria-hidden="true">♡</span>Saved{ids.length > 0 && ` (${ids.length})`}</NavLink>
        <NavLink to="/about"><span aria-hidden="true">ⓘ</span>About</NavLink>
      </nav>
    </>
  );
}
