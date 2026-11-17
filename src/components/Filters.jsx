const COURSES = ["Breakfast", "Mains", "Rice", "Breads", "Snacks", "Sides", "Sweets", "Drinks"];

/** Filter chips. Values come from and go to the address bar, so results can be shared. */
export default function Filters({ value, onChange }) {
  const set = (k, v) => onChange({ ...value, [k]: value[k] === v ? "" : v });
  const chip = (active, label, onClick) => (
    <button type="button" className={`chip ${active ? "on" : ""}`} aria-pressed={active} onClick={onClick}>
      {label}
    </button>
  );
  const any = value.diet || value.spicy || value.course;
  return (
    <div className="filters" role="group" aria-label="Filter dishes">
      {chip(!any, "All", () => onChange({ diet: "", spicy: "", course: "" }))}
      {chip(value.diet === "veg", <><i className="dot veg" />Veg</>, () => set("diet", "veg"))}
      {chip(value.diet === "nonveg", <><i className="dot nv" />Non-veg</>, () => set("diet", "nonveg"))}
      {chip(value.spicy === "1", "🌶 Spicy", () => set("spicy", "1"))}
      <span className="filters-sep" aria-hidden="true" />
      {COURSES.map((c) => chip(value.course === c, c, () => set("course", c)))}
    </div>
  );
}

/** Turn filter values into API parameters */
export const toQuery = (f) => ({
  diet: f.diet || undefined,
  course: f.course || undefined,
  minSpice: f.spicy ? 2 : undefined,
});
