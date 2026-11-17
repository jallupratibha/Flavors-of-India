import { useEffect, useState } from "react";
import { cityFromOrigin, orderOptions } from "../lib/order.js";

const KEY = "foi:city";
const readCity = () => {
  try {
    return localStorage.getItem(KEY) || "";
  } catch {
    return "";
  }
};

/** "Want to try it?": order on Swiggy / Zomato, or find it on Google Maps. */
export default function OrderBox({ dish }) {
  const home = cityFromOrigin(dish.city) || dish.stateCity || "";
  const [city, setCity] = useState(() => readCity() || home);
  useEffect(() => {
    if (!readCity()) setCity(home);
  }, [home]);

  const save = (v) => {
    setCity(v);
    try {
      v ? localStorage.setItem(KEY, v) : localStorage.removeItem(KEY);
    } catch {
      /* fine: it just won't be remembered */
    }
  };

  const options = orderOptions(dish, city.trim());
  return (
    <section className="order" id="order" aria-labelledby="order-title">
      <div className="order-head">
        <h2 id="order-title">Want to try it?</h2>
        <label className="order-city">
          <span>Order in</span>
          <input value={city} onChange={(e) => save(e.target.value)} placeholder="Your city" aria-label="Your city" />
          {city !== home && home && (
            <button type="button" className="link-btn" onClick={() => save("")}>Use {home}</button>
          )}
        </label>
      </div>
      <div className="order-grid">
        {options.map((o) => (
          <a key={o.id} className={`order-opt ${o.tone}`} href={o.url} target="_blank" rel="noreferrer noopener">
            <b>{o.label}</b>
            <small>{o.note}</small>
            <span aria-hidden="true">↗</span>
          </a>
        ))}
      </div>
      <p className="order-note">Opens in a new tab. Availability depends on the restaurants near you.</p>
    </section>
  );
}
