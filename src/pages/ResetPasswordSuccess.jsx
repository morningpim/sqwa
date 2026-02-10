import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/Login.css";

export default function ResetPasswordSuccess() {
  const navigate = useNavigate();

  return (
    <div className="login-wrapper">
      <div className="login-card">

        {/* LEFT */}
        <div className="login-left">
          <div className="login-logo">SQW</div>

          <div className="login-form-block">
            <div style={{fontSize:70,color:"#16a34a",marginBottom:20}}>✓</div>

            <h1 className="login-title">
              Password Reset Successful
            </h1>

            <p className="login-subtitle">
              You can now log in with your new password.
            </p>

            <button
              className="signin-btn"
              onClick={() => navigate("/login")}
              style={{marginTop:20}}
            >
              Continue to Log in
            </button>
          </div>
        </div>

        {/* RIGHT */}
        <div className="login-right">
          <img src="/login-bg.jpg" alt="bg" className="login-image" />
        </div>

      </div>
    </div>
  );
}
