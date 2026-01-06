// src/pages/ProfilePage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../css/profile.css";

import { readFavorites, removeFavorite, subscribeFavoritesChanged } from "../utils/favorites";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search || ""), [search]);
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const q = useQuery();
  const tab = (q.get("tab") || "info").toLowerCase();

  const [favorites, setFavorites] = useState(() => readFavorites());

  useEffect(() => {
    setFavorites(readFavorites());
    const unsub = subscribeFavoritesChanged(() => setFavorites(readFavorites()));
    return unsub;
  }, []);

  const goTab = (t) => navigate(`/profile?tab=${t}`);

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* header */}
        <div className="profile-header">
          <div className="profile-avatar">P</div>
          <div className="profile-meta">
            <div className="profile-name">Pimpa Naree</div>
            <div className="profile-sub">สมาชิก</div>
          </div>
          <button className="profile-edit-btn" type="button">
            แก้ไขโปรไฟล์
          </button>
        </div>

        {/* stats */}
        <div className="profile-stats">
          <div className="stat-card">
            <div className="stat-num">12</div>
            <div className="stat-label">ประกาศ</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">{favorites.length}</div>
            <div className="stat-label">รายการโปรด</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">7</div>
            <div className="stat-label">ปลดล็อคเดือนนี้</div>
          </div>
        </div>

        {/* layout */}
        <div className="profile-grid">
          {/* left menu */}
          <aside className="profile-side">
            <div className="side-title">เมนูโปรไฟล์</div>

            <button
              className={`side-item ${tab === "info" ? "active" : ""}`}
              onClick={() => goTab("info")}
              type="button"
            >
              ข้อมูลส่วนตัว
            </button>

            <button
              className={`side-item ${tab === "fav" ? "active" : ""}`}
              onClick={() => goTab("fav")}
              type="button"
            >
              รายการโปรด
            </button>

            <button
              className={`side-item ${tab === "posts" ? "active" : ""}`}
              onClick={() => goTab("posts")}
              type="button"
            >
              ประกาศของฉัน
            </button>

            <button
              className={`side-item ${tab === "settings" ? "active" : ""}`}
              onClick={() => goTab("settings")}
              type="button"
            >
              ตั้งค่า
            </button>
          </aside>

          {/* right content */}
          <section className="profile-content">
            {tab === "fav" ? (
              <>
                <div className="content-head">
                  <div>
                    <div className="content-title">รายการโปรด</div>
                    <div className="content-sub">รายการที่คุณกดหัวใจไว้จากหน้าแผนที่</div>
                  </div>
                  <div className="content-pill">{favorites.length} รายการ</div>
                </div>

                {favorites.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-title">ยังไม่มีรายการโปรด</div>
                    <div className="empty-sub">ไปที่หน้าแผนที่ แล้วกดหัวใจที่แปลงที่สนใจ</div>
                    <button
                        className="outline-btn"
                        type="button"
                        onClick={() => navigate(`/map?mode=buy&landId=${encodeURIComponent(f.id)}`)}
                        >
                        เปิดแผนที่
                    </button>
                  </div>
                ) : (
                  <div className="fav-grid">
                    {favorites.map((f) => (
                      <div key={f.id} className="fav-card">
                        <div className="fav-top">
                          <div className="fav-owner">{f.owner || "—"}</div>
                          <button
                            className="fav-remove"
                            type="button"
                            onClick={() => removeFavorite(f.id)}
                            title="ลบออกจากรายการโปรด"
                          >
                            ลบ
                          </button>
                        </div>

                        <div className="fav-row">
                          <span className="muted">วันที่ลงข้อมูล</span>
                          <b>{f.updatedAt || "-"}</b>
                        </div>

                        <div className="fav-row">
                          <span className="muted">ขนาด</span>
                          <b>
                            {f.area || "-"} ตร.วา{" "}
                            <span className="muted" style={{ fontWeight: 600 }}>
                              ({f.raw || "-"})
                            </span>
                          </b>
                        </div>

                        <div className="fav-row">
                          <span className="muted">ราคารวม</span>
                          <b>{f.totalPrice || "-"} บ.</b>
                        </div>

                        <div className="fav-actions">
                          <button className="outline-btn" type="button" onClick={() => navigate(`/map?mode=buy`)}>
                            เปิดแผนที่
                          </button>
                          <button className="primary-btn" type="button">
                            แชทผู้ขาย
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : tab === "info" ? (
              <>
                <div className="content-head">
                  <div>
                    <div className="content-title">ข้อมูลส่วนตัว</div>
                    <div className="content-sub">จัดการข้อมูลของคุณในหน้าโปรไฟล์</div>
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-row">
                    <div className="k">ชื่อ</div>
                    <div className="v">Pimpa Naree</div>
                  </div>
                  <div className="info-row">
                    <div className="k">เบอร์โทร</div>
                    <div className="v">081-234-5678</div>
                  </div>
                  <div className="info-row">
                    <div className="k">LINE ID</div>
                    <div className="v">bee.land</div>
                  </div>
                  <div className="info-row">
                    <div className="k">สถานะ</div>
                    <div className="v"><span className="badge">สมาชิก</span></div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="content-head">
                  <div>
                    <div className="content-title">กำลังทำอยู่</div>
                    <div className="content-sub">แท็บนี้ยังไม่เปิดใช้งาน</div>
                  </div>
                </div>
                <div className="empty-state">
                  <div className="empty-title">ยังไม่พร้อมใช้งาน</div>
                  <div className="empty-sub">เดี๋ยวเราทำต่อให้ได้เลย</div>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
