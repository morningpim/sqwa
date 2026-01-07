// src/App.jsx
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
import ProfilePage from "./pages/ProfilePage";

// ✅ Admin
import AdminBroadcastPage from "./pages/admin/AdminBroadcastPage";

// ✅ Auth (mock/จริง แล้วแต่โปรเจกต์คุณ)
import { useAuth } from "./auth/AuthProvider";

// ✅ Route Guard (MVP)
function AdminRoute({ children }) {
  const { role } = useAuth();
  if (role !== "admin") {
    return (
      <div style={{ padding: 40, fontFamily: "system-ui" }}>
        <h2 style={{ margin: 0 }}>⛔ ไม่มีสิทธิ์เข้าถึง</h2>
        <p style={{ opacity: 0.8, marginTop: 8 }}>
          หน้านี้สำหรับ Admin เท่านั้น
        </p>
      </div>
    );
  }
  return children;
}

export default function App() {
  const location = useLocation();

  const hideNavbar =
    location.pathname === "/login" || location.pathname === "/signup";

  const hideFooter =
    location.pathname === "/map" ||
    location.pathname === "/cart" ||
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/profile" ||
    location.pathname.startsWith("/admin"); // ✅ เพิ่ม: หน้า admin ไม่ต้องมี footer

  return (
    <div className="app-shell">
      {!hideNavbar && <Navbar />}

      <main className={`app-main ${hideNavbar ? "" : "pt-16"}`}>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <HeroSection />
                <NewsSection />
              </>
            }
          />

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* ✅ Admin */}
          <Route
            path="/admin/broadcast"
            element={
              <AdminRoute>
                <AdminBroadcastPage />
              </AdminRoute>
            }
          />
        </Routes>
      </main>

      {!hideFooter && <FooterSection />}
    </div>
  );
}
