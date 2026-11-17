import { Link } from "react-router-dom";
import DishCard, { CardSkeleton } from "../components/DishCard.jsx";
import useApi from "../hooks/useApi.js";
import { useFavorites } from "../hooks/useFavorites.jsx";
import { api } from "../lib/api.js";

export default function SavedPage() {
  const { ids } = useFavorites();
  const key = ids.join(",");
  const res = useApi(() => (ids.length ? api.dishes({ ids: key }) : Promise.resolve({ dishes: [] })), key);
  // keep the order you saved them in (newest first)
  const list = (res.data?.dishes ?? []).slice().sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));

  return (
    <div className="page">
      <p className="kicker">Your list</p>
      <h1 className="page-title">Saved dishes</h1>
      {!ids.length ? (
        <div className="empty big">
          <p>Nothing saved yet. Tap the heart on any dish to keep it here.</p>
          <Link className="btn" to="/">Explore the map</Link>
        </div>
      ) : (
        <>
          <p className="lead">{ids.length} {ids.length === 1 ? "dish" : "dishes"} to try. Saved on this device.</p>
          <div className="grid wide">
            {res.loading && !res.data ? <CardSkeleton count={Math.min(ids.length, 8)} /> : list.map((d, i) => <DishCard key={d.id} dish={d} index={i} showState />)}
          </div>
        </>
      )}
    </div>
  );
}
