import React from "react";
import "../css/Login.css";

export default function Login() {
  return (
    <div className="login-wrapper">
      <div className="login-card">
        {/* LEFT PANEL */}
        <div className="login-left">
          <div className="login-logo">SQW</div>

          <div className="login-form-block">
            <h1 className="login-title">Log in</h1>

            {/* E-mail */}
            <label className="login-label">E-mail</label>
            <input type="email" className="login-input" />

            <div className="password-wrapper">
              <input
                type="password"
                className="login-input login-input-password"
              />
              <button className="show-btn" type="button">👁</button>
            </div>

            {/* Remember + Forgot */}
            <div className="login-row">
              <label className="remember">
                <input type="checkbox" /> <span>Remember me</span>
              </label>
              <a href="#" className="forgot">
                Forgot Password?
              </a>
            </div>

            <button className="google-btn" type="button">
              <img 
                src="/icons8-google.svg" 
                alt="Google icon" 
                className="google-icon-img"
              />
              <span>Continue with Google</span>
            </button>


            {/* Divider */}
            <div className="divider">
              <span>OR</span>
            </div>

            {/* Sign in */}
            <button className="signin-btn" type="button">
              Sign in
            </button>
          </div>
        </div>

        {/* RIGHT PANEL (IMAGE) */}
        <div className="login-right">
          {/* ชื่อไฟล์ใน /public เปลี่ยนตามที่คุณใช้จริง */}
          <img
            src="/login-bg.jpg"
            alt="Login background"
            className="login-image"
          />
        </div>
      </div>
    </div>
  );
}
