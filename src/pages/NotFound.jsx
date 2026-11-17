import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="page center">
      <p className="kicker">404</p>
      <h1 className="page-title">This plate is empty.</h1>
      <p className="lead">The page you're looking for doesn't exist.</p>
      <Link className="btn" to="/">Back to the map</Link>
    </div>
  );
}
