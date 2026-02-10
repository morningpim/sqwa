// src/pages/OtpVerification.jsx
import React, { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../css/Login.css";

export default function OtpVerification() {
    const navigate = useNavigate();
  const query = new URLSearchParams(useLocation().search);
  const email = query.get("email");
  const [timeLeft, setTimeLeft] = useState(300); // 5 นาที

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputs = useRef([]);

  const handleChange = (i, v) => {
    if (!/^[0-9]?$/.test(v)) return;

    const copy = [...otp];
    copy[i] = v;
    setOtp(copy);

    // auto move next
    if (v && i < 5) inputs.current[i + 1].focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      inputs.current[i - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(paste)) return;

    const arr = paste.split("");
    setOtp(arr);
    inputs.current[5].focus();
  };

  const handleSubmit = async () => {
    const code = otp.join("");

    if (code.length !== 6) return;

    try {
        // เรียก API verify OTP
        // await api.verifyOtp({ email, code });

        // ไปหน้า reset password
        navigate(`/reset-password?email=${email}&otp=${code}`);
    } catch (err) {
        console.log("OTP invalid");
    }
    };
    useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
        setTimeLeft((t) => t - 1);
    }, 1000);

        return () => clearInterval(timer);
        }, [timeLeft]);
        const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
    };
    const handleResend = async () => {
  // await api.resendOtp(email)
  setTimeLeft(300);
};



    return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-left">
          <div className="login-logo">SQW</div>

          <div className="login-form-block" style={{ textAlign: "center" }}>
            <h1 className="login-title">OTP Verification</h1>

            <p className="login-subtitle">
              Enter the code sent to <b>{email}</b>
            </p>

            <div
                style={{ display: "flex", justifyContent: "center", gap: 10 }}
                onPaste={handlePaste}
                >
                {otp.map((d, i) => (
                    <input
                    key={i}
                    ref={(el) => (inputs.current[i] = el)}
                    maxLength={1}
                    value={d}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    style={{
                        width: 48,
                        height: 48,
                        textAlign: "center",
                        fontSize: 20,
                        borderRadius: 10,
                        border: "1px solid #CBD5E1",
                    }}
                    />
                ))}
                </div>

                {/* timer แยกออกมา */}
                <p style={{ marginTop: 18, color: "#64748B" }}>
                {timeLeft > 0 ? (
                    <>
                    OTP expires in <b>{formatTime(timeLeft)}</b>
                    </>
                ) : (
                    <>
                    OTP expired
                    <button
                        style={{
                        border: "none",
                        background: "none",
                        color: "#2563EB",
                        marginLeft: 8,
                        cursor: "pointer"
                        }}
                        onClick={handleResend}
                    >
                        Resend
                    </button>
                    </>
                )}
                </p>


            <button
                className="signin-btn"
                style={{ marginTop: 30 }}
                onClick={handleSubmit}
                disabled={otp.join("").length !== 6}
                >
                Submit
            </button>
          </div>
        </div>

        <div className="login-right">
          <img src="/login-bg.jpg" alt="bg" className="login-image" />
        </div>
      </div>
    </div>
  );
}
