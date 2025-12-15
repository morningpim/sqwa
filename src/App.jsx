import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import NewsSection from "./components/NewsSection";
import FooterSection from "./components/FooterSection";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MapPage from "./pages/MapPage";   // ⭐ เพิ่มหน้า Map

export default function App() {
  const location = useLocation();

  const hideNavbar =
    location.pathname === "/login" ||
    location.pathname === "/signup";

  return (
    <div className="min-h-screen">
      {!hideNavbar && <Navbar />}

      <main className={hideNavbar ? "" : "pt-16"}>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <HeroSection />
                <NewsSection />
                <FooterSection />
              </>
            }
          />

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/map" element={<MapPage />} />
        </Routes>
      </main>
    </div>
  );
}
