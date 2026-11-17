import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import ExplorePage from "./pages/ExplorePage.jsx";
import AllDishesPage from "./pages/AllDishesPage.jsx";
import DishPage from "./pages/DishPage.jsx";
import SavedPage from "./pages/SavedPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import NotFound from "./pages/NotFound.jsx";

// Start every new page at the top (but not when only filters in the address change)
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <a className="skip" href="#main">Skip to content</a>
      <Header />
      <main id="main">
        <Routes>
          <Route path="/" element={<ExplorePage />} />
          <Route path="/dishes" element={<AllDishesPage />} />
          <Route path="/dish/:id" element={<DishPage />} />
          <Route path="/saved" element={<SavedPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
