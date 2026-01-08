import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../css/profile.css";

import {
  readAllLands,
  removeLand,
  subscribeLandsChanged,
} from "../../utils/landsLocal";

import {
  readAllCampaigns,
  removeCampaign,
  subscribeCampaignsChanged,
} from "../../utils/broadcastLocal";

/* ---------------- helpers ---------------- */
function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search || ""), [search]);
}

/* ================= component ================= */
export default function AdminPage() {
  const navigate = useNavigate();
  const q = useQuery();
  const tab = (q.get("tab") || "dashboard").toLowerCase();

  const [lands, setLands] = useState(() => readAllLands());
  const [broadcasts, setBroadcasts] = useState(() => readAllCampaigns());

  /* -------- sync lands -------- */
  useEffect(() => {
    const sync = () => setLands(readAllLands());
    sync();
    const unsub = subscribeLandsChanged(sync);
    return unsub;
  }, []);

  /* -------- sync broadcasts -------- */
  useEffect(() => {
    const sync = () => setBroadcasts(readAllCampaigns());
    sync();
    const unsub = subscribeCampaignsChanged(sync);
    return unsub;
  }, []);

  /* -------- actions -------- */
  const goTab = (t) => navigate(`/admin?tab=${t}`);

  const goBroadcast = () => navigate("/admin/broadcast");

  const onDeleteLand = (id) => {
    if (!id) return;
    if (!window.confirm("ต้องการลบประกาศนี้ใช่ไหม?")) return;
    removeLand(id);
  };

  const onDeleteBroadcast = (id) => {
    if (!id) return;
    if (!window.confirm("ต้องการลบแคมเปญบอร์ดแคสนี้ใช่ไหม?")) return;
    removeCampaign(id);
  };

  /* ================= render ================= */
  return (
    <div className="profile-page admin-page">
      <div className="profile-container">
        {/* ================= header ================= */}
        <div className="profile-header">
          <div className="profile-avatar">A</div>
          <div className="profile-meta">
            <div className="profile-name">Admin Panel</div>
            <div className="profile-sub">ผู้ดูแลระบบ</div>
          </div>

          <button className="profile-edit-btn" onClick={goBroadcast}>
            จัดการ Broadcast
          </button>
        </div>

        {/* ================= stats ================= */}
        <div className="profile-stats">
          <div className="stat-card">
            <div className="stat-num">{lands.length}</div>
            <div className="stat-label">ประกาศทั้งหมด</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">1</div>
            <div className="stat-label">Favorite ทั้งหมด</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">{broadcasts.length}</div>
            <div className="stat-label">ธุรกรรม</div>
          </div>
        </div>

        {/* ================= layout ================= */}
        <div className="profile-grid">
          {/* ===== left menu ===== */}
          <aside className="profile-side">
            <div className="side-title">เมนูแอดมิน</div>

            <button
              className={`side-item ${tab === "dashboard" ? "active" : ""}`}
              onClick={() => goTab("dashboard")}
            >
              Dashboard
            </button>

            <button
              className={`side-item ${tab === "broadcast" ? "active" : ""}`}
              onClick={() => goTab("broadcast")}
            >
              Broadcast &amp; Line ADs
            </button>

            <button
              className={`side-item ${tab === "lands" ? "active" : ""}`}
              onClick={() => goTab("lands")}
            >
              จัดการประกาศ
            </button>

            <button
              className={`side-item ${tab === "payments" ? "active" : ""}`}
              onClick={() => goTab("payments")}
            >
              ธุรกรรม/ชำระเงิน
            </button>

            <button
              className={`side-item ${tab === "settings" ? "active" : ""}`}
              onClick={() => goTab("settings")}
            >
              ตั้งค่าระบบ
            </button>
          </aside>

          {/* ===== right content ===== */}
          <section className="profile-content">
            {/* -------- dashboard -------- */}
            {tab === "dashboard" && (
              <>
                <div className="content-head">
                  <div>
                    <div className="content-title">Dashboard รวม</div>
                    <div className="content-sub">
                      ภาพรวมข้อมูลของระบบ (MVP จาก localStorage)
                    </div>
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-row">
                    <div className="k">ประกาศทั้งหมด</div>
                    <div className="v">
                      <b>{lands.length}</b>
                    </div>
                  </div>
                  <div className="info-row">
                    <div className="k">ธุรกรรม</div>
                    <div className="v">
                      <b>{broadcasts.length}</b>
                    </div>
                  </div>
                  <div className="info-row">
                    <div className="k">ยอดรวมธุรกรรม</div>
                    <div className="v">
                      <b>250</b> บาท
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* -------- broadcast -------- */}
            {tab === "broadcast" && (
              <>
                <div className="content-head">
                  <div>
                    <div className="content-title">Broadcast & Line ADs</div>
                    <div className="content-sub">
                      รายการแคมเปญบอร์ดแคสทั้งหมด
                    </div>
                  </div>
                  <div className="content-pill">
                    {broadcasts.length} แคมเปญ
                  </div>
                </div>

                <div className="fav-grid">
                  {broadcasts.map((b) => (
                    <div key={b.id} className="fav-card">
                      <div className="fav-top">
                        <div className="fav-owner">
                          {b.title || "Broadcast"}
                        </div>
                        <button
                          className="fav-remove"
                          onClick={() => onDeleteBroadcast(b.id)}
                        >
                          ลบ
                        </button>
                      </div>

                      <div className="fav-row">
                        <span className="muted">โหมด</span>
                        <b>{b.mode}</b>
                      </div>

                      <div className="fav-actions">
                        <button
                          className="outline-btn"
                          onClick={() =>
                            navigate(
                              `/admin/broadcast${
                                b.landId ? `?landId=${b.landId}` : ""
                              }`
                            )
                          }
                        >
                          ดู / แก้ไข
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* -------- lands -------- */}
            {tab === "lands" && (
              <>
                <div className="content-head">
                  <div>
                    <div className="content-title">จัดการประกาศ</div>
                    <div className="content-sub">
                      ดู / โฟกัสบนแผนที่ / ทำ Broadcast
                    </div>
                  </div>
                  <div className="content-pill">{lands.length} รายการ</div>
                </div>

                <div className="purchase-grid">
                  {lands.map((p) => (
                    <div key={p.id} className="purchase-card">
                      <div className="purchase-top">
                        <div className="purchase-title">
                          {p.owner || "ไม่ระบุชื่อ"}
                        </div>
                      </div>

                      <div className="fav-row">
                        <span className="muted">ขนาด</span>
                        <b>{p.size} ตร.วา</b>
                      </div>

                      <div className="fav-actions">
                        <button
                          className="outline-btn"
                          onClick={() =>
                            navigate(`/map?mode=buy&focus=${p.id}`)
                          }
                        >
                          ดูบนแผนที่
                        </button>

                        <button
                          className="primary-btn"
                          onClick={() =>
                            navigate(`/admin/broadcast?landId=${p.id}`)
                          }
                        >
                          ทำ Broadcast
                        </button>

                        <button
                          className="danger-btn"
                          onClick={() => onDeleteLand(p.id)}
                        >
                          ลบ
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* -------- payments / settings -------- */}
            {(tab === "payments" || tab === "settings") && (
              <div className="empty-state">
                <div className="empty-title">ยังไม่พร้อมใช้งาน</div>
                <div className="empty-sub">
                  เดี๋ยวพัฒนาต่อในเฟสถัดไป
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
