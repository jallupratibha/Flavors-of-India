// Where to buy a dish. Zomato and Swiggy don't offer public search APIs,
// so these are search links that open with the dish (and city) already filled in.

const enc = encodeURIComponent;

/** "Karaikudi (Chettinad)" → "Karaikudi", "Araku Valley" → "Araku", "Across…" → null */
export function cityFromOrigin(city) {
  if (!city || /^north |^across/i.test(city)) return null;
  return city.replace(/\s*\(.*\)/, "").split(/&|,/)[0].replace(/backwaters|valley/i, "").trim() || null;
}

export function orderOptions(dish, city) {
  const where = city ? ` in ${city}` : "";
  return [
    ...(dish.orderLinks || []).map((l) => ({
      id: l.url,
      label: l.label,
      note: "Recommended place",
      url: l.url,
      tone: "rec",
    })),
    {
      id: "swiggy",
      label: "Swiggy",
      note: "Search Swiggy for this dish",
      url: `https://www.swiggy.com/search?query=${enc(dish.name)}`,
      tone: "swiggy",
    },
    {
      id: "zomato",
      label: "Zomato",
      note: city ? `Zomato restaurants in ${city}` : "Zomato restaurants",
      url: `https://www.google.com/search?q=${enc(`site:zomato.com "${dish.name}"${city ? ` ${city}` : ""}`)}`,
      tone: "zomato",
    },
    {
      id: "maps",
      label: "Google Maps",
      note: city ? `Places that serve it in ${city}` : "Places near you",
      url: `https://www.google.com/maps/search/?api=1&query=${enc(`${dish.name}${where || " near me"}`)}`,
      tone: "maps",
    },
  ];
}
