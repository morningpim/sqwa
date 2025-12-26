import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import NewsSection from "./components/NewsSection";
import FooterSection from "./components/FooterSection";
import MapPage from "./components/map/MapPage";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CartPage from "./pages/Cart/CartPage";

export default function App() {
  const location = useLocation();

  const hideNavbar =
    location.pathname === "/login" ||
    location.pathname === "/signup";

  const hideFooter =
    location.pathname === "/map" ||
    location.pathname === "/cart" ||
    location.pathname === "/login" ||
    location.pathname === "/signup";

  return (
    <div className="app-shell">
      {!hideNavbar && <Navbar />}

      <main className={`app-main ${hideNavbar ? "" : "pt-16"}`}>
        <Routes>
          <Route path="/" element={<><HeroSection /><NewsSection /></>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </main>

      {!hideFooter && <FooterSection />}
    </div>
  );
}

