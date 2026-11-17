// A dish illustration, or a simple card if a dish has no image.
const EMOJI = { Breakfast: "🥞", Mains: "🍛", Rice: "🍚", Breads: "🫓", Snacks: "🥟", Sides: "🥣", Sweets: "🍮", Drinks: "🥤" };
const TONES = [
  ["#7a3414", "#c0571f"],
  ["#5b2a3a", "#a8476a"],
  ["#2f4d2a", "#5e8c3a"],
  ["#4a3413", "#b07a1f"],
  ["#283d5c", "#4c78a8"],
  ["#5a2a17", "#d9682b"],
];
const tone = (id) => TONES[[...id].reduce((n, c) => n + c.charCodeAt(0), 0) % TONES.length];

export default function DishImage({ dish, lazy = true }) {
  if (dish.image) {
    return <img src={dish.image} alt={dish.name} loading={lazy ? "lazy" : "eager"} decoding="async" />;
  }
  const [a, b] = tone(dish.id);
  return (
    <div className="dish-art" style={{ "--a": a, "--b": b }} role="img" aria-label={`${dish.name} `}>
      <span className="dish-art-emoji" aria-hidden="true">{EMOJI[dish.course] || "🍽️"}</span>
      <span className="dish-art-name" aria-hidden="true">{dish.name}</span>
    </div>
  );
}
