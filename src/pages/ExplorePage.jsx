import { useMemo, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import IndiaMap from "../components/IndiaMap.jsx";
import PlaceSearch from "../components/PlaceSearch.jsx";
import CityCards from "../components/CityCards.jsx";
import DishCard, { CardSkeleton } from "../components/DishCard.jsx";
import Filters, { toQuery } from "../components/Filters.jsx";
import useApi from "../hooks/useApi.js";
import { api } from "../lib/api.js";

const DEFAULT_STATE = "ap";
const REGION = { north: "North India", south: "South India", east: "East India", west: "West India", northeast: "North-East India", central: "Central India" };

export default function ExplorePage() {
  const [params, setParams] = useSearchParams();
  const panel = useRef(null);
  const stateId = params.get("state") || DEFAULT_STATE;
  const cityId = params.get("city") || "";
  const filters = { diet: params.get("diet") || "", spicy: params.get("spicy") || "", course: params.get("course") || "" };
  const filtered = Boolean(filters.diet || filters.spicy || filters.course);

  const states = useApi(() => api.states(), "states");
  const query = useMemo(() => ({ state: stateId, ...toQuery(filters) }), [stateId, filters.diet, filters.spicy, filters.course]); // eslint-disable-line react-hooks/exhaustive-deps
  const dishes = useApi(() => api.dishes(query), JSON.stringify(query));

  const state = states.data?.find((s) => s.id === stateId);
  const city = cityId === "none" ? { id: "none", name: `Across ${state?.name ?? ""}`, blurb: "Dishes eaten all over the state." } : state?.cities.find((c) => c.id === cityId);

  const update = (next) => {
    const p = new URLSearchParams(params);
    Object.entries(next).forEach(([k, v]) => (v ? p.set(k, v) : p.delete(k)));
    setParams(p, { replace: !("state" in next || "city" in next) });
  };
  // on phones and tablets the dishes are below the map, so bring them into view
  const toPanel = () => {
    if (window.innerWidth < 1100) setTimeout(() => panel.current?.scrollIntoView({ behavior: "smooth" }), 60);
  };
  // choosing a state or city keeps the filters
  const choose = (id, c = "") => {
    update({ state: id, city: c });
    toPanel();
  };

  const total = states.data ? states.data.reduce((n, s) => n + s.count, 0) : 0;
  const all = dishes.data?.dishes ?? [];
  const shown = city ? all.filter((d) => (city.id === "none" ? !d.cityId : d.cityId === city.id)) : all;
  const mustTry = shown.filter((d) => d.mustTry);
  const more = shown.filter((d) => !d.mustTry);
  const cityTabs = state
    ? [...state.cities, ...(state.count > state.cities.reduce((n, c) => n + c.count, 0) ? [{ id: "none", name: "Across the state" }] : [])]
    : [];
  const grid = (list, offset = 0) => list.map((d, i) => <DishCard key={d.id} dish={d} index={i + offset} />);

  return (
    <div className="explore">
      <section className="explore-left">
        <p className="kicker">A travel food guide · {states.data?.length ?? 36} states & UTs · {total || "300+"} dishes</p>
        <h1 className="display">
          Going somewhere?
          <br />
          <em>Eat</em> like a local.
        </h1>
        <p className="lead">Find the traditional dishes you must try in every state and city, then order them in a tap.</p>
        <PlaceSearch onPick={choose} />
        <p className="map-hint">Or tap a state on the map</p>
        {states.data && <IndiaMap available={states.data} selected={stateId} onSelect={(id) => choose(id)} />}
        {states.data && (
          <label className="state-select">
            <span>Or choose a state</span>
            <select value={stateId} onChange={(e) => choose(e.target.value)}>
              {states.data.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.count})</option>
              ))}
            </select>
          </label>
        )}
      </section>

      <section className="panel" aria-labelledby="state-title" ref={panel}>
        {states.error ? (
          <p className="error">Couldn't load the states. Please refresh the page.</p>
        ) : city && state ? (
          /* ── a city ── */
          <>
            <div className="panel-head" key={`${stateId}-${cityId}`}>
              <div>
                <button type="button" className="crumb-back" onClick={() => update({ city: "" })}>
                  ← All of {state.name}
                </button>
                <h2 id="state-title">{city.name}</h2>
                <p className="blurb">{city.blurb}</p>
              </div>
              <span className="count">{shown.length} {shown.length === 1 ? "dish" : "dishes"}</span>
            </div>
            {cityTabs.length > 1 && (
              <div className="city-tabs" role="group" aria-label={`Other cities in ${state.name}`}>
                {cityTabs.map((c) => (
                  <button key={c.id} type="button" className={`chip ${c.id === cityId ? "on" : ""}`} aria-pressed={c.id === cityId} onClick={() => update({ city: c.id })}>
                    {c.name}
                  </button>
                ))}
              </div>
            )}
            <Filters value={filters} onChange={update} />
            {dishes.loading && !dishes.data ? (
              <div className="grid"><CardSkeleton /></div>
            ) : shown.length ? (
              <div className="grid">{grid([...mustTry, ...more])}</div>
            ) : (
              <div className="empty">
                <p>No dishes match these filters in {city.name}.</p>
                <button type="button" className="btn ghost" onClick={() => update({ diet: "", spicy: "", course: "" })}>Clear filters</button>
              </div>
            )}
          </>
        ) : (
          /* ── a state ── */
          <>
            <div className="panel-head" key={stateId}>
              <div>
                <p className="kicker">{state ? REGION[state.region] : " "}</p>
                <h2 id="state-title">{state?.name ?? "Loading…"}</h2>
                <p className="blurb">{state?.intro ?? " "}</p>
              </div>
              {state && (
                <span className="count">
                  {dishes.data && shown.length !== state.count ? `${shown.length} of ${state.count}` : state.count} dishes
                </span>
              )}
            </div>

            {state && !filtered && dishes.data && <CityCards state={state} dishes={all} onPick={(c) => update({ city: c })} />}

            <Filters value={filters} onChange={update} />

            {dishes.loading && !dishes.data ? (
              <div className="grid"><CardSkeleton /></div>
            ) : dishes.error ? (
              <p className="error">Couldn't load dishes. Please try again.</p>
            ) : !shown.length ? (
              <div className="empty">
                <p>No dishes match these filters in {state?.name}.</p>
                <button type="button" className="btn ghost" onClick={() => update({ diet: "", spicy: "", course: "" })}>Clear filters</button>
              </div>
            ) : filtered ? (
              <div className="grid">{grid(shown)}</div>
            ) : (
              <>
                {mustTry.length > 0 && (
                  <>
                    <h3 className="group-title"><span aria-hidden="true">★</span> Must-try in {state?.name}</h3>
                    <div className="grid">{grid(mustTry)}</div>
                  </>
                )}
                {more.length > 0 && (
                  <>
                    <h3 className="group-title">More from {state?.name}</h3>
                    <div className="grid">{grid(more, mustTry.length)}</div>
                  </>
                )}
              </>
            )}
            <Link className="panel-more" to="/dishes">Browse all {total} dishes →</Link>
          </>
        )}
      </section>
    </div>
  );
}
