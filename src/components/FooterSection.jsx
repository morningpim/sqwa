import React from "react";
import "../css/FooterSection.css";

export default function FooterSection() {
  return (
    <footer className="footer-section">
      <div className="footer-inner">
        <h2 className="footer-logo">SQW</h2>
        <p className="footer-subtitle">SQW - Land Management Platform</p>

        <p className="footer-text" lang="th">
          แพลตฟอร์มบริหารจัดการข้อมูลที่ดินอัจฉริยะ
          (Smart Land Management) <br />
          เพื่อช่วยเจ้าของที่ดิน นักลงทุน และผู้ใช้งานทั่วไป
          ในการจัดเก็บ วิเคราะห์ และค้นหาข้อมูลที่ดินได้อย่างสะดวกและมีประสิทธิภาพ
        </p>
      </div>
    </footer>
  );
}
