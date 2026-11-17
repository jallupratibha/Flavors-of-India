// Express API for Flavors of India.
// Runs locally with `npm run api`, and on Vercel as a serverless function (api/index.js).
import express from "express";
import { COURSES, findDishes, getDish, getState, listPlaces, listStates } from "./dishes.js";

const app = express();
app.disable("x-powered-by");

// small, safe caching: the data only changes when we redeploy
app.use("/api", (req, res, next) => {
  res.set("Cache-Control", "public, max-age=300, s-maxage=3600");
  next();
});

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.get("/api/states", (req, res) => res.json({ states: listStates() }));

app.get("/api/states/:id", (req, res) => {
  const state = getState(req.params.id);
  if (!state) return res.status(404).json({ error: "State not found" });
  res.json({ state, dishes: findDishes({ ...req.query, state: state.id }) });
});

app.get("/api/dishes", (req, res) => {
  const { course, diet } = req.query;
  if (course && !COURSES.includes(course)) {
    return res.status(400).json({ error: `course must be one of: ${COURSES.join(", ")}` });
  }
  if (diet && !["veg", "nonveg"].includes(diet)) {
    return res.status(400).json({ error: "diet must be veg or nonveg" });
  }
  const limit = Math.min(Number(req.query.limit) || 500, 500);
  const dishes = findDishes(req.query);
  res.json({ total: dishes.length, dishes: dishes.slice(0, limit) });
});

app.get("/api/dishes/:id", (req, res) => {
  const dish = getDish(req.params.id);
  if (!dish) return res.status(404).json({ error: "Dish not found" });
  res.json(dish);
});

app.get("/api/places", (req, res) => res.json({ places: listPlaces() }));

app.get("/api/meta", (req, res) => res.json({ courses: COURSES }));

app.use("/api", (req, res) => res.status(404).json({ error: "Not found" }));

export default app;
