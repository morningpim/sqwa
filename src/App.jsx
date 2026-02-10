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
import ForgotPassword from "./pages/ForgotPassword";
import OtpVerification from "./pages/OtpVerification";
import ResetPassword from "./pages/ResetPassword";
import ResetPasswordSuccess from "./pages/ResetPasswordSuccess";

import AdminPage from "./pages/admin/AdminPage";
import AdminBroadcastPage from "./pages/admin/AdminBroadcastPage";

import { useAuth } from "./auth/AuthProvider";

function AdminRoute({ children }) {
  const { role } = useAuth();
  if (role !== "admin") {
    return (
      <div style={{ padding: 40, fontFamily: "system-ui" }}>
        <h2 style={{ margin: 0 }}>⛔ ไม่มีสิทธิ์เข้าถึง</h2>
        <p style={{ opacity: 0.8, marginTop: 8 }}>หน้านี้สำหรับ Admin เท่านั้น</p>
      </div>
    );
  }
  return children;
}

export default function App() {
  const location = useLocation();

  // ✅ ไม่ซ่อน Navbar ใน /admin แล้ว
  const hideNavbar =
  location.pathname === "/login" ||
  location.pathname === "/signup" ||
  location.pathname === "/forgot-password" ||
  location.pathname === "/otp-verification" ||
  location.pathname === "/reset-password" ||
  location.pathname === "/reset-password-success";

  const hideFooter =
    location.pathname === "/map" ||
    location.pathname === "/cart" ||
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/forgot-password" ||
    location.pathname === "/otp-verification" ||
    location.pathname === "/reset-password" ||
    location.pathname === "/reset-password-success" ||
    location.pathname.startsWith("/admin");

  return (
    <div className="app-shell">
      {!hideNavbar && <Navbar />}

      <main className={`app-main ${hideNavbar ? "" : "pt-16"}`}>
        <Routes>
          <Route path="/" element={<><HeroSection /><NewsSection /></>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />  
          <Route path="/map" element={<MapPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/otp-verification" element={<OtpVerification />} />   
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/reset-password-success" element={<ResetPasswordSuccess />} />

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />

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
