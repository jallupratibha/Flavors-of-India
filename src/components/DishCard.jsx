import { Link } from "react-router-dom";
import { useFavorites } from "../hooks/useFavorites.jsx";
import { SPICE } from "../lib/api.js";
import DishImage from "./DishImage.jsx";

export function DietTag({ veg }) {
  return (
    <span className={`diet ${veg ? "veg" : "nv"}`}>
      <i aria-hidden="true" />
      {veg ? "Veg" : "Non-veg"}
    </span>
  );
}

export function HeartButton({ id, name, className = "" }) {
  const { has, toggle } = useFavorites();
  const on = has(id);
  return (
    <button
      type="button"
      className={`heart ${on ? "on" : ""} ${className}`}
      aria-pressed={on}
      aria-label={on ? `Remove ${name} from saved` : `Save ${name}`}
      onClick={(e) => {
        e.preventDefault();
        toggle(id);
      }}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-9.3-8.6C1 8.2 3 4.5 6.6 4.5c2 0 3.4 1.1 4.2 2.4h2.4c.8-1.3 2.2-2.4 4.2-2.4 3.6 0 5.6 3.7 3.9 6.9C19 15.6 12 20 12 20Z" /></svg>
    </button>
  );
}

export default function DishCard({ dish, index = 0, showState = false }) {
  return (
    <Link to={`/dish/${dish.id}`} className="card" style={{ "--i": index }}>
      <div className="card-img">
        <DishImage dish={dish} />
        <DietTag veg={dish.veg} />
        <HeartButton id={dish.id} name={dish.name} />
        {dish.mustTry && <span className="must">★ Must-try</span>}
      </div>
      <div className="card-body">
        <h3>{dish.name}</h3>
        <p>{dish.description}</p>
        <div className="card-meta">
          <span className="card-where">
            {dish.city ? <>📍 {dish.city}{showState ? `, ${dish.state}` : ""}</> : showState ? dish.state : dish.course}
          </span>
          <span className="spice" title={SPICE[dish.spice]} aria-label={`Spice: ${SPICE[dish.spice]}`}>
            {[1, 2, 3].map((n) => (
              <i key={n} className={dish.spice >= n ? "on" : ""} />
            ))}
          </span>
        </div>
        <span className="card-go" aria-hidden="true">View dish →</span>
      </div>
    </Link>
  );
}

export function CardSkeleton({ count = 6 }) {
  return Array.from({ length: count }, (_, i) => (
    <div key={i} className="card skel" aria-hidden="true">
      <div className="card-img" />
      <div className="card-body"><b /><i /><i /></div>
    </div>
  ));
}
