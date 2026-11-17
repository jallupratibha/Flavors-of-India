import { Link, useNavigate, useParams } from "react-router-dom";
import DishCard, { DietTag, HeartButton } from "../components/DishCard.jsx";
import OrderBox from "../components/OrderBox.jsx";
import DishImage from "../components/DishImage.jsx";
import useApi from "../hooks/useApi.js";
import { api, SPICE } from "../lib/api.js";

export default function DishPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: dish, error, loading } = useApi(() => api.dish(id), id);

  if (loading && !dish) return <div className="page"><div className="dish-skel" aria-label="Loading" /></div>;
  if (error)
    return (
      <div className="page center">
        <h1 className="page-title">{error.status === 404 ? "We couldn't find that dish" : "Something went wrong"}</h1>
        <Link className="btn" to="/dishes">See all dishes</Link>
      </div>
    );

  return (
    <article className="page dish">
      <button type="button" className="back" onClick={() => (window.history.state?.idx > 0 ? navigate(-1) : navigate(`/?state=${dish.stateId}`))}>
        ← Back
      </button>
      <div className="dish-hero">
        <div className="dish-img">
          <DishImage dish={dish} lazy={false} />
        </div>
        <div className="dish-info">
          <p className="kicker crumbs">
            {dish.mustTry && <span>★ Must-try · </span>}
            <Link to={`/?state=${dish.stateId}`}>{dish.state}</Link>
            {dish.city && (
              <>
                {" › "}
                <Link to={`/?state=${dish.stateId}&city=${dish.cityId}`}>{dish.city}</Link>
              </>
            )}
          </p>
          <h1 className="display">{dish.name}</h1>
          {dish.city && <p className="origin">📍 From {dish.city}, {dish.state}</p>}
          <p className="lead">{dish.story || dish.description}</p>
          <dl className="facts">
            <div><dt>Type</dt><dd><DietTag veg={dish.veg} /></dd></div>
            <div><dt>Course</dt><dd>{dish.course}</dd></div>
            <div>
              <dt>Spice</dt>
              <dd className="spice-row">
                <span className="spice big">{[1, 2, 3].map((n) => <i key={n} className={dish.spice >= n ? "on" : ""} />)}</span>
                {SPICE[dish.spice]}
              </dd>
            </div>
          </dl>
          <div className="dish-actions">
            <a className="btn" href="#order" onClick={(e) => (e.preventDefault(), document.getElementById("order")?.scrollIntoView({ behavior: "smooth", block: "center" }))}>
              Buy it →
            </a>
            <HeartButton id={dish.id} name={dish.name} className="big" />
            <Link className="btn ghost" to={`/?state=${dish.stateId}`}>More from {dish.state}</Link>
          </div>
        </div>
      </div>
      <OrderBox dish={dish} />
      {dish.related.length > 0 && (
        <section className="related">
          <h2 className="section-title">More from {dish.state}</h2>
          <div className="grid four">
            {dish.related.map((d, i) => <DishCard key={d.id} dish={d} index={i} />)}
          </div>
        </section>
      )}
    </article>
  );
}
