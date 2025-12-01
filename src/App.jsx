import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import NewsSection from "./components/NewsSection";
import FooterSection from "./components/FooterSection";
import Login from "./pages/Login";

export default function App() {
  const location = useLocation();

  // ถ้าอยู่หน้า /login ให้ไม่แสดง Navbar
  const hideNavbar = location.pathname === "/login";

  return (
    <div className="min-h-screen bg-white">
      {/* แสดง Navbar เฉพาะหน้าที่ไม่ใช่ /login */}
      {!hideNavbar && <Navbar />}

      {/* ถ้ามี navbar ให้เผื่อ padding-top 16px เหมือนเดิม */}
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
        </Routes>
      </main>
    </div>
  );
}
