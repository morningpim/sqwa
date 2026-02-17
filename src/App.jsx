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

// ✅ guards จริง
import AuthGuard from "./auth/AuthGuard";
import GuestGuard from "./auth/GuestGuard";
import RoleGuard from "./auth/RoleGuard";

export default function App() {
  const location = useLocation();

  const hideNavbar = [
    "/login",
    "/signup",
    "/forgot-password",
    "/otp-verification",
    "/reset-password",
    "/reset-password-success"
  ].includes(location.pathname);

  const hideFooter =
    ["/map", "/cart"].includes(location.pathname) ||
    hideNavbar ||
    location.pathname.startsWith("/admin");

  return (
    <div className="app-shell">
      {!hideNavbar && <Navbar />}

      <main className={`app-main ${hideNavbar ? "" : "pt-16"}`}>
        <Routes>

          {/* public */}
          <Route path="/" element={<><HeroSection /><NewsSection /></>} />
          <Route path="/map" element={<MapPage />} />

          {/* guest only */}
          <Route path="/login" element={
            <GuestGuard>
              <Login />
            </GuestGuard>
          } />

          <Route path="/signup" element={
            <GuestGuard>
              <Signup />
            </GuestGuard>
          } />

          {/* auth required */}
          <Route path="/cart" element={
            <AuthGuard>
              <CartPage />
            </AuthGuard>
          } />

          <Route path="/profile" element={
            <AuthGuard>
              <ProfilePage />
            </AuthGuard>
          } />

          {/* password flow */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/otp-verification" element={<OtpVerification />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/reset-password-success" element={<ResetPasswordSuccess />} />

          {/* admin only */}
          <Route path="/admin" element={
            <RoleGuard allow={["admin"]}>
              <AdminPage />
            </RoleGuard>
          } />

          <Route path="/admin/broadcast" element={
            <RoleGuard allow={["admin"]}>
              <AdminBroadcastPage />
            </RoleGuard>
          } />

        </Routes>
      </main>

      {!hideFooter && <FooterSection />}
    </div>
  );
}
