import DishImage from "./DishImage.jsx";

/** The cities of a state, as cards. "Across the state" collects dishes eaten everywhere. */
export default function CityCards({ state, dishes, onPick }) {
  const across = state.count - state.cities.reduce((n, c) => n + c.count, 0);
  const items = [
    ...state.cities.map((c) => ({ ...c, preview: dishes.filter((d) => d.cityId === c.id).slice(0, 3) })),
    ...(across > 0 && state.cities.length
      ? [{ id: "none", name: `Across ${state.name}`, blurb: "Dishes eaten all over the state.", count: across, preview: dishes.filter((d) => !d.cityId).slice(0, 3) }]
      : []),
  ];
  if (!state.cities.length) return null;
  return (
    <section className="cities" aria-label={`Cities in ${state.name}`}>
      <h3 className="group-title"><span aria-hidden="true">📍</span> Cities in {state.name}</h3>
      <div className="city-grid">
        {items.map((c, i) => (
          <button key={c.id} type="button" className="city" style={{ "--i": i }} onClick={() => onPick(c.id)}>
            <span className="city-thumbs" aria-hidden="true">
              {c.preview.map((d) => (
                <span key={d.id} className="city-thumb"><DishImage dish={d} /></span>
              ))}
            </span>
            <b>{c.name}</b>
            <small>{c.blurb}</small>
            <span className="city-count">{c.count} {c.count === 1 ? "dish" : "dishes"} →</span>
          </button>
        ))}
      </div>
    </section>
  );
}
