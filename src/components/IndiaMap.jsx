import { useState } from "react";
import { STATES, VIEWBOX } from "../lib/indiaMap.js";

/**
 * Interactive map of India.
 * States that have dishes glow and can be clicked or focused with the keyboard.
 */
export default function IndiaMap({ available, selected, onSelect }) {
  const [hover, setHover] = useState(null);
  // map shape id → state (one state can have several shapes, e.g. Dadra & Daman)
  const byId = Object.fromEntries(available.flatMap((s) => (s.mapIds || [s.id]).map((m) => [m, s])));
  const label = byId[hover] || available.find((s) => s.id === selected);

  return (
    <div className="map-wrap">
      <svg className="map" viewBox={VIEWBOX} role="group" aria-label="Map of India. Choose a state.">
        {STATES.map((s) => {
          const has = byId[s.id];
          const on = has && has.id === selected;
          const cls = ["st", has && "has", on && "on", has && hover && byId[hover] === has && "hov"].filter(Boolean).join(" ");
          return has ? (
            <path
              key={s.id}
              id={`st-${s.id}`}
              d={s.path}
              className={cls}
              tabIndex={0}
              role="button"
              aria-label={`${has.name}, ${has.count} dishes`}
              aria-pressed={on}
              onClick={() => onSelect(has.id)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onSelect(has.id))}
              onMouseEnter={() => setHover(s.id)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(s.id)}
              onBlur={() => setHover(null)}
            >
              <title>{`${has.name} · ${has.count} dishes`}</title>
            </path>
          ) : (
            <path key={s.id} d={s.path} className={cls} aria-hidden="true" />
          );
        })}
      </svg>
      <p className="map-label" aria-live="polite">
        {label ? (
          <>
            <b>{label.name}</b> · {label.count} dishes
          </>
        ) : (
          "Tap a glowing state"
        )}
      </p>
      <ul className="legend">
        <li><i className="lg-has" />Tap a state</li>
        <li><i className="lg-on" />Selected</li>
      </ul>
    </div>
  );
}
