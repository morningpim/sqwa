import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Styles
import "../../css/profile.css";

// Utilities & Services
import {
  readAllLands,
  removeLand,
  subscribeLandsChanged,
  updateLandApproval,
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

import {
  readAllNews,
  removeNews,
  subscribeNewsChanged,
  createNews
} from "../../utils/newsLocal";

/* -------------------------------------------------------------------------- */
/* Helpers                                  */
/* -------------------------------------------------------------------------- */

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search || ""), [search]);
}

function renderStatusBadge(key, value) {
  if (key === "approved") {
    return value ? (
      <span className="badge badge-approved">✔ อนุมัติแล้ว</span>
    ) : (
      <span className="badge badge-pending">รออนุมัติ</span>
    );
  }

  if (key === "status") {
    if (value === "approved") return <span className="badge badge-approved">✔ อนุมัติแล้ว</span>;
    if (value === "rejected") return <span className="badge badge-rejected">✖ ปฏิเสธ</span>;
    return <span className="badge badge-pending">รอดำเนินการ</span>;
  }
  return null;
}

const LABEL_MAP = {
  id: "รหัส",
  size: "ขนาด",
  price: "ราคาต่อวา",
  totalPrice: "ราคารวม",
  width: "หน้ากว้าง",
  road: "ถนน",
  owner: "เจ้าของ",
  phone: "เบอร์โทร",
  lineId: "LINE",
  landFrame: "ระวาง",
  deedInformation: "เลขโฉนด",
  images: "รูปภาพ",
  createdAt: "สร้างเมื่อ",
  updatedAt: "อัปเดตล่าสุด",
  geometry: "ขอบเขตแปลง",
  location: "ตำแหน่ง",
  ownerId: "รหัสผู้ใช้",
  approved: "สถานะอนุมัติ",
  approvedAt: "อนุมัติเมื่อ",
};

/* -------------------------------------------------------------------------- */
/* Main Component                               */
/* -------------------------------------------------------------------------- */

export default function AdminPage() {
  const { t } = useTranslation("admin");
  const navigate = useNavigate();
  const q = useQuery();
  const tab = (q.get("tab") || "dashboard").toLowerCase();
  const [news, setNews] = useState(()=>readAllNews());

  // States
  const [lands, setLands] = useState(() => readAllLands());
  const [broadcasts, setBroadcasts] = useState(() => readAllCampaigns());
  const [applicants, setApplicants] = useState(() => readAllApplicants());
  const [selectedLand, setSelectedLand] = useState(null);

  // Derived States
  const pendingCount = useMemo(() => 
    applicants.filter((a) => a.status === "pending").length, 
  [applicants]);

  const sellerApplicants = useMemo(
    () => applicants.filter(a => a.type === "seller"),
    [applicants]
  );
  const sellerPendingCount = useMemo(
    () => sellerApplicants.filter(a => a.status === "pending").length,
    [sellerApplicants]
  );
  const [showNewsModal,setShowNewsModal] = useState(false);
  const [newsForm,setNewsForm] = useState({
    title:"",
    text:"",
    image:""
  });


  /* 🔄 Data Synchronization Hooks */
  useEffect(() => {
    const syncLands = () => setLands(readAllLands());
    const syncBroadcasts = () => setBroadcasts(readAllCampaigns());
    const syncApplicants = () => setApplicants(readAllApplicants());
    syncApplicants();
    const unsubLands = subscribeLandsChanged(syncLands);
    const unsubBroadcasts = subscribeCampaignsChanged(syncBroadcasts);
    const unsubApplicants = subscribeApplicantsChanged(syncApplicants);
    const syncNews = () => setNews(readAllNews());
    const unsubNews = subscribeNewsChanged(syncNews);

    return () => {
      unsubLands();
      unsubBroadcasts();
      unsubApplicants();
      unsubNews();
    };
  }, []);

  const [selectedApplicant, setSelectedApplicant] = useState(null);

  /* ⚡ Event Handlers */
  const goTab = (tname) => navigate(`/admin?tab=${tname}`);
  const goBroadcast = () => navigate("/admin/broadcast");

  const handleApproveLand = (id) => {
    if (window.confirm("อนุมัติที่ดินนี้?")) {
      updateLandApproval(id, true);
    }
  };

  const handleDeleteLand = (id) => {
    if (id && window.confirm(t("lands.confirmDelete"))) {
      removeLand(id);
    }
  };

  const handleDeleteBroadcast = (id) => {
    if (id && window.confirm(t("broadcast.confirmDelete"))) {
      removeCampaign(id);
    }
  };

  const handleApproveApplicant = (id) => {
    if (id && window.confirm(t("applicants.confirm.approve"))) {
      updateApplicantStatus(id, "approved");
    }
  };

  const handleRejectApplicant = (id) => {
    if (!id) return;
    const note = window.prompt(t("applicants.confirm.rejectPrompt"), "");
    updateApplicantStatus(id, "rejected", note || "");
  };

  const handleDeleteApplicant = (id) => {
    if (id && window.confirm(t("applicants.confirm.delete"))) {
      removeApplicant(id);
    }
  };

  const handleSeedApplicants = () => {
    if (window.confirm(t("applicants.seed"))) {
      seedMockApplicants();
      goTab("applicants");
    }
  };

  /* 🖼 Render Helpers */
  const renderSidebar = () => (
    <aside className="profile-side">
      <div className="side-title">{t("menu.title")}</div>
      {["dashboard", "broadcast", "lands", "news", "applicants", "payments", "settings"].map((k) => (
        <button
          key={k}
          className={`side-item ${tab === k ? "active" : ""}`}
          onClick={() => goTab(k)}
        >
          {t(`menu.${k}`)}
        </button>
      ))}
    </aside>
  );

  return (
    <div className="profile-page admin-page">
      <div className="profile-container">
        
        {/* Header Section */}
        <header className="profile-header">
          <div className="profile-avatar">A</div>
          <div className="profile-meta">
            <div className="profile-name">{t("header.title")}</div>
            <div className="profile-sub">{t("header.subtitle")}</div>
          </div>
          <button className="profile-edit-btn" onClick={goBroadcast}>
            {t("header.manageBroadcast")}
          </button>
        </header>

        {/* Stats Summary */}
        <div className="profile-stats">
          <div className="stat-card">
            <div className="stat-num">{lands.length}</div>
            <div className="stat-label">{t("stats.lands")}</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">{pendingCount}</div>
            <div className="stat-label">{t("stats.pendingApplicants")}</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">{broadcasts.length}</div>
            <div className="stat-label">{t("stats.transactions")}</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="profile-grid">
          {renderSidebar()}

          <section className="profile-content">
            {/* Dashboard Tab */}
            {tab === "dashboard" && (
              <>
                <div className="content-head">
                  <div>
                    <div className="content-title">{t("dashboard.title")}</div>
                    <div className="content-sub">{t("dashboard.subtitle")}</div>
                  </div>
                </div>
                <div className="info-card">
                  {[
                    { label: t("dashboard.lands"), val: lands.length },
                    { label: t("dashboard.pendingApplicants"), val: pendingCount },
                    { label: t("dashboard.transactions"), val: broadcasts.length },
                  ].map((item, idx) => (
                    <div className="info-row" key={idx}>
                      <div className="k">{item.label}</div>
                      <div className="v"><b>{item.val}</b></div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {tab === "news" && (
            <>
              <div className="content-head">
                <div>
                  <div className="content-title">จัดการข่าว</div>
                  <div className="content-sub">เพิ่ม ลบ และดูข่าวทั้งหมด</div>
                </div>

                <button
                  className="primary-btn"
                  onClick={()=>setShowNewsModal(true)}
                >
                  + เพิ่มข่าว
                </button>
              </div>

              <div className="purchase-grid">
                {news.map(n=>(
                  <div key={n.id} className="purchase-card">
                    <div className="purchase-title">{n.title}</div>

                    <div className="fav-row">
                      <span className="muted">วันที่</span>
                      <b>{new Date(n.createdAt).toLocaleDateString()}</b>
                    </div>

                    <div className="fav-actions">
                      <button
                        className="danger-btn"
                        onClick={()=>removeNews(n.id)}
                      >
                        ลบ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
            )}

            {/* Lands Tab */}
            {tab === "lands" && (
              <>
                <div className="content-head">
                  <div>
                    <div className="content-title">{t("lands.title")}</div>
                    <div className="content-sub">{t("lands.subtitle")}</div>
                  </div>
                  <div className="content-pill">{t("lands.count", { count: lands.length })}</div>
                </div>
                <div className="purchase-grid">
                  {lands.map((p) => (
                    <div key={p.id} className="purchase-card">
                      <div className="purchase-top">
                        <div className="purchase-title">{p.owner || t("lands.ownerFallback")}</div>
                      </div>
                      <div className="fav-row">
                        <span className="text-muted">{t("lands.field.size")}</span>
                        <b>{p.size} {t("lands.field.unitSqw")}</b>
                      </div>
                      <div className="fav-actions fav-actions--row">
                        <button className="outline-btn" onClick={() => setSelectedLand(p)}>
                          {t("lands.action.viewDetails")}
                        </button>
                        <button className="primary-btn" onClick={() => navigate(`/admin/broadcast?landId=${p.id}`)}>
                          {t("lands.action.broadcast")}
                        </button>
                        <button className="danger-btn" onClick={() => handleDeleteLand(p.id)}>
                          {t("lands.action.delete")}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {lands.length === 0 && (
                  <div className="empty-state">
                    <div className="empty-title">{t("lands.empty.title")}</div>
                    <div className="empty-sub">{t("lands.empty.subtitle")}</div>
                  </div>
                )}
              </>
            )}

            {/* Applicants Tab */}
            {tab === "applicants" && (
              <>
                <div className="content-head">
                  <div>
                    <div className="content-title">{t("applicants.title")}</div>
                    <div className="content-sub">{t("applicants.subtitle")}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <button className="outline-btn" onClick={handleSeedApplicants}>
                      {t("applicants.seed")}
                    </button>
                    <div className="content-pill">
                      {t("applicants.summary", { total: applicants.length, pending: pendingCount })}
                    </div>
                  </div>
                </div>
                <div className="purchase-grid">
                  {sellerApplicants.map((a) => (
                    <div key={a.id} className="purchase-card">
                      <div className="purchase-title">{a.name ? `${a.name} ${a.lastname || ""}` : t("lands.ownerFallback")}</div>
                      <div className="fav-row">
                        <span className="muted">{t("applicants.field.type")}</span>
                        <b>{t(`applicants.type.${a.type || "general"}`)}</b>
                      </div>
                      <div className="fav-row">
                        <span className="muted">{t("applicants.field.status")}</span>
                        <b>{t(`applicants.status.${a.status}`)}</b>
                      </div>
                      <div className="fav-actions">
                        <button className="outline-btn" onClick={() => setSelectedApplicant(a)}>
                          {t("applicants.action.view")}
                        </button>
                        <button 
                          className="primary-btn" 
                          onClick={() => handleApproveApplicant(a.id)}
                          disabled={a.status === "approved"}
                        >
                          {t("applicants.action.approve")}
                        </button>
                        <button className="danger-btn" onClick={() => handleDeleteApplicant(a.id)}>
                          {t("applicants.action.delete")}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Broadcast Tab (Simplified) */}
            {tab === "broadcast" && (
              <>
                <div className="content-head">
                  <div className="content-title">{t("broadcast.title")}</div>
                </div>
                <div className="fav-grid">
                  {broadcasts.map((b) => (
                    <div key={b.id} className="fav-card">
                      <div className="fav-owner">{b.title || t("broadcast.fallbackTitle")}</div>
                      <div className="fav-actions">
                        <button className="danger-btn" onClick={() => handleDeleteBroadcast(b.id)}>
                          {t("broadcast.action.delete")}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Fallback for Payments/Settings */}
            {(tab === "payments" || tab === "settings") && (
              <div className="empty-state">
                <div className="empty-title">{t("fallback.notReady.title")}</div>
                <div className="empty-sub">{t("fallback.notReady.subtitle")}</div>
              </div>
            )}
          </section>
        </div>

        {/* Details Modal */}
        {selectedLand && (
          <div className="modal-overlay" onClick={() => setSelectedLand(null)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{t("lands.detail.title")}</h3>
                <button className="modal-close" onClick={() => setSelectedLand(null)}>✕</button>
              </div>
              <div className="modal-body">
                {Object.entries(selectedLand)
                  .filter(([key]) => !["geometry", "ownerId", "location"].includes(key))
                  .map(([key, value]) => {
                    if (value === null || value === undefined || value === "") return null;
                    
                    if (key === "images") {
                      return (
                        <div key={key} className="modal-col">
                          <span>{LABEL_MAP[key] || key}</span>
                          <div className="modal-images">
                            {value.map((src, i) => <img key={i} src={src} alt="land" />)}
                          </div>
                        </div>
                      );
                    }

                    const badge = renderStatusBadge(key, value);
                    return (
                      <div key={key} className={typeof value === "object" ? "modal-col" : "modal-row"}>
                        <span>{LABEL_MAP[key] || key}</span>
                        {badge ? badge : <b>{typeof value === "object" ? JSON.stringify(value) : String(value)}</b>}
                      </div>
                    );
                  })}
              </div>
              <div className="modal-footer">
                <button className="outline-btn" onClick={() => setSelectedLand(null)}>
                  {t("lands.common.close")}
                </button>
                <button 
                  className="success-btn" 
                  onClick={() => { handleApproveLand(selectedLand.id); setSelectedLand(null); }}
                >
                  {t("lands.action.approve")}
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedApplicant && (
        <div className="modal-overlay" onClick={() => setSelectedApplicant(null)}>
          <div className="modal-card" onClick={(e)=>e.stopPropagation()}>

            <div className="modal-header">
              <h3>ข้อมูลผู้สมัคร</h3>
              <button className="modal-close" onClick={()=>setSelectedApplicant(null)}>✕</button>
            </div>

            <div className="modal-body">

              {Object.entries(selectedApplicant).map(([key,val])=>{
                if(val === null || val === undefined || val === "") return null

                if(key === "investorQuiz"){
                  return(
                    <div key={key} className="modal-col">
                      <span>คะแนนแบบประเมิน</span>
                      <pre className="modal-json">
                        {JSON.stringify(val,null,2)}
                      </pre>
                    </div>
                  )
                }

                return(
                  <div key={key} className="modal-row">
                    <span>{key}</span>
                    <b>{String(val)}</b>
                  </div>
                )
              })}

            </div>

            <div className="modal-footer">

              <button
                className="outline-btn"
                onClick={()=>setSelectedApplicant(null)}
              >
                ปิด
              </button>

              <button
                className="success-btn"
                disabled={selectedApplicant.status === "approved"}
                onClick={()=>{
                  handleApproveApplicant(selectedApplicant.id)
                  setSelectedApplicant(null)
                }}
              >
                อนุมัติ
              </button>

              <button
                className="danger-btn"
                disabled={selectedApplicant.status === "rejected"}
                onClick={()=>{
                  handleRejectApplicant(selectedApplicant.id)
                  setSelectedApplicant(null)
                }}
              >
                ปฏิเสธ
              </button>

            </div>
          </div>
        </div>
      )}

      {showNewsModal && (
      <div className="modal-overlay" onClick={()=>setShowNewsModal(false)}>
        <div className="modal-card" onClick={e=>e.stopPropagation()}>

          <div className="modal-header">
            <h3>เพิ่มข่าวใหม่</h3>
            <button className="modal-close" onClick={()=>setShowNewsModal(false)}>✕</button>
          </div>

          <div className="modal-body">

            <div className="modal-col">
              <span>หัวข้อข่าว</span>
              <input
                className="input"
                value={newsForm.title}
                onChange={e=>setNewsForm({...newsForm,title:e.target.value})}
              />
            </div>

            <div className="modal-col">
              <span>เนื้อหา</span>
              <textarea
                className="textarea"
                rows={4}
                value={newsForm.text}
                onChange={e=>setNewsForm({...newsForm,text:e.target.value})}
              />
            </div>

            <div className="modal-col">
              <span>URL รูป</span>
              <input
                className="input"
                value={newsForm.image}
                onChange={e=>setNewsForm({...newsForm,image:e.target.value})}
              />
            </div>

          </div>

          <div className="modal-footer">

            <button className="outline-btn" onClick={()=>setShowNewsModal(false)}>
              ยกเลิก
            </button>

            <button
              className="success-btn"
              onClick={()=>{
                if(!newsForm.title || !newsForm.text){
                  alert("กรอกข้อมูลให้ครบ");
                  return;
                }

                createNews({
                  ...newsForm,
                  image: newsForm.image || "/news-default.jpg"
                });

                setNewsForm({title:"",text:"",image:""});
                setShowNewsModal(false);
              }}
            >
              บันทึกข่าว
            </button>

          </div>

        </div>
      </div>
    )}

      </div>
    </div>
  );
}