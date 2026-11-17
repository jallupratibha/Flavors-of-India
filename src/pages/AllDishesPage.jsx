import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import DishCard, { CardSkeleton } from "../components/DishCard.jsx";
import Filters, { toQuery } from "../components/Filters.jsx";
import useApi from "../hooks/useApi.js";
import { api } from "../lib/api.js";

export default function AllDishesPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const region = params.get("region") || "";
  const filters = { diet: params.get("diet") || "", spicy: params.get("spicy") || "", course: params.get("course") || "" };
  const query = useMemo(() => ({ q, region, ...toQuery(filters) }), [q, region, filters.diet, filters.spicy, filters.course]); // eslint-disable-line react-hooks/exhaustive-deps
  const res = useApi(() => api.dishes(query), JSON.stringify(query));

  const update = (next) => {
    const p = new URLSearchParams(params);
    Object.entries(next).forEach(([k, v]) => (v ? p.set(k, v) : p.delete(k)));
    setParams(p, { replace: true });
  };

  return (
    <div className="page">
      <p className="kicker">{q ? "Search" : "Every dish"}</p>
      <h1 className="page-title">{q ? <>What to eat: “{q}”</> : "All dishes"}</h1>
      <p className="lead" aria-live="polite">
        {res.data ? `${res.data.total} ${res.data.total === 1 ? "dish" : "dishes"}` : "Loading…"}
        {q && res.data && (
          <button type="button" className="link-btn" onClick={() => update({ q: "" })}>Clear search</button>
        )}
      </p>
      <div className="region-tabs" role="group" aria-label="Region">
        {[["", "All India"], ["north", "North"], ["west", "West"], ["central", "Central"], ["east", "East"], ["northeast", "North-East"], ["south", "South"]].map(([v, l]) => (
          <button key={l} type="button" className={`chip ${region === v ? "on" : ""}`} aria-pressed={region === v} onClick={() => update({ region: v })}>
            {l}
          </button>
        ))}
      </div>
      <Filters value={filters} onChange={update} />
      <div className="grid wide" aria-busy={res.loading}>
        {res.loading && !res.data ? (
          <CardSkeleton count={8} />
        ) : res.error ? (
          <p className="error">Couldn't load dishes. Please try again.</p>
        ) : res.data.dishes.length ? (
          res.data.dishes.map((d, i) => <DishCard key={d.id} dish={d} index={Math.min(i, 12)} showState />)
        ) : (
          <div className="empty">
            <p>No dishes found{q ? ` for “${q}”` : ""}. Try another word, like “dosa” or “halwa”.</p>
          </div>
        )}
      </div>
    </div>
  );
}
