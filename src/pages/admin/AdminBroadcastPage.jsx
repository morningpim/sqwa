// src/pages/admin/AdminBroadcastPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import "../../css/admin-broadcast.css";

import {
  readAllBroadcasts,
  removeBroadcastCampaign,
  seedBroadcastIfEmpty,
  subscribeBroadcastChanged,
  updateBroadcastCampaign,
} from "../../utils/broadcastStore";

// ✅ ใช้ modal สร้างแคมเปญที่คุณทำไว้แล้ว
import BroadcastCreateModal from "../../components/map/broadcast/BroadcastCreateModal";

// (optional) ถ้ามี AuthProvider อยู่แล้ว ใช้อันนี้ได้
import { useAuth } from "../../auth/AuthProvider";

function dayLabel(d) {
  const map = { MON: "จ", TUE: "อ", WED: "พ", THU: "พฤ", FRI: "ศ", SAT: "ส", SUN: "อา" };
  return map[d] || d;
}

function channelLabel(ch) {
  if (ch === "SQW_WEB") return "เว็บ SQW";
  if (ch === "LINE_ADS") return "LINE ADs";
  return ch;
}

function modeLabel(m) {
  if (m === "buy_sell") return "ซื้อขายที่ดิน";
  if (m === "consignment") return "ขายฝากที่ดิน";
  return m;
}

function statusLabel(s) {
  if (s === "draft") return "ร่าง";
  if (s === "scheduled") return "ตั้งเวลา";
  if (s === "sent") return "ส่งแล้ว";
  if (s === "disabled") return "ปิดใช้งาน";
  return s;
}

export default function AdminBroadcastPage() {
  const { role } = useAuth?.() || { role: "admin" }; // fallback

  // ✅ guard แบบง่าย
  const isAdmin = role === "admin";

  const [items, setItems] = useState(() => readAllBroadcasts());

  useEffect(() => {
    seedBroadcastIfEmpty();
    const sync = () => setItems(readAllBroadcasts());
    sync();
    const unsub = subscribeBroadcastChanged(sync);
    return unsub;
  }, []);

  // Filters
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [mode, setMode] = useState("all");
  const [channel, setChannel] = useState("all");

  // Create modal
  const [createOpen, setCreateOpen] = useState(false);
  const [preview, setPreview] = useState(null); // campaign object

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    return (items || []).filter((x) => {
      if (status !== "all" && String(x.status) !== status) return false;
      if (mode !== "all" && String(x.mode) !== mode) return false;
      if (channel !== "all") {
        const chs = Array.isArray(x.channel) ? x.channel : [];
        if (!chs.includes(channel)) return false;
      }
      if (!text) return true;
      const hay = `${x.title || ""} ${x.message || ""}`.toLowerCase();
      return hay.includes(text) || String(x.id || "").toLowerCase().includes(text);
    });
  }, [items, q, status, mode, channel]);

  const onDisable = (id) => {
    if (!window.confirm("ต้องการปิดใช้งานแคมเปญนี้?")) return;
    updateBroadcastCampaign(id, { status: "disabled", updatedAt: new Date().toISOString() });
  };

  const onEnable = (id) => {
    updateBroadcastCampaign(id, { status: "scheduled", updatedAt: new Date().toISOString() });
  };

  const onMarkSent = (id) => {
    if (!window.confirm("ทำเครื่องหมายว่า 'ส่งแล้ว' ?")) return;
    updateBroadcastCampaign(id, {
      status: "sent",
      sentAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  const onDelete = (id) => {
    if (!window.confirm("ต้องการลบแคมเปญนี้ใช่ไหม?")) return;
    removeBroadcastCampaign(id);
    if (preview?.id === id) setPreview(null);
  };

  if (!isAdmin) {
    return (
      <div className="admin-shell">
        <div className="admin-card">
          <div className="admin-title">Admin Broadcast</div>
          <div className="admin-muted">สิทธิ์ไม่เพียงพอ (ต้องเป็น admin)</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <div className="admin-topbar">
        <div>
          <div className="admin-title">Boardcast & LINE ADs</div>
          <div className="admin-muted">
            จัดการข่าวประชาสัมพันธ์ (เลือกโหมดซื้อขาย/ขายฝาก + ช่องทางเว็บ/LINE)
          </div>
        </div>

        <div className="admin-actions">
          <button className="btn primary" onClick={() => setCreateOpen(true)}>
            + สร้างแคมเปญ
          </button>
        </div>
      </div>

      <div className="admin-filters">
        <input
          className="input"
          placeholder="ค้นหา: ชื่อ / ข้อความ / ID"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">สถานะ: ทั้งหมด</option>
          <option value="draft">ร่าง</option>
          <option value="scheduled">ตั้งเวลา</option>
          <option value="sent">ส่งแล้ว</option>
          <option value="disabled">ปิดใช้งาน</option>
        </select>

        <select className="select" value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="all">โหมด: ทั้งหมด</option>
          <option value="buy_sell">ซื้อขายที่ดิน</option>
          <option value="consignment">ขายฝากที่ดิน</option>
        </select>

        <select className="select" value={channel} onChange={(e) => setChannel(e.target.value)}>
          <option value="all">ช่องทาง: ทั้งหมด</option>
          <option value="SQW_WEB">เว็บ SQW</option>
          <option value="LINE_ADS">LINE ADs</option>
        </select>
      </div>

      <div className="admin-grid">
        {/* TABLE */}
        <div className="admin-card">
          <div className="card-head">
            <div className="card-title">รายการแคมเปญ ({filtered.length})</div>
          </div>

          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>ชื่อ</th>
                  <th>โหมด</th>
                  <th>ช่องทาง</th>
                  <th>วัน/เวลา</th>
                  <th>สถานะ</th>
                  <th style={{ textAlign: "right" }}>จัดการ</th>
                </tr>
              </thead>

              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty">
                      ยังไม่มีแคมเปญ
                    </td>
                  </tr>
                ) : (
                  filtered.map((x) => {
                    const days = x?.schedule?.days || [];
                    const time = x?.schedule?.time || "-";
                    const chs = Array.isArray(x.channel) ? x.channel : [];

                    return (
                      <tr key={x.id}>
                        <td>
                          <div className="cell-title" onClick={() => setPreview(x)} role="button" tabIndex={0}>
                            {x.title || "(ไม่มีชื่อ)"}
                          </div>
                          <div className="cell-sub">
                            ID: {x.id} • ที่ดิน: {Array.isArray(x.landIds) ? x.landIds.length : 0} แปลง
                          </div>
                        </td>

                        <td>{modeLabel(x.mode)}</td>

                        <td>
                          <div className="chips">
                            {chs.length ? chs.map((c) => (
                              <span className="chip" key={c}>{channelLabel(c)}</span>
                            )) : <span className="muted">-</span>}
                          </div>
                        </td>

                        <td>
                          <div className="chips">
                            {Array.isArray(days) && days.length ? (
                              days.map((d) => (
                                <span className="chip soft" key={d}>
                                  {dayLabel(d)}
                                </span>
                              ))
                            ) : (
                              <span className="muted">-</span>
                            )}
                            <span className="chip soft">{time}</span>
                          </div>
                        </td>

                        <td>
                          <span className={`pill ${x.status || ""}`}>{statusLabel(x.status)}</span>
                        </td>

                        <td style={{ textAlign: "right" }}>
                          <div className="row-actions">
                            <button className="btn" onClick={() => setPreview(x)}>ดู</button>

                            {x.status !== "disabled" ? (
                              <button className="btn warn" onClick={() => onDisable(x.id)}>
                                ปิด
                              </button>
                            ) : (
                              <button className="btn" onClick={() => onEnable(x.id)}>
                                เปิด
                              </button>
                            )}

                            {x.status !== "sent" && (
                              <button className="btn" onClick={() => onMarkSent(x.id)}>
                                ส่งแล้ว
                              </button>
                            )}

                            <button className="btn danger" onClick={() => onDelete(x.id)}>
                              ลบ
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PREVIEW */}
        <div className="admin-card">
          <div className="card-head">
            <div className="card-title">Preview การ์ดประชาสัมพันธ์</div>
            <div className="card-sub">คลิกรายการทางซ้ายเพื่อดูรายละเอียด</div>
          </div>

          {!preview ? (
            <div className="preview-empty">ยังไม่ได้เลือกรายการ</div>
          ) : (
            <div className="preview">
              <div className="pv-title">{preview.title || "(ไม่มีชื่อ)"}</div>
              <div className="pv-meta">
                <span className="chip">{modeLabel(preview.mode)}</span>
                <span className="chip soft">{statusLabel(preview.status)}</span>
                {(preview.channel || []).map((c) => (
                  <span className="chip" key={c}>{channelLabel(c)}</span>
                ))}
              </div>

              <div className="pv-msg">{preview.message || "-"}</div>

              <div className="pv-info">
                <div><span className="muted">ที่ดินที่เลือก:</span> <b>{Array.isArray(preview.landIds) ? preview.landIds.length : 0}</b> แปลง</div>
                <div><span className="muted">ตารางส่ง:</span> <b>
                  {(preview?.schedule?.days || []).map(dayLabel).join(" / ") || "-"}
                </b> <span className="muted">เวลา</span> <b>{preview?.schedule?.time || "-"}</b></div>
                <div><span className="muted">แก้ไขล่าสุด:</span> <b>{preview.updatedAt ? String(preview.updatedAt).slice(0, 19).replace("T", " ") : "-"}</b></div>
              </div>

              <div className="pv-cta">
                <button className="btn" onClick={() => navigator.clipboard.writeText(preview.message || "")}>
                  คัดลอกข้อความ
                </button>
                <button className="btn primary" onClick={() => alert("TODO: ส่งจริงไป LINE / WEB (ต่อ backend/cron)")}>
                  ส่งจริง (อนาคต)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Modal สร้างแคมเปญ (ใช้ของเดิมคุณ) */}
      <BroadcastCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        land={null}                 // admin page: สร้างแบบเลือกหลายแปลงภายใน modal หรือทำทีหลัง
        createdByRole="admin"
        createdByUserId="admin"
        mode="buy_sell"            // default
        intent={null}
        defaultFeatured={false}
        defaultPriceTHB={0}
      />
    </div>
  );
}
