// Pure data functions behind the API, so they can be tested on their own.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const db = JSON.parse(readFileSync(join(here, "../data/dishes.json"), "utf8"));

export const COURSES = ["Breakfast", "Mains", "Rice", "Breads", "Snacks", "Sides", "Sweets", "Drinks"];

// Common spelling variations of Indian dish names, so any of them finds the dish
const SPELLINGS = [
  [/\bbiriyani\b|\bbiriani\b|\bbriyani\b/g, "biryani"],
  [/\bidly\b|\bidlies\b|\bidlis\b/g, "idli"],
  [/\bpulav\b|\bpulaw\b/g, "pulao"],
  [/\brotti\b/g, "roti"],
  [/\bparota\b|\bporotta\b/g, "parotta"],
  [/\bpaayasam\b/g, "payasam"],
  [/\bvadai\b|\bvadas\b/g, "vada"],
];

// Lower-case, strip accents/punctuation and unify spellings,
// so "Chicken-65" finds "Chicken 65" and "biriyani" finds "biryani"
const norm = (s) =>
  SPELLINGS.reduce(
    (out, [re, to]) => out.replace(re, to),
    String(s)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim()
  );

/** Public view of a dish (internal review flags stay on the server). */
const publicDish = ({ needsCheck, featured, ...d }) => d;

export function listStates() {
  return db.states;
}

export function getState(id) {
  return db.states.find((s) => s.id === id) || null;
}

/**
 * Filter and search dishes.
 * @param {object} q
 * @param {string} [q.state]   state id, e.g. "kl"
 * @param {string} [q.city]    city id within the state, e.g. "hyderabad"; "none" = dishes eaten across the state
 * @param {string} [q.region]  "north" | "south" | "east" | "west" | "northeast" | "central"
 * @param {string} [q.q]       free text: a dish, a state or a town ("Tirupati", "Kerala", "biryani")
 * @param {string} [q.diet]    "veg" | "nonveg"
 * @param {string} [q.course]  one of COURSES
 * @param {number} [q.minSpice] 0–3
 * @param {string} [q.ids]     comma-separated ids (used for favourites)
 */
export function findDishes(q = {}) {
  let out = db.dishes;
  if (q.ids) {
    const want = new Set(String(q.ids).split(",").filter(Boolean));
    out = out.filter((d) => want.has(d.id));
  }
  if (q.state) out = out.filter((d) => d.stateId === q.state);
  if (q.city) out = out.filter((d) => (q.city === "none" ? !d.cityId : d.cityId === q.city));
  if (q.region) out = out.filter((d) => d.region === q.region);
  if (q.diet === "veg") out = out.filter((d) => d.veg);
  if (q.diet === "nonveg") out = out.filter((d) => !d.veg);
  if (q.course) out = out.filter((d) => d.course === q.course);
  if (q.minSpice !== undefined && q.minSpice !== "") {
    const min = Number(q.minSpice);
    if (!Number.isNaN(min)) out = out.filter((d) => d.spice >= min);
  }
  if (q.q) {
    const words = norm(q.q).split(" ").filter(Boolean);
    const all = (text) => words.every((w) => text.includes(w));
    // Someone typing just a state ("kerala") wants that state's must-try dishes first
    const stateQuery = db.states.find((s) => norm(s.name) === norm(q.q));
    if (stateQuery) {
      return out
        .filter((d) => d.stateId === stateQuery.id)
        .sort((a, b) => (b.mustTry ? 1 : 0) - (a.mustTry ? 1 : 0))
        .map(publicDish);
    }
    out = out
      .map((d) => {
        const name = norm(d.name);
        const place = norm(`${d.city || ""} ${d.state}`);
        const hay = `${name} ${place} ${norm(d.course)} ${norm(d.description)} ${norm(d.story || "")}`;
        if (!all(hay)) return null;
        // Ranking, best first:
        // 0 whole word in the dish name ("dosa" → Masala dosa)
        // 1 the dish comes from that city ("tirupati" → Tirupati laddu)
        // 2 name starts with the word ("dosa" → Dosakaya pacchadi)
        // 3 name contains it
        // 4 the dish is from that state ("kerala" → all Kerala dishes)
        // 5 found only in the description
        const nameWords = name.split(" ");
        const score = words.every((w) => nameWords.includes(w))
          ? 0
          : d.city && all(norm(d.city))
            ? 1
            : name.startsWith(words[0])
              ? 2
              : all(name)
                ? 3
                : all(norm(d.state))
                  ? 4
                  : 5;
        // within the same rank, must-try dishes come first
        return { d, score: score * 2 + (d.mustTry ? 0 : 1) };
      })
      .filter(Boolean)
      .sort((a, b) => a.score - b.score)
      .map((x) => x.d);
  }
  return out.map(publicDish);
}

export function getDish(id) {
  const d = db.dishes.find((x) => x.id === id);
  if (!d) return null;
  // "More from this state": same course first, then the rest
  const related = db.dishes
    .filter((x) => x.stateId === d.stateId && x.id !== d.id)
    .sort((a, b) => (a.course === d.course ? 0 : 1) - (b.course === d.course ? 0 : 1))
    .slice(0, 4)
    .map(publicDish);
  const state = getState(d.stateId);
  return { ...publicDish(d), stateCity: state.city, related };
}

/**
 * Places people can search for: every state, and every city that has dishes.
 * Used for the "Where are you going?" suggestions.
 */
export function listPlaces() {
  const out = [];
  for (const s of db.states) {
    out.push({ name: s.name, type: "state", stateId: s.id, state: s.name, count: s.count });
    for (const c of s.cities) out.push({ name: c.name, type: "city", stateId: s.id, cityId: c.id, state: s.name, count: c.count });
  }
  return out;
}
