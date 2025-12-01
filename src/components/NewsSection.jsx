import React from "react";
import "../css/NewsSection.css";

export default function NewsSection() {
  return (
    <section className="news-section">
      <div className="news-inner">
        <div className="news-header">
          <h2 className="news-title" lang="th">
            ข่าวสารและข้อมูลเชิงลึก
          </h2>
          <button className="news-all-btn">All read →</button>
        </div>

        <div className="news-layout">
          <article className="news-main">
            <img
              src="/news-map.png" 
              alt="ทำเลที่ดิน"
              className="news-main-image"
            />
            <div className="news-main-content">
              <h3 className="news-item-title" lang="th">
                ทำเลทองฝังเพชร: ทำไมที่ดินกรุงเทพฯ ถึงแพงระยับ?
              </h3>
              <p className="news-item-text" lang="th">
                "เมื่อโครงข่ายรถไฟฟ้าเชื่อมต่อทุกมุมเมือง ผนวกกับความเป็นศูนย์กลางเศรษฐกิจ (CBD) ทำให้ที่ดิน กทม. กลายเป็นทรัพยากรที่มีจำกัดและมูลค่าพุ่งสูงขึ้นทุกปี"
              </p>
              <button className="news-readmore">อ่านเพิ่มเติม →</button>
            </div>
          </article>

          {/* ขวา: ข่าวย่อย 2 กล่อง */}
          <div className="news-side">
            <article className="news-card">
              <img
                src="/news-train.jpg" // ใส่รูปโครงสร้างพื้นฐาน/รถไฟฟ้า
                alt="รถไฟฟ้าและทำเลที่ดิน"
                className="news-card-image"
              />
              <div className="news-card-content">
                <h3 className="news-item-title" lang="th">
                  เกาะติดรถไฟฟ้าสายใหม่: ทำเลทองที่น่าจับตามอง
                </h3>
                <p className="news-item-text" lang="th">
                  "วิเคราะห์การเติบโตของราคาที่ดินตามแนวรถไฟฟ้าส่วนต่อขยาย 
                  ที่กำลังเปลี่ยนพื้นที่ชานเมืองให้กลายเป็นย่านเศรษฐกิจและที่อยู่อาศัยแห่งใหม่"
                </p>
                <button className="news-readmore">อ่านเพิ่มเติม →</button>
              </div>
            </article>

            <article className="news-card">
              <img
                src="/news-invest.jpg" // รูปมือวางเหรียญ/ลงทุนที่ดิน
                alt="การลงทุนที่ดิน"
                className="news-card-image"
              />
              <div className="news-card-content">
                <h3 className="news-item-title" lang="th">
                  เช็คลิสต์สำคัญ! สิ่งที่ต้องรู้ก่อนลงทุนซื้อขายที่ดิน
                </h3>
                <p className="news-item-text" lang="th">
                  "รวมข้อควรรู้เกี่ยวกับเอกสารสิทธิ์ (โฉนด), กฎหมายผังเมือง และการตรวจสอบแนวเวนคืน เพื่อป้องกันความเสี่ยงก่อนตัดสินใจลงทุน"
                </p>
                <button className="news-readmore">อ่านเพิ่มเติม →</button>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
