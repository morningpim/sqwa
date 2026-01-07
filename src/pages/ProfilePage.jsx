// src/pages/ProfilePage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../css/profile.css";

import { readFavorites, removeFavorite, subscribeFavoritesChanged } from "../utils/favorites";
import { readPurchases, removePurchase, subscribePurchasesChanged } from "../utils/purchases";

// ✅ เพิ่ม: landsLocal เพื่อดึง “ประกาศของฉัน”
import { readAllLands, removeLand, subscribeLandsChanged } from "../utils/landsLocal";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search || ""), [search]);
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const q = useQuery();
  const tab = (q.get("tab") || "info").toLowerCase();

  const [favorites, setFavorites] = useState(() => readFavorites());
  const [purchases, setPurchases] = useState(() => readPurchases());

  // ✅ เพิ่ม: posts (ประกาศของฉัน)
  const [posts, setPosts] = useState(() => readAllLands());

  useEffect(() => {
    setFavorites(readFavorites());
    const unsub = subscribeFavoritesChanged(() => setFavorites(readFavorites()));
    return unsub;
  }, []);

  useEffect(() => {
    setPurchases(readPurchases());
    const unsub = subscribePurchasesChanged(() => setPurchases(readPurchases()));
    return unsub;
  }, []);

  // ✅ subscribe “ประกาศของฉัน”
  useEffect(() => {
    setPosts(readAllLands());
    const unsub = subscribeLandsChanged(() => setPosts(readAllLands()));
    return unsub;
  }, []);

  const goTab = (t) => navigate(`/profile?tab=${t}`);

  const onDeletePost = (id) => {
    if (!id) return;
    if (!window.confirm("ต้องการลบประกาศนี้ใช่ไหม?")) return;
    removeLand(id);
  };

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
            {/* ✅ เปลี่ยน 12 เป็นจำนวนประกาศจริง */}
            <div className="stat-num">{posts.length}</div>
            <div className="stat-label">ประกาศ</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">{favorites.length}</div>
            <div className="stat-label">รายการโปรด</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">{purchases.length}</div>
            <div className="stat-label">ประวัติการซื้อ</div>
          </div>
        </div>

        {/* layout */}
        <div className="profile-grid">
          {/* left menu */}
          <aside className="profile-side">
            <div className="side-title">เมนูโปรไฟล์</div>

            <button className={`side-item ${tab === "info" ? "active" : ""}`} onClick={() => goTab("info")} type="button">
              ข้อมูลส่วนตัว
            </button>

            <button className={`side-item ${tab === "fav" ? "active" : ""}`} onClick={() => goTab("fav")} type="button">
              รายการโปรด
            </button>

            <button
              className={`side-item ${tab === "purchase" ? "active" : ""}`}
              onClick={() => goTab("purchase")}
              type="button"
            >
              ประวัติการซื้อ
            </button>

            <button className={`side-item ${tab === "posts" ? "active" : ""}`} onClick={() => goTab("posts")} type="button">
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
            {tab === "posts" ? (
              <>
                <div className="content-head">
                  <div>
                    <div className="content-title">ประกาศของฉัน</div>
                    <div className="content-sub">ประกาศที่คุณวาดและบันทึกจากหน้าแผนที่</div>
                  </div>
                  <div className="content-pill">{posts.length} รายการ</div>
                </div>

                {posts.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-title">ยังไม่มีประกาศ</div>
                    <div className="empty-sub">ไปที่หน้าแผนที่ แล้ววาด + บันทึกเพื่อสร้างประกาศ</div>
                    <button className="outline-btn" type="button" onClick={() => navigate(`/map?mode=buy`)}>
                      ไปหน้าแผนที่ (โหมดลงขาย)
                    </button>
                  </div>
                ) : (
                  <div className="purchase-grid">
                    {posts.map((p) => (
                      <div key={p.id} className="purchase-card">
                        <div className="purchase-top">
                          <div className="purchase-title">
                            {p.owner || (p.agent ? `${p.agent} (นายหน้า)` : "") || "ไม่ระบุชื่อ"}
                          </div>
                          <span className="purchase-status paid">
                            {p.updatedAt ? `อัปเดต ${p.updatedAt}` : "ประกาศ"}
                          </span>
                        </div>

                        <div className="fav-row">
                          <span className="muted">ขนาด</span>
                          <b>{Number(p.size || 0).toLocaleString("th-TH")} ตร.วา</b>
                        </div>

                        <div className="fav-row">
                          <span className="muted">ราคารวม</span>
                          <b>{Number(p.totalPrice || 0).toLocaleString("th-TH")} บ.</b>
                        </div>

                        <div className="fav-row">
                          <span className="muted">โทร</span>
                          <b>{p.phone || "-"}</b>
                        </div>

                        <div className="fav-actions">
                          {/* ✅ กดแล้วโฟกัสแปลงนั้นบนแผนที่ */}
                          <button
                            className="outline-btn"
                            type="button"
                            onClick={() => navigate(`/map?mode=buy&focus=${p.id}`)}
                          >
                            ดูบนแผนที่
                          </button>

                          <button className="primary-btn" type="button" onClick={() => navigate(`/map?mode=buy&focus=${p.id}`)}>
                            แก้ไขประกาศ
                          </button>

                          <button className="danger-btn" type="button" onClick={() => onDeletePost(p.id)}>
                            ลบประกาศ
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : tab === "fav" ? (
              <>
                {/* ===== ของเดิมคุณ (fav) ===== */}
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
                    <button className="outline-btn" type="button" onClick={() => navigate(`/map?mode=buy`)}>
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
            ) : tab === "purchase" ? (
              <>
                {/* ===== ของเดิมคุณ (purchase) ===== */}
                <div className="content-head">
                  <div>
                    <div className="content-title">ประวัติการซื้อ</div>
                    <div className="content-sub">รายการที่คุณทำรายการชำระเงินไว้</div>
                  </div>
                  <div className="content-pill">{purchases.length} รายการ</div>
                </div>

                {purchases.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-title">ยังไม่มีประวัติการซื้อ</div>
                    <div className="empty-sub">เมื่อคุณชำระเงินสำเร็จ ระบบจะบันทึกไว้ที่นี่</div>
                    <button className="outline-btn" type="button" onClick={() => navigate(`/map?mode=buy`)}>
                      ไปหน้าแผนที่
                    </button>
                  </div>
                ) : (
                  <div className="purchase-grid">
                    {purchases.map((p) => (
                      <div key={p.id} className="purchase-card">
                        <div className="purchase-top">
                          <div className="purchase-title">{p.title || "รายการสั่งซื้อ"}</div>
                          <span className={`purchase-status ${p.status || "paid"}`}>
                            {p.status === "pending"
                              ? "รอชำระ"
                              : p.status === "cancelled"
                              ? "ยกเลิก"
                              : p.status === "refunded"
                              ? "คืนเงิน"
                              : "ชำระแล้ว"}
                          </span>
                        </div>

                        <div className="fav-row">
                          <span className="muted">ผู้ขาย</span>
                          <b>{p.seller || "-"}</b>
                        </div>

                        <div className="fav-row">
                          <span className="muted">วันที่ชำระ</span>
                          <b>{p.paidAt || "-"}</b>
                        </div>

                        <div className="fav-row">
                          <span className="muted">ยอดรวม</span>
                          <b>{Number(p.totalPrice || 0).toLocaleString("th-TH")} บ.</b>
                        </div>

                        {p.note ? <div className="purchase-note">{p.note}</div> : null}

                        <div className="fav-actions">
                          <button
                            className="outline-btn"
                            type="button"
                            onClick={() => navigate(`/map?mode=buy${p.landId ? `&focus=${p.landId}` : ""}`)}
                          >
                            ดูแปลง
                          </button>
                          <button className="danger-btn" type="button" onClick={() => removePurchase(p.id)}>
                            ลบประวัติ
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : tab === "info" ? (
              <>
                {/* ===== ของเดิมคุณ (info) ===== */}
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
                    <div className="v">
                      <span className="badge">สมาชิก</span>
                    </div>
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
