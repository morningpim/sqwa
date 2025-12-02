import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import NewsSection from "./components/NewsSection";
import FooterSection from "./components/FooterSection";

// ✔ นำเข้าหน้าเพจจาก /pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";

export default function App() {
  const location = useLocation();

  // ซ่อน Navbar เมื่ออยู่หน้า Login หรือ Signup
  const hideNavbar =
    location.pathname === "/login" ||
    location.pathname === "/signup";

  return (
    <div className="min-h-screen bg-white">
      {/* แสดง Navbar เฉพาะหน้าที่ไม่ใช่ /login และ /signup */}
      {!hideNavbar && <Navbar />}

      {/* ถ้ามี navbar ให้มี padding-top */}
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

          {/* Login */}
          <Route path="/login" element={<Login />} />

          {/* Signup */}
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </main>
    </div>
  );
}
