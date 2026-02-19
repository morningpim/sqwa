  // src/components/map/SaleSidePanel.jsx
  import React, { useEffect, useMemo, useState } from "react";
  import { useTranslation } from "react-i18next";
  import "../../css/SaleSidePanel.css";


  /**
   * Props ที่ใช้:
   * - open: boolean
   * - onToggle: () => void
   * - role: "buyer"|"seller"|"landlord"|"admin"|...
   * - allowed: boolean (จะโชว์ panel ไหม)
   * - mode: "buy"|"sell"|"eia"
   * - drawingEnabled: boolean
   * - landData: object (state จาก parent)
   * - setLandData: (updater) => void
   * - savedLands: array (landsLocal)
   * - onSave: () => void  (parent จะบันทึก โดยดู landData + geometry)
   * - onDelete: (id) => void
   * - onFocusLand: (land) => void
   */

  function sanitizeDecimal(v) {
    const s = String(v ?? "");
    const cleaned = s.replace(/[^\d.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length <= 1) return cleaned;
    return `${parts[0]}.${parts.slice(1).join("")}`;
  }

  function onlyDigits(v) {
    return String(v ?? "").replace(/[^\d]/g, "");
  }

  function toNumberSafe(v) {
    const n = Number(String(v ?? "").replace(/,/g, ""));
    return Number.isFinite(n) ? n : 0;
  }

  function formatNumber(v) {
    const n = toNumberSafe(v);
    return n ? n.toLocaleString("th-TH") : "";
  }

  function formatDecimal(v, digits = 2) {
    const n = toNumberSafe(v);
    if (!n) return "";
    return n.toLocaleString("th-TH", { maximumFractionDigits: digits });
  }

  function sqwFromRNW(rai, ngan, wah) {
    const r = toNumberSafe(rai);
    const n = toNumberSafe(ngan);
    const w = toNumberSafe(wah);
    // 1 ไร่ = 400 ตร.วา, 1 งาน = 100 ตร.วา, 1 วา = 1 ตร.วา
    return r * 400 + n * 100 + w;
  }

  function rnwFromSqw(sizeSqw) {
    const total = Math.max(0, Math.floor(toNumberSafe(sizeSqw)));
    const rai = Math.floor(total / 400);
    const rem1 = total % 400;
    const ngan = Math.floor(rem1 / 100);
    const wah = rem1 % 100;
    return { rai, ngan, wah };
  }

  /** ================== EDIT GATE: แก้ไขได้หลังครบ 14 วัน (นับจาก createdAt เท่านั้น) ================== */
  function parseDateSafe(v) {
    if (!v) return null;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  function diffDaysFloor(from, to) {
    const ms = to.getTime() - from.getTime();
    return Math.floor(ms / (1000 * 60 * 60 * 24));
  }

  function getEditGateInfo(land, days = 14) {
    const now = new Date();

    // ✅ นับจาก createdAt เท่านั้น
    const base = parseDateSafe(land?.createdAt);

    // ถ้าไม่มี createdAt ให้ "ล็อกไว้ก่อน" เพื่อกัน bypass
    if (!base) return { canEdit: false, baseDate: null, daysPassed: null, daysLeft: days };

    const daysPassed = diffDaysFloor(base, now);
    const daysLeft = Math.max(0, days - daysPassed);
    return { canEdit: daysPassed >= days, baseDate: base, daysPassed, daysLeft };
  }

  export default function SaleSidePanel({
    open,
    onToggle,
    role,
    allowed,
    mode = "sell",
    drawingEnabled = false,
    landData,
    setLandData,
    savedLands,
    onSave,
    onDelete,
    onFocusLand,
    user
  }) {
    if (!allowed) return null;

    const [isFormOpen, setIsFormOpen] = useState(true);
    const [isListOpen, setIsListOpen] = useState(true);

    const [raiModel, setRaiModel] = useState("");
    const [nganModel, setNganModel] = useState("");
    const [wahModel, setWahModel] = useState("");

    const isEditing = !!landData?.id;
    const { t } = useTranslation("sale");

    // ✅ Gate เฉพาะตอนแก้ไข: ต้องครบ 14 วันจาก createdAt
    const editGate = useMemo(() => getEditGateInfo(landData, 14), [landData]);
    const canEditCurrentLand =
      !isEditing
        ? true
        : editGate.canEdit && landData?.approved;


    useEffect(() => {
      const sizeSqw = toNumberSafe(landData?.size);
      if (!sizeSqw) {
        setRaiModel("");
        setNganModel("");
        setWahModel("");
        return;
      }
      const { rai, ngan, wah } = rnwFromSqw(sizeSqw);
      setRaiModel(String(rai));
      setNganModel(String(ngan));
      setWahModel(String(wah));
    }, [landData?.size]);

    useEffect(()=>{
      if(!user) return
      if(landData?.id) return

      setLandData(prev=>{
        if(!prev) return prev

        if(prev.owner || prev.phone || prev.lineId)
          return prev

        return {
          ...prev,
          owner: user.name || "",
          phone: user.phone || "",
          lineId: user.lineId || ""
        }
      })

    },[user, landData?.id])

    const patchLand = (patch) => {
      setLandData((prev) => ({ ...(prev || {}), ...patch }));
    };

    const MAX_IMAGES = 5;

    const handleImages = (files) => {
      if (!files?.length) return;

      const current = Array.isArray(landData?.images) ? landData.images : [];
      const remain = MAX_IMAGES - current.length;
      if (remain <= 0) return;

      const selected = Array.from(files).slice(0, remain);

      const readers = selected.map(file => {
        return new Promise(res => {
          const reader = new FileReader();
          reader.onload = e => res(e.target.result);
          reader.readAsDataURL(file);
        });
      });

      Promise.all(readers).then(results=>{
        patchLand({ images:[...current, ...results] });
      });
    };

    const removeImage = (index)=>{
      const list = [...(landData?.images || [])];
      list.splice(index,1);
      patchLand({ images:list });
    };


    const syncTotalFromPerSqw = () => {
      const size = toNumberSafe(landData?.size);
      const per = toNumberSafe(landData?.price);
      if (!size || !per) return;
      patchLand({ totalPrice: String(Math.round(size * per)) });
    };

    const syncPerSqwFromTotal = () => {
      const size = toNumberSafe(landData?.size);
      const total = toNumberSafe(landData?.totalPrice);
      if (!size || !total) return;
      patchLand({ price: String(Math.round(total / size)) });
    };

    const onRNWInput = () => {
      const sqw = sqwFromRNW(raiModel, nganModel, wahModel);
      patchLand({ size: String(sqw) });
      if (toNumberSafe(landData?.price)) setTimeout(syncTotalFromPerSqw, 0);
    };

    const normalizeRNW = () => {
      const sqw = sqwFromRNW(raiModel, nganModel, wahModel);
      const { rai, ngan, wah } = rnwFromSqw(sqw);
      setRaiModel(String(rai));
      setNganModel(String(ngan));
      setWahModel(String(wah));
      patchLand({ size: String(sqw) });
    };

    const syncFromSize = () => {
      const sizeSqw = toNumberSafe(landData?.size);
      const { rai, ngan, wah } = rnwFromSqw(sizeSqw);
      setRaiModel(String(rai));
      setNganModel(String(ngan));
      setWahModel(String(wah));
    };

    const onClickEdit = (land) => {
      patchLand({
        ...land,
        size: String(land?.size ?? ""),
        price: String(land?.price ?? ""),
        totalPrice: String(land?.totalPrice ?? ""),
        width: String(land?.width ?? ""),
        road: String(land?.road ?? ""),
        owner: land?.owner ?? "",
        agent: land?.agent ?? "",
        phone: land?.phone ?? "",
        lineId: land?.lineId ?? "",
        landFrame: land?.landFrame ?? "",
        deedInformation: land?.deedInformation ?? "",
        images: Array.isArray(land?.images) ? land.images : [],
        // ✅ createdAt ต้องติดมาด้วยเสมอ
        createdAt: land?.createdAt ?? null,
        updatedAt: land?.updatedAt ?? null,
        approved: land?.approved ?? false,
      });

      setIsFormOpen(true);
      onFocusLand?.(land);
    };

    const clearForm = () => {
      patchLand({
        id: null,
        size: "",
        price: "",
        totalPrice: "",
        width: "",
        road: "",
        owner: user?.name || "",
        agent: "",
        phone: user?.phone || "",
        lineId: user?.lineId || "",
        landFrame: "",
        deedInformation: "",
        images: [],
        createdAt: null,
        updatedAt: null,
        approved: false,
      });
    };

    const headerTitle = useMemo(() => {
      if (mode === "sell") return t("header.sell");
      if (mode === "buy") return t("header.buy");
      return t("header.default");
    }, [mode, t]);

    return (
      <aside className={`sale-panel ${open ? "" : "closed"}`}>
        <div className="sale-head">
          <div>
            <div className="sale-title">{headerTitle}</div>
            <div className="sale-sub">
              {t("role")}: <b>{role || "-"}</b>
              {drawingEnabled 
              ? <span className="pill ok">{t("sub.drawable")}</span>
              : <span className="pill warn">{t("sub.notDrawable")}</span>}
              {isEditing 
              ? <span className="pill edit">{t("sub.editing")}</span> 
              : <span className="pill new">{t("sub.new")}</span>}
              {isEditing && !canEditCurrentLand 
              ? <span className="pill warn">{t("sub.locked")}</span> 
              : null}
            </div>
          </div>

          <button 
            className="sale-toggle" 
            type="button" 
            onClick={onToggle} 
            title={t(".toggle.title")}>
            {open ? "‹" : "›"}
          </button>
        </div>

        <div className="sale-body">
          {/* =============== FORM SECTION =============== */}
          <div className="sale-section">
            <button className="sec-title" type="button" onClick={() => setIsFormOpen((v) => !v)}>
              {isFormOpen ? "▲" : "▼"} {t("section.form")}
            </button>

            {isFormOpen && (
              <>
                <div className="sec-sub">{t("section.formSub")}</div>

                <div className="row2">
                  <div className="field">
                    <label>{t("field.sizeSqw")}</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={landData?.size ?? ""}
                      disabled={!canEditCurrentLand}
                      onChange={(e) => {
                        const v = sanitizeDecimal(e.target.value);
                        patchLand({ size: v });
                        setTimeout(syncFromSize, 0);
                        if (toNumberSafe(landData?.price)) setTimeout(syncTotalFromPerSqw, 0);
                      }}
                      onBlur={() => {
                        const sqw = Math.round(toNumberSafe(landData?.size));
                        patchLand({ size: sqw ? String(sqw) : "" });
                        syncFromSize();
                        if (toNumberSafe(landData?.price)) syncTotalFromPerSqw();
                      }}
                      placeholder="0"
                    />
                  </div>

                  <div className="field">
                    <label>{t("field.sizeRNW")}</label>
                    <div className="rnw">
                      <input
                        inputMode="numeric"
                        value={raiModel}
                        disabled={!canEditCurrentLand}
                        onChange={(e) => {
                          setRaiModel(onlyDigits(e.target.value));
                          setTimeout(onRNWInput, 0);
                        }}
                        onBlur={normalizeRNW}
                        placeholder={t("placeholder.rai")}
                      />
                      <input
                        inputMode="numeric"
                        value={nganModel}
                        disabled={!canEditCurrentLand}
                        onChange={(e) => {
                          setNganModel(onlyDigits(e.target.value));
                          setTimeout(onRNWInput, 0);
                        }}
                        onBlur={normalizeRNW}
                        placeholder={t("placeholder.ngan")}
                      />
                      <input
                        inputMode="decimal"
                        value={wahModel}
                        disabled={!canEditCurrentLand}
                        onChange={(e) => {
                          setWahModel(sanitizeDecimal(e.target.value));
                          setTimeout(onRNWInput, 0);
                        }}
                        onBlur={normalizeRNW}
                        placeholder={t("placeholder.wah")}
                      />
                    </div>
                  </div>
                </div>

                <div className="row2">
                  <div className="field">
                    <label>{t("field.width")}</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={landData?.width ?? ""}
                      disabled={!canEditCurrentLand}
                      onChange={(e) => patchLand({ width: sanitizeDecimal(e.target.value) })}
                      placeholder="0"
                    />
                  </div>

                  <div className="field">
                    <label>{t("field.road")}</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={landData?.road ?? ""}
                      disabled={!canEditCurrentLand}
                      onChange={(e) => patchLand({ road: sanitizeDecimal(e.target.value) })}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="row2">
                  <div className="field">
                    <label>{t("field.pricePerSqw")}</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={landData?.price ?? ""}
                      disabled={!canEditCurrentLand}
                      onChange={(e) => {
                        const v = sanitizeDecimal(e.target.value);
                        patchLand({ price: v });
                        setTimeout(syncTotalFromPerSqw, 0);
                      }}
                      onBlur={() => {
                        const n = Math.round(toNumberSafe(landData?.price));
                        patchLand({ price: n ? String(n) : "" });
                        syncTotalFromPerSqw();
                      }}
                      placeholder="0"
                    />
                  </div>

                  <div className="field">
                    <label>{t("field.totalPrice")}</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={landData?.totalPrice ?? ""}
                      disabled={!canEditCurrentLand}
                      onChange={(e) => {
                        const v = sanitizeDecimal(e.target.value);
                        patchLand({ totalPrice: v });
                        setTimeout(syncPerSqwFromTotal, 0);
                      }}
                      onBlur={() => {
                        const n = Math.round(toNumberSafe(landData?.totalPrice));
                        patchLand({ totalPrice: n ? String(n) : "" });
                        syncPerSqwFromTotal();
                      }}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="field">
                  <label>{t("field.owner")}</label>
                  <input
                    type="text"
                    value={landData?.owner ?? ""}
                    onChange={(e) => patchLand({ owner: e.target.value })}
                    placeholder={t("placeholder.owner")}
                    disabled={!canEditCurrentLand || !!String(landData?.agent ?? "").trim()}
                  />
                </div>

                <div className="field">
                  <label>{t("field.agent")}</label>
                  <input
                    type="text"
                    value={landData?.agent ?? ""}
                    onChange={(e) => patchLand({ agent: e.target.value })}
                    placeholder={t("placeholder.agent")}
                    disabled={!canEditCurrentLand || !!String(landData?.owner ?? "").trim()}
                  />
                </div>

                <div className="row2">
                  <div className="field">
                    <label>{t("field.phone")}</label>
                    <input
                      type="text"
                      value={landData?.phone ?? ""}
                      disabled={!canEditCurrentLand}
                      onChange={(e) => patchLand({ phone: e.target.value })}
                      placeholder={t("placeholder.phone")}
                    />
                  </div>

                  <div className="field">
                    <label>{t("field.lineId")}</label>
                    <input
                      type="text"
                      value={landData?.lineId ?? ""}
                      disabled={!canEditCurrentLand}
                      onChange={(e) => patchLand({ lineId: e.target.value })}
                      placeholder={t("placeholder.lineId")}
                    />
                  </div>
                </div>

                <div className="field">
                  <label>{t("field.landFrame")}</label>
                  <input
                    type="text"
                    value={landData?.landFrame ?? ""}
                    disabled={!canEditCurrentLand}
                    onChange={(e) => patchLand({ landFrame: e.target.value })}
                    placeholder={t("field.landFrame")}
                  />
                </div>

                <div className="field">
                  <label>{t("field.deed")}</label>
                  <input
                    type="text"
                    value={landData?.deedInformation ?? ""}
                    disabled={!canEditCurrentLand}
                    onChange={(e) => patchLand({ deedInformation: e.target.value })}
                    placeholder={t("field.deed")}
                  />
                </div>

                <div className="field">
                  <label>รูปภาพ (สูงสุด 5 รูป)</label>

                  <div className="ig-grid">

                    {(landData?.images || []).map((src,i)=>(
                      <div key={i} className="ig-item">
                        <img src={src} alt="" />
                        <button type="button" onClick={()=>removeImage(i)}>×</button>
                      </div>
                    ))}

                    {(landData?.images?.length ?? 0) < 5 && canEditCurrentLand && (
                      <label className="ig-add">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          hidden
                          onChange={(e)=>{
                            handleImages(e.target.files);
                            e.target.value="";
                          }}
                        />
                      </label>
                    )}

                  </div>
                </div>

                <div className="summary">
                  <div>
                    <span className="muted">{t("summary.size")}</span> 
                    <b>{formatDecimal(landData?.size, 0) || "-"} {t("summary.unitSqw")}</b>
                  </div>
                  <div>
                    <span className="muted">{t("summary.perSqw")}</span> 
                    <b>{formatNumber(landData?.price) || "-"} {t("unit.baht")}</b>
                  </div>
                  <div>
                    <span className="muted">{t("summary.total")}</span> <b>{formatNumber(landData?.totalPrice) || "-"} {t("unit.baht")}</b>
                  </div>
                </div>

                <div className="actions">
                  <button
                    className="sale-btn primary"
                    type="button"
                    onClick={onSave}
                    disabled={
                      !drawingEnabled ||
                      (isEditing && !canEditCurrentLand) 
                    }
                    title={isEditing && !canEditCurrentLand ? `แก้ไขได้เมื่อครบ 14 วัน (เหลือ ${editGate.daysLeft} วัน)` : ""}
                  >
                    {isEditing ? t("action.saveEdit") : t("action.saveNew")}
                  </button>

                  <button className="sale-btn" type="button" onClick={clearForm}>
                    {t("action.clear")}
                  </button>

                  <button
                    className="sale-btn danger"
                    type="button"
                    onClick={() => onDelete?.(landData?.id)}
                    disabled={!landData?.id}
                    title={t("action.delete")}
                  >
                    {t("action.delete")}
                  </button>
                </div>

                {!drawingEnabled && (
                  <div className="hint">
                    * {t("hint.notDrawable")}
                  </div>
                )}

                {isEditing && !canEditCurrentLand && (
                  <div className="hint">
                    * {t("hint.editLocked", { days: editGate.daysLeft })}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="divider" />

          {/* =============== LIST SECTION =============== */}
          <div className="sale-section">
            <button className="sec-title" type="button" onClick={() => setIsListOpen((v) => !v)}>
              {isListOpen ? "▲" : "▼"} {t("section.list")} ({Array.isArray(savedLands) ? savedLands.length : 0})
            </button>

            {isListOpen && (
              <div className="list">
                {Array.isArray(savedLands) && savedLands.length > 0 ? (
                  savedLands.map((land) => {
                    const gate = getEditGateInfo(land, 14);
                    const canEditThisLand = gate.canEdit;

                    return (
                      <div key={land.id} className={`item ${String(landData?.id) === String(land.id) ? "active" : ""}`}>
                        <div
                          className="item-title"
                          onClick={() => (canEditThisLand ? onClickEdit(land) : onFocusLand?.(land))}
                          role="button"
                          tabIndex={0}
                          title={!canEditThisLand ? t("list.editLocked", { days: gate.daysLeft }) : t("list.clickToEdit")}
                        >
                          <b>
                            {land.owner ||
                              (land.agent ? `${land.agent} (${t("list.agent")})` : "") ||
                              t("list.unknown")}
                          </b>

                          <span className="mini">
                            {land.updatedAt ? t("list.updated", { date: land.updatedAt }) : ""}
                            {!canEditThisLand ? ` • ${t("list.locked", { days: gate.daysLeft })}` : ""}
                          </span>

                          <span className={`status-badge ${land.approved ? "ok":"pending"}`}>
                            {land.approved ? t("status.approved") : t("status.pending")}

                          </span>
                        </div>

                        <div className="item-row">
                          <span className="muted">{t("list.size")}</span>
                          {formatDecimal(land.size, 0) || "-"} {t("list.unitSqw")}
                        </div>

                        <div className="item-row">
                          <span className="muted">{t("summary.total")}</span>
                          <b>{formatNumber(land.totalPrice) || "-"} {t("unit.baht")}</b>
                        </div>

                        <div className="item-actions">
                          <button className="sale-btn" type="button" onClick={() => onFocusLand?.(land)}>
                            {t("list.focus")}
                          </button>

                          <button
                            className="sale-btn"
                            type="button"
                            onClick={() => onClickEdit(land)}
                            disabled={!canEditThisLand}
                            title={!canEditThisLand ? t("list.editLocked", { days: gate.daysLeft }) : t("list.clickToEdit")}
                          >
                            {t("list.edit")}
                          </button>

                          <button className="sale-btn danger" type="button" onClick={() => onDelete?.(land.id)}>
                            {t("list.delete")}
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="empty">{t("list.empty")}</div>
                )}
              </div>
            )}
          </div>
        </div>
      </aside>
    );
  }
