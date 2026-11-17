import { test } from "node:test";
import assert from "node:assert/strict";
import { findDishes, getDish, listPlaces, listStates } from "./dishes.js";

test("covers all states and union territories", () => {
  assert.equal(listStates().length, 36);
  assert.ok(findDishes().length > 300);
  for (const name of ["Telangana", "Goa", "Jharkhand", "Ladakh", "Delhi"]) {
    assert.ok(listStates().some((s) => s.name === name), name);
  }
});

test("each state lists its cities, and city counts match", () => {
  for (const s of listStates()) {
    for (const c of s.cities) assert.equal(findDishes({ state: s.id, city: c.id }).length, c.count, `${s.id}/${c.id}`);
    const across = findDishes({ state: s.id, city: "none" }).length;
    const inCities = s.cities.reduce((n, c) => n + c.count, 0);
    assert.equal(across + inCities, s.count, s.id);
  }
});

test("Hyderabad has its special dishes", () => {
  const r = findDishes({ state: "tg", city: "hyderabad" }).map((d) => d.name);
  assert.ok(r.includes("Hyderabadi biryani") && r.includes("Haleem"));
});

test("state counts match the dishes", () => {
  for (const s of listStates()) assert.equal(findDishes({ state: s.id }).length, s.count);
});

test("veg and non-veg split covers everything", () => {
  const all = findDishes().length;
  assert.equal(findDishes({ diet: "veg" }).length + findDishes({ diet: "nonveg" }).length, all);
  assert.ok(findDishes({ diet: "veg" }).every((d) => d.veg));
});

test("search finds dishes by name and ranks name matches first", () => {
  const r = findDishes({ q: "biryani" });
  assert.ok(r.length >= 5);
  assert.match(r[0].name.toLowerCase(), /biri?yani/);
});

test("search puts whole-word name matches first", () => {
  const r = findDishes({ q: "dosa" });
  assert.ok(r[0].name.toLowerCase().split(" ").includes("dosa"));
  assert.ok(r.findIndex((d) => d.name === "Dosakaya pacchadi") > r.findIndex((d) => d.name === "Masala dosa"));
});

test("search understands spelling variations", () => {
  const a = findDishes({ q: "biryani" }).map((d) => d.id).sort();
  const b = findDishes({ q: "biriyani" }).map((d) => d.id).sort();
  assert.deepEqual(a, b);
  assert.ok(a.includes("kl-malabar-biriyani"));
  assert.ok(findDishes({ q: "idli" }).some((d) => d.id === "tn-idly-sambar"));
});

test("search ignores punctuation and case", () => {
  assert.equal(findDishes({ q: "CHICKEN-65" })[0].name, "Chicken 65");
});

test("filters combine", () => {
  const r = findDishes({ state: "kl", diet: "veg", course: "Breakfast" });
  assert.ok(r.length > 0);
  assert.ok(r.every((d) => d.stateId === "kl" && d.veg && d.course === "Breakfast"));
});

test("spice filter", () => {
  assert.ok(findDishes({ minSpice: 3 }).every((d) => d.spice === 3));
});

test("favourites by ids", () => {
  const ids = findDishes().slice(0, 3).map((d) => d.id);
  assert.deepEqual(findDishes({ ids: ids.join(",") }).map((d) => d.id), ids);
});

test("dish details include related dishes from the same state", () => {
  const d = getDish("kl-appam");
  assert.equal(d.name, "Appam");
  assert.equal(d.related.length, 4);
  assert.ok(d.related.every((x) => x.stateId === "kl" && x.id !== d.id));
  assert.equal("needsCheck" in d, false);
});

test("unknown dish returns null", () => {
  assert.equal(getDish("nope"), null);
});

test("searching a town shows the dishes from that town first", () => {
  const r = findDishes({ q: "tirupati" });
  assert.equal(r[0].id, "ap-tirupati-laddu");
  const k = findDishes({ q: "kakinada" });
  assert.equal(k[0].id, "ap-kakinada-kaaja");
});

test("searching a state lists its must-try dishes first", () => {
  const r = findDishes({ q: "kerala" });
  assert.ok(r.length >= 44);
  assert.ok(r.every((d) => d.stateId === "kl"));
  assert.ok(r.slice(0, 6).every((d) => d.mustTry && d.stateId === "kl"));
});

test("every must-try dish has something to read", () => {
  const must = findDishes().filter((d) => d.mustTry);
  assert.ok(must.length >= 50);
  assert.ok(must.every((d) => (d.story || d.description).length > 20));
});

test("places include states and towns", () => {
  const p = listPlaces();
  assert.equal(p.filter((x) => x.type === "state").length, 36);
  assert.ok(p.some((x) => x.type === "city" && x.name === "Annavaram"));
  assert.ok(p.some((x) => x.type === "city" && x.name === "Hyderabad"));
});

test("dish details include a city for ordering links", () => {
  assert.equal(getDish("ap-pulihora").stateCity, "Vijayawada");
  assert.ok(Array.isArray(getDish("ap-pulihora").orderLinks));
});
