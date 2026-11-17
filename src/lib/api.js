// Tiny API client with an in-memory cache, so going back and forth is instant.
const cache = new Map();

async function get(path) {
  if (cache.has(path)) return cache.get(path);
  const req = fetch(path).then(async (res) => {
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(body.error || `Request failed (${res.status})`), { status: res.status });
    return body;
  });
  cache.set(path, req);
  req.catch(() => cache.delete(path)); // don't cache failures
  return req;
}

const qs = (params) => {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => v !== undefined && v !== "" && v !== null && p.set(k, v));
  const s = p.toString();
  return s ? `?${s}` : "";
};

export const api = {
  states: () => get("/api/states").then((r) => r.states),
  dishes: (params = {}) => get(`/api/dishes${qs(params)}`),
  dish: (id) => get(`/api/dishes/${encodeURIComponent(id)}`),
  places: () => get("/api/places").then((r) => r.places),
};

export const SPICE = ["Mild", "A little heat", "Spicy", "Fiery"];
