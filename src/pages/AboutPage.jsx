export default function AboutPage() {
  return (
    <div className="page about">
      <p className="kicker">About the project</p>
      <h1 className="page-title">Know what to eat before you get there.</h1>
      <p className="lead">
        When you travel somewhere new in India, it's hard to know which traditional dishes are worth trying.
        Search engines give you scattered lists. Flavors of India puts it all in one place: the must-try dishes of
        every state and city, the story behind each one, and a quick way to order it. Every state and union
        territory is covered, and the list keeps growing.
      </p>
      <div className="about-grid">
        <section>
          <h2>What you can do</h2>
          <ul>
            <li>Type where you're going (a state or a city like Hyderabad) and see what to eat there</li>
            <li>Every state is split into its cities, each with its special dishes</li>
            <li>Explore dishes on an interactive map of India</li>
            <li>Read the story behind each must-try dish</li>
            <li>Order it on Swiggy or Zomato, or find it on Google Maps</li>
            <li>Filter by veg or non-veg, spice and course</li>
            <li>Open any dish for details and similar dishes</li>
            <li>Save favourites, kept on your device</li>
          </ul>
        </section>
        <section>
          <h2>How it's built</h2>
          <ul>
            <li><b>Front end:</b> React 18, React Router, Vite</li>
            <li><b>Back end:</b> Node.js + Express REST API</li>
            <li><b>Tests:</b> Node's built-in test runner</li>
            <li><b>Hosting:</b> Vercel (static site + serverless API)</li>
            <li>Filters live in the URL, so every view can be shared</li>
            <li>Every dish illustration is original, drawn in code (SVG)</li>
            <li>Keyboard and screen-reader friendly map</li>
          </ul>
        </section>
        <section>
          <h2>The API</h2>
          <ul className="mono">
            <li>GET /api/states</li>
            <li>GET /api/places</li>
            <li>GET /api/dishes?q=&state=&diet=&course=&minSpice=</li>
            <li>GET /api/dishes/:id</li>
          </ul>
        </section>
      </div>
      <p className="about-by">
        Designed and built by <a href="https://pratibhajallu.vercel.app" target="_blank" rel="noreferrer">Pratibha Jallu</a>.
      </p>
    </div>
  );
}
