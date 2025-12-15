import React from "react";
import { useNavigate } from "react-router-dom";  
import "../css/HeroSection.css";

export default function HeroSection() {

  const navigate = useNavigate();   

  return (
    <section className="hero-section">
      <div className="hero-overlay" />

      <div className="hero-content">
        <h1 className="hero-title">SQW Land Management Platform</h1>
        <p className="hero-subtitle" lang="th">กรุณาเลือกดูข้อมูลที่ดิน</p>

        <div className="hero-buttons">

          {/* ฝากขายที่ดิน */}
          <div className="hero-item">
            <button className="hero-circle-btn">
              <img
                src="/sell-land.png"
                alt="ฝากขายที่ดิน"
                className="hero-img-icon"
              />
            </button>
            <span className="hero-btn-label" lang="th">
              ฝากขายที่ดิน
            </span>
          </div>

          {/* ซื้อขายที่ดิน */}
          <div className="hero-item">
            <button
              className="hero-circle-btn"
              onClick={() => navigate("/map?mode=buy")}
            >
              <img
                src="/buy-land.png"
                alt="ซื้อขายที่ดิน"
                className="hero-img-icon"
              />
            </button>
            <span className="hero-btn-label" lang="th">
              ซื้อขายที่ดิน
            </span>
          </div>

        </div>
      </div>
    </section>
  );
}
