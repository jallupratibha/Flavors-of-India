import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api.js";

/** "Where are you going?" box with suggestions for states and towns. */
export default function PlaceSearch({ onPick }) {
  const navigate = useNavigate();
  const [places, setPlaces] = useState([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listId = useId();
  const box = useRef(null);

  useEffect(() => {
    api.places().then(setPlaces).catch(() => setPlaces([]));
  }, []);

  // close when clicking outside
  useEffect(() => {
    const close = (e) => box.current && !box.current.contains(e.target) && setOpen(false);
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  const matches = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return places.filter((p) => ["Hyderabad", "Tirupati", "Lucknow", "Madurai", "Kolkata", "Jaipur"].includes(p.name));
    return places
      .filter((p) => p.name.toLowerCase().includes(s))
      .sort((a, b) => a.name.toLowerCase().indexOf(s) - b.name.toLowerCase().indexOf(s))
      .slice(0, 7);
  }, [q, places]);

  const pick = (p) => {
    setOpen(false);
    setQ("");
    onPick(p.stateId, p.cityId || "");
  };

  const submit = (e) => {
    e.preventDefault();
    if (open && matches[active]) return pick(matches[active]);
    if (q.trim()) navigate(`/dishes?q=${encodeURIComponent(q.trim())}`);
  };

  const onKey = (e) => {
    if (e.key === "ArrowDown") (e.preventDefault(), setOpen(true), setActive((a) => Math.min(a + 1, matches.length - 1)));
    if (e.key === "ArrowUp") (e.preventDefault(), setActive((a) => Math.max(a - 1, 0)));
    if (e.key === "Escape") setOpen(false);
  };

  return (
    <form className="place" role="search" onSubmit={submit} ref={box}>
      <label htmlFor={`${listId}-in`} className="place-label">Where are you going?</label>
      <div className="place-row">
        <input
          id={`${listId}-in`}
          value={q}
          onChange={(e) => (setQ(e.target.value), setOpen(true), setActive(0))}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
          placeholder="A state or city, e.g. Hyderabad, Goa"
          autoComplete="off"
          role="combobox"
          aria-expanded={open && matches.length > 0}
          aria-controls={listId}
          aria-activedescendant={open && matches[active] ? `${listId}-${active}` : undefined}
        />
        <button type="submit" className="btn">Find dishes</button>
      </div>
      {open && matches.length > 0 && (
        <ul className="place-list" id={listId} role="listbox">
          {!q.trim() && <li className="place-hint" aria-hidden="true">Popular food cities</li>}
          {matches.map((p, i) => (
            <li
              key={p.type + p.name}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              className={i === active ? "on" : ""}
              onPointerDown={(e) => (e.preventDefault(), pick(p))}
              onMouseEnter={() => setActive(i)}
            >
              <span className="place-ic" aria-hidden="true">{p.type === "state" ? "◎" : "📍"}</span>
              <span>
                <b>{p.name}</b>
                <small>{p.type === "state" ? `State · ${p.count} dishes` : `City in ${p.state} · ${p.count} ${p.count === 1 ? "dish" : "dishes"}`}</small>
              </span>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
