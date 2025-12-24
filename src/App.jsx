import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import NewsSection from "./components/NewsSection";
import FooterSection from "./components/FooterSection";
import MapPage from "./components/map/MapPage";

import Login from "./pages/Login";
import Signup from "./pages/Signup";

export default function App() {
  const location = useLocation();

  const hideNavbar =
    location.pathname === "/login" ||
    location.pathname === "/signup";

  const isMapPage = location.pathname === "/map";

  return (
    <div className="min-h-screen">
      {!hideNavbar && <Navbar />}

      {/* ✅ หน้า /map ไม่ใช้ <main class="pt-16"> เพื่อไม่ดันซ้ำ */}
      {isMapPage ? (
        <MapPage />
      ) : (
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
            <Route path="*" element={<FooterSection />} />
          </Routes>

          {/* หน้าอื่นมี footer แต่หน้า map ไม่เอา */}
          <FooterSection />
        </main>
      )}
    </div>
  );
}
