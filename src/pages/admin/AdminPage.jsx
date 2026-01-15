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

import {
  readAllApplicants,
  removeApplicant,
  subscribeApplicantsChanged,
  updateApplicantStatus,
  seedMockApplicants,
} from "../../utils/applicantsLocal";

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

  const [applicants, setApplicants] = useState(() => readAllApplicants());
  const pendingCount = applicants.filter((a) => a.status === "pending").length;

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

  /* -------- sync applicants (✅ เอาอันเดียวพอ) -------- */
  useEffect(() => {
    const sync = () => setApplicants(readAllApplicants());
    sync();
    const unsub = subscribeApplicantsChanged(sync);
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

  const onApproveApplicant = (id) => {
    if (!id) return;
    if (!window.confirm("อนุมัติผู้สมัครรายนี้ใช่ไหม?")) return;
    updateApplicantStatus(id, "approved");
  };

  const onRejectApplicant = (id) => {
    if (!id) return;
    const note = window.prompt("เหตุผลที่ไม่อนุมัติ (optional):", "");
    updateApplicantStatus(id, "rejected", note || "");
  };

  const onDeleteApplicant = (id) => {
    if (!id) return;
    if (!window.confirm("ลบผู้สมัครรายนี้ใช่ไหม?")) return;
    removeApplicant(id);
  };

  const onSeedApplicants = () => {
    if (!window.confirm("สร้าง mock ผู้สมัคร 5 รายการ? (จะเขียนทับข้อมูลเดิม)"))
      return;
    seedMockApplicants();
    goTab("applicants");
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
            <div className="stat-num">{pendingCount}</div>
            <div className="stat-label">ผู้สมัครรออนุมัติ</div>
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
              className={`side-item ${tab === "applicants" ? "active" : ""}`}
              onClick={() => goTab("applicants")}
            >
              อนุมัติผู้สมัคร
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
                    <div className="k">ผู้สมัครรออนุมัติ</div>
                    <div className="v">
                      <b>{pendingCount}</b>
                    </div>
                  </div>
                  <div className="info-row">
                    <div className="k">ธุรกรรม</div>
                    <div className="v">
                      <b>{broadcasts.length}</b>
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
                  <div className="content-pill">{broadcasts.length} แคมเปญ</div>
                </div>

                <div className="fav-grid">
                  {broadcasts.map((b) => (
                    <div key={b.id} className="fav-card">
                      <div className="fav-top">
                        <div className="fav-owner">{b.title || "Broadcast"}</div>
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
                              `/admin/broadcast${b.landId ? `?landId=${b.landId}` : ""}`
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
                        <div className="purchase-title">{p.owner || "ไม่ระบุชื่อ"}</div>
                      </div>

                      <div className="fav-row">
                        <span className="muted">ขนาด</span>
                        <b>{p.size} ตร.วา</b>
                      </div>

                      <div className="fav-actions">
                        <button
                          className="outline-btn"
                          onClick={() => navigate(`/map?mode=buy&focus=${p.id}`)}
                        >
                          ดูบนแผนที่
                        </button>

                        <button
                          className="primary-btn"
                          onClick={() => navigate(`/admin/broadcast?landId=${p.id}`)}
                        >
                          ทำ Broadcast
                        </button>

                        <button className="danger-btn" onClick={() => onDeleteLand(p.id)}>
                          ลบ
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* -------- applicants (✅ เพิ่มตรงนี้) -------- */}
            {tab === "applicants" && (
              <>
                <div className="content-head">
                  <div>
                    <div className="content-title">อนุมัติผู้สมัคร</div>
                    <div className="content-sub">
                      ข้อมูล mock จาก localStorage (Approve / Reject)
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <button className="outline-btn" onClick={onSeedApplicants}>
                      สร้าง Mock Data (5)
                    </button>
                    <div className="content-pill">
                      ทั้งหมด {applicants.length} / รออนุมัติ {pendingCount}
                    </div>
                  </div>
                </div>

                <div className="purchase-grid">
                  {applicants.map((a) => {
                    const roleLabel =
                      a.type === "seller"
                        ? `Seller${a.role ? ` (${a.role})` : ""}`
                        : a.type === "investor"
                        ? "Investor"
                        : "General";

                    const statusLabel =
                      a.status === "pending"
                        ? "รออนุมัติ"
                        : a.status === "approved"
                        ? "อนุมัติแล้ว"
                        : "ไม่อนุมัติ";

                    return (
                      <div key={a.id} className="purchase-card">
                        <div className="purchase-top">
                          <div className="purchase-title">
                            {a.name ? `${a.name} ${a.lastname || ""}` : "ไม่ระบุชื่อ"}
                          </div>
                        </div>

                        <div className="fav-row">
                          <span className="muted">ประเภท</span>
                          <b>{roleLabel}</b>
                        </div>

                        <div className="fav-row">
                          <span className="muted">สถานะ</span>
                          <b>{statusLabel}</b>
                        </div>

                        {a.type === "seller" && a.role === "agent" && (
                          <div className="fav-row">
                            <span className="muted">License</span>
                            <b>{a.agentLicense || "-"}</b>
                          </div>
                        )}

                        {a.type === "investor" && (
                          <div className="fav-row">
                            <span className="muted">Risk Score</span>
                            <b>{a.investorScore ?? "-"}</b>
                          </div>
                        )}

                        {a.status === "rejected" && a.statusNote && (
                          <div className="fav-row">
                            <span className="muted">เหตุผล</span>
                            <b>{a.statusNote}</b>
                          </div>
                        )}

                        <div className="fav-actions">
                          <button
                            className="outline-btn"
                            onClick={() => alert(JSON.stringify(a, null, 2))}
                          >
                            ดูรายละเอียด
                          </button>

                          <button
                            className="primary-btn"
                            onClick={() => onApproveApplicant(a.id)}
                            disabled={a.status === "approved"}
                            title={a.status === "approved" ? "อนุมัติแล้ว" : ""}
                          >
                            อนุมัติ
                          </button>

                          <button
                            className="outline-btn"
                            onClick={() => onRejectApplicant(a.id)}
                            disabled={a.status === "rejected"}
                            title={a.status === "rejected" ? "ไม่อนุมัติแล้ว" : ""}
                          >
                            ไม่อนุมัติ
                          </button>

                          <button className="danger-btn" onClick={() => onDeleteApplicant(a.id)}>
                            ลบ
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {applicants.length === 0 && (
                  <div className="empty-state">
                    <div className="empty-title">ยังไม่มีผู้สมัคร</div>
                    <div className="empty-sub">
                      กด “สร้าง Mock Data (5)” เพื่อใส่ข้อมูลทดสอบ
                    </div>
                  </div>
                )}
              </>
            )}

            {/* -------- payments / settings -------- */}
            {(tab === "payments" || tab === "settings") && (
              <div className="empty-state">
                <div className="empty-title">ยังไม่พร้อมใช้งาน</div>
                <div className="empty-sub">เดี๋ยวพัฒนาต่อในเฟสถัดไป</div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
