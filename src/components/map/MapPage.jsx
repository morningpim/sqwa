// src/components/map/MapPage.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import ModeDisclaimerModal from "../Common/ModeDisclaimerModal";
import "../../css/MapPage.css";
import "../../css/land-popup.css";
import { useTranslation } from "react-i18next";


import MapControls from "./MapControls";
import FilterPanel from "../Panels/FilterPanel";
import PayModal from "./Payments/PayModal";
import MapPopup from "./MapPopup";
import SaleSidePanel from "./SaleSidePanel";
import DashboardStats from "./DashboardStats";
import SellModePickerModal from "./SellModePickerModal";
import { MAP_MODE, isEia, isSell, isLandMode } from "./mapMode";

// ✅ Investor flow
import InvestorProfileModal from "./InvestorProfileModal";
import InvestorRecommendPanel from "./InvestorRecommendPanel";
import { loadInvestorProfile } from "../../utils/investorProfile";
import { recommendLands } from "./recommend/recommendLands";

// ✅ Broadcast & Line ADs (Mode 2)
import BroadcastFab from "./broadcast/BroadcastFab";
import BroadcastNewsModal from "./broadcast/BroadcastNewsModal";
import BroadcastCreateModal from "./broadcast/BroadcastCreateModal";
import BroadcastQuickActions from "./broadcast/BroadcastQuickActions";

import { useMapAccess } from "./hooks/useMapAccess";
import { useMapCart } from "./hooks/useMapCart";
import { useMapPopup } from "./hooks/useMapPopup";
import { useMapEvents } from "./hooks/useMapEvents";
import { useDragGuard } from "./hooks/useDragGuard";
import { useReopenPopup } from "./hooks/useReopenPopup";
import { useMapSearch } from "./hooks/useMapSearch";
import { useSelectedLandAccess } from "./hooks/useSelectedLandAccess";
import { useLandSelection } from "./hooks/useLandSelection";
import { useUnlockFlow } from "./hooks/useUnlockFlow";
import { useLandFilters } from "./hooks/useLandFilters";
import { useLongdoDrawing } from "./hooks/useLongdoDrawing";

import { readFavorites, subscribeFavoritesChanged } from "../../utils/favorites";
import { DEFAULT_FILTER } from "./constants/filter";

import LandMarkers from "./LandMarkers";
import { mockLands } from "./lands/mockLands";

import LandDetailPanel from "./LandDetailPanel";
import UnlockPickerModal from "./UnlockPickerModal";

import { useAuth } from "../../auth/AuthProvider";
import RolePickerModal from "../../auth/RolePickerModal";

// ✅ แยกออกมาเป็น hooks
import { useMyLands } from "./hooks/useMyLands";
import { useSalePanel } from "./hooks/useSalePanel";
import { useMapBootstrap } from "./hooks/useMapBootstrap";

// ✅ Mock Chat Modal (ไม่ใช้ Firebase)
import ChatModalMock from "../chat/ChatModalMock";
import EiaDetailPanel from "./eia/EiaDetailPanel";
import { mockEias } from "./eia/mockEias";
import EiaDashboardStats from "./eia/EiaDashboardStats";

export default function MapPage() {
  // =========================================================================
  // Router
  // =========================================================================
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();


  const mode = params.get("mode") || MAP_MODE.BUY;
  const focusLandId = params.get("focus"); // /map?mode=...&focus=LAND_ID

  // sell flow params
  const intent = params.get("intent"); // "seller" | "investor" | null
  const profile = params.get("profile"); // "done" | null

  const [sellPickOpen, setSellPickOpen] = useState(false);

  // Broadcast
  const [newsOpen, setNewsOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createRole, setCreateRole] = useState("admin"); // admin|consignor
  const [createLand, setCreateLand] = useState(null);

  // =========================================================================
  // Role (mock) + Auth
  // =========================================================================
  const auth = useAuth?.() || {};
  const role = auth.role;
  const updateRole = auth.updateRole;

  const [roleOpen, setRoleOpen] = useState(false);

  // =========================================================================
  // ✅ Mock Identity for Chat (ถ้า auth ไม่มี uid/name)
  // =========================================================================
  const [mockUid] = useState(() => {
    const existing = localStorage.getItem("mock_uid");
    if (existing) return existing;
    const id = `u_${Math.random().toString(16).slice(2)}_${Date.now()}`;
    localStorage.setItem("mock_uid", id);
    return id;
  });

  const [mockName, setMockName] = useState(() => {
    const existing = localStorage.getItem("mock_name");
    if (existing) return existing;
    const name = `Guest-${Math.random().toString(16).slice(2, 6)}`;
    localStorage.setItem("mock_name", name);
    return name;
  });

  const currentUid = auth.uid || auth.user?.uid || mockUid;

  const userProfile = useMemo(() => {
    const p = auth.profile || {};
    const name =
      p.name ||
      p.displayName ||
      auth.user?.displayName ||
      mockName ||
      "Guest";
    const photoURL = p.photoURL || auth.user?.photoURL || "";
    return { name, photoURL };
  }, [auth.profile, auth.user, mockName]);

  // =========================================================================
  // ✅ Chat state + handlers (Mock)
  // =========================================================================
  const [chatOpen, setChatOpen] = useState(false);
  const [initialPeer, setInitialPeer] = useState(null); // { uid, name }

  const openChat = useCallback(() => {
    if (!currentUid) return alert(t("common.loginRequired"));
    setInitialPeer(null);
    setChatOpen(true);
  }, [currentUid, t]);

  const openChatWith = useCallback(
    (otherUid, otherName = "") => {
      if (!otherUid) return;
      if (!currentUid) return alert(t("common.loginRequired"));
      setInitialPeer({ uid: otherUid, name: otherName || "" });
      setChatOpen(true);
    },
    [currentUid, t]
  );

  // ✅ กด “แชทผู้ขาย” จาก land (ปรับ field ให้ตรง schema จริงของคุณ)
  const openChatWithSellerFromLand = useCallback(
    (land) => {
      const sellerUid =
        land?.sellerUid ||
        land?.ownerUid ||
        land?.userId ||
        land?.createdByUid ||
        land?.createdByUserId ||
        null;

      const sellerName =
        land?.sellerName ||
        land?.ownerName ||
        land?.createdByName ||
        land?.createdBy ||
        "";

      if (!sellerUid) {
        alert(t("chat.sellerNotFound"));
        return;
      }
      openChatWith(sellerUid, sellerName);
    },
    [openChatWith, t]
  );

  // =========================================================================
  // Permissions
  // =========================================================================
  // วาดได้เฉพาะ landlord,seller,admin
  const canDraw = role === "landlord" || role === "seller" || role === "admin";
  const canUseBuy = role === "seller" || role === "landlord" || role === "admin";

  // ✅ intent=investor ให้เข้าได้ทุก role
  // ✅ intent=seller ต้องเป็น seller/landlord/admin
  const canSell =
    intent === "investor"
      ? true
      : role === "seller" || role === "admin" || role === "landlord";

  const drawingEnabled = canDraw && mode !== MAP_MODE.EIA;

  const [currentMode, setCurrentMode] = useState("normal"); // normal | eia | draw

  // =========================================================================
  // ✅ Sell flow: ต้องเลือก intent ก่อน แล้วค่อยเช็ค role
  // =========================================================================
  useEffect(() => {
    if (mode !== "sell") {
      setSellPickOpen(false);
      return;
    }

    // 1) เข้า sell แต่ยังไม่เลือก intent
    if (!intent) {
      setSellPickOpen(true);
      return;
    }

    setSellPickOpen(false);

    // 2) intent=seller แต่ role ไม่ผ่าน
    if (
      intent === "seller" &&
      !(role === "seller" || role === "landlord" || role === "admin")
    ) {
      alert(t("sell.permissionDenied"));
      navigate("/map?mode=sell&intent=investor", { replace: true });
    }
  }, [mode, intent, role, navigate]);

  const handlePickSellIntent = useCallback(
    (picked) => {
      // picked: "seller" | "investor"
      setSellPickOpen(false);
      navigate(`/map?mode=sell&intent=${encodeURIComponent(picked)}`, {
        replace: true,
      });
    },
    [navigate]
  );

  const handleCloseSellIntent = useCallback(() => {
    // ถ้าปิด modal โดยไม่เลือก -> กลับ buy
    setSellPickOpen(false);
    navigate("/map?mode=buy", { replace: true });
  }, [navigate]);

  // =========================================================================
  // ✅ Investor Profile modal open
  // =========================================================================
  const shouldAskInvestorProfile =
    mode === "sell" && intent === "investor" && profile !== "done";

  const isInvestorResult =
    mode === "sell" && intent === "investor" && profile === "done";

  // =========================================================================
  // Map bootstrap (disclaimer + layers + mapObj)
  // =========================================================================
  const {
    showDisclaimer,
    handleAcceptDisclaimer,
    openLayerMenu,
    setOpenLayerMenu,
    isSatellite,
    setIsSatellite,
    isTraffic,
    setIsTraffic,
    dolEnabled,
    setDolEnabled,
    dolOpacity,
    setDolOpacity,
    mapRef,
    mapObj,
    zoomIn,
    zoomOut,
    locateMe,
  } = useMapBootstrap({ mode });

  // =========================================================================
  // My lands
  // =========================================================================
  const { myLands } = useMyLands();

  // =========================================================================
  // Data (local + mock)
  // =========================================================================
  const lands = useMemo(() => {
    const local = Array.isArray(myLands) ? myLands : [];
    return [...local, ...mockLands];
  }, [myLands]);

  // =========================================================================
  // Filters
  // =========================================================================
  const {
    filterOpen,
    setFilterOpen,
    filterValue,
    setFilterValue,
    filteredLands,
    applyFilters,
    resetFilter,
  } = useLandFilters(lands, DEFAULT_FILTER);

  // =========================================================================
  // ✅ Recommend lands (Investor result)
  // =========================================================================
  const investorProfile = useMemo(() => {
    if (!isInvestorResult) return null;
    return loadInvestorProfile();
  }, [isInvestorResult]);

  const recommendedLands = useMemo(() => {
    if (!isInvestorResult) return null;
    return recommendLands(lands, investorProfile);
  }, [isInvestorResult, lands, investorProfile]);

  // ✅ lands ที่ใช้โชว์บนแผนที่/หมุด/สถิติ
  // land data (เดิม)
  const landsForMap = isInvestorResult
    ? recommendedLands || []
    : filteredLands;

  // eia data (ใหม่)
  const eiaAsLandLike = useMemo(() => {
    if (!isEia(mode)) return [];

    return mockEias.map((eia) => ({
      id: `eia-${eia.id}`,   // ❗ ต้องไม่ชน land
      __type: "eia",         // ใช้แยก popup
      location: eia.location,
      geometry: eia.geometry,
      raw: eia,              // ข้อมูลจริง
    }));
  }, [mode]);


  // =========================================================================
  // Favorites
  // =========================================================================
  const [favoriteIds, setFavoriteIds] = useState(
    () => new Set(readFavorites().map((f) => String(f.id)))
  );

  useEffect(() => {
    const sync = () =>
      setFavoriteIds(new Set(readFavorites().map((f) => String(f.id))));
    const unsub = subscribeFavoritesChanged(sync);
    return unsub;
  }, []);

  // =========================================================================
  // Access / Cart
  // =========================================================================
  const accessApi = useMapAccess();
  const { addToCart } = useMapCart(navigate);

  // =========================================================================
  // Drawing
  // =========================================================================
  const { drawMode, startDrawing, finishDrawing, clearDrawing, getPoints } =
    useLongdoDrawing(mapObj, currentMode);

  useEffect(() => {
    if (!drawingEnabled) {
      try {
        clearDrawing?.();
      } catch {}
      setCurrentMode("normal");
    }
  }, [drawingEnabled, clearDrawing]);

  // ✅ draw เฉพาะ sell ที่เป็น seller intent (กัน investor)
  useEffect(() => {
    if (mode === "sell" && drawingEnabled && intent !== "investor") {
      setCurrentMode("draw");
    }
  }, [mode, drawingEnabled, intent]);

  // =========================================================================
  // Sale panel + state (hook)
  // =========================================================================
  const canSeeSalePanel =
    role === "seller" || role === "landlord" || role === "admin";

  // ✅ กัน SaleSidePanel ใน investor result
  const showSalePanel =
    canSeeSalePanel &&
    (mode === "buy" || mode === "sell") &&
    !(mode === "sell" && intent === "investor");

  const {
    saleOpen,
    setSaleOpen,
    landForm,
    setLandForm,
    handleSaveLand,
    handleDeleteLand,
  } = useSalePanel({ getPoints, clearDrawing });

  // =========================================================================
  // Popup
  // =========================================================================
  const popupApi = useMapPopup({ mapObj, mapRef });
  const [selectedEia, setSelectedEia] = useState(null);

  const { openPopupForWithAccess, onSelectLand } = useLandSelection({
    popupApi,
    accessApi,
  });

  // ✅ STEP 3.2: handler กลางสำหรับ map click (land / eia)
  const handleSelectOverlay = useCallback(
    (item, loc) => {
      // =========================
      // EIA MODE → เปิด EIA popup
      // =========================
      if (isEia(mode)) {
        if (!loc) return;

        // เก็บข้อมูล EIA ที่ถูกคลิก
        setSelectedEia({ item, loc });

        // ใช้ popup engine เดิม แค่เพื่อเปิด + คำนวณตำแหน่ง
        popupApi.openPopupFor(
          { id: "__eia__", __type: "eia" }, // dummy object สำหรับ popup engine
          loc
        );
        return;
      }

      // =========================
      // LAND MODE → behavior เดิม
      // =========================
      openPopupForWithAccess(item, loc);
    },
    [mode, popupApi, openPopupForWithAccess]
  );
  // =========================================================================

  useDragGuard({
    enabledRef: popupApi.popupOpenRef,
    threshold: 6,
  });

  const { rememberPopup, reopenPopup } = useReopenPopup({
    popupApi,
    openPopupForWithAccess,
  });

  const unlockFlow = useUnlockFlow({
    mode,
    accessApi,
    addToCart,
    popupApi,
    rememberPopup,
    reopenPopup,
  });

  useMapEvents({
    mapObj,
    onOverlayOrMarkerSelect: handleSelectOverlay, // ✅ ใช้ handler กลาง
    onMapClickClose: () => {
      if (createOpen || newsOpen) return;

      popupApi.closePopup();
      setSelectedEia(null); // ✅ ปิด EIA popup ด้วย
    },
    isDrawing: drawMode,
  });

  useEffect(() => {
    popupApi.closePopup();
  }, [mode, showDisclaimer]); // eslint-disable-line react-hooks/exhaustive-deps

  // ✅ เพิ่ม: ถ้าเปิด news/create -> ปิด popup อัตโนมัติ
  useEffect(() => {
    if (createOpen || newsOpen) popupApi.closePopup();
  }, [createOpen, newsOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // ✅ เปิด create แล้วจำ popup เดิมไว้
  const openCreate = useCallback(
    (roleToCreate) => {
      rememberPopup?.(); // ✅ จำ popup เดิม
      setCreateLand(popupApi.selectedLand || null);
      popupApi.closePopup(); // ✅ ปิด popup กันซ้อน

      setCreateRole(roleToCreate); // "admin" | "consignor"
      setCreateOpen(true);
    },
    [rememberPopup, popupApi]
  );

  // ✅ ปิด create แล้วเปิด popup เดิมกลับมา
  const closeCreate = useCallback(() => {
    setCreateOpen(false);
    setCreateLand(null); // ✅ เคลียร์ snapshot
    setTimeout(() => {
      reopenPopup?.();
    }, 0);
  }, [reopenPopup]);

  // =========================================================================
  // ✅ Focus + Zoom + Open Popup (เมื่อ navigate ไป /map?...&focus=ID)
  // =========================================================================
  useEffect(() => {
    if (!mapObj) return;
    if (!focusLandId) return;
    if (!landsForMap?.length) return;

    const land = landsForMap.find((l) => String(l.id) === String(focusLandId));
    if (!land) return;

    const loc =
      land?.location ??
      ({
        lat: land?.lat ?? land?.latitude,
        lon: land?.lon ?? land?.lng ?? land?.longitude,
      } || null);

    if (loc?.lat == null || loc?.lon == null) return;

    const lat = Number(loc.lat);
    const lon = Number(loc.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;

    try {
      mapObj.location({ lon, lat });
      mapObj.zoom(16);
    } catch (e) {
      console.warn("map focus failed", e);
    }

    const keep = [];
    keep.push(`mode=${encodeURIComponent(mode)}`);
    if (intent) keep.push(`intent=${encodeURIComponent(intent)}`);
    if (profile) keep.push(`profile=${encodeURIComponent(profile)}`);

    const t = setTimeout(() => {
      onSelectLand(land, { lon, lat }); // ✅ เปิด popup
      navigate(`/map?${keep.join("&")}`, { replace: true }); // ✅ ล้าง focus แต่คง params ไว้
    }, 250);

    return () => clearTimeout(t);
  }, [
    mapObj,
    focusLandId,
    landsForMap,
    onSelectLand,
    navigate,
    mode,
    intent,
    profile,
  ]);

  // =========================================================================
  // Search
  // =========================================================================
  const handleSearch = useMapSearch(mapObj);

  // =========================================================================
  // Derived
  // =========================================================================
  const selectedLand = popupApi.selectedLand;
  const { unlockedFields } = useSelectedLandAccess(
    selectedLand,
    accessApi.access
  );
  const landForBroadcast = createLand || selectedLand; // ✅ ใช้ snapshot ก่อน

  // =========================================================================
  // Render
  // =========================================================================
  return (
    <div className="map-shell">
      <div id="map" className="map-canvas" />

      {showDisclaimer && (
        <ModeDisclaimerModal onClose={handleAcceptDisclaimer} />
      )}

      {/* ✅ Sell Intent Picker */}
      <SellModePickerModal
        open={sellPickOpen}
        onClose={handleCloseSellIntent}
        onPick={handlePickSellIntent}
      />

      {/* ✅ Investor Profile Form (intent=investor แต่ยังไม่ done) */}
      <InvestorProfileModal
        open={shouldAskInvestorProfile}
        onClose={() =>
          navigate(`/map?mode=sell&intent=investor`, { replace: true })
        }
        onDone={() =>
          navigate(`/map?mode=sell&intent=investor&profile=done`, {
            replace: true,
          })
        }
      />

      <RolePickerModal
        open={roleOpen}
        onClose={() => setRoleOpen(false)}
        initialRole={role}
        onSave={(r) => updateRole?.(r)}
      />

      <FilterPanel
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        value={filterValue}
        onChange={setFilterValue}
        onApply={applyFilters}
        onClear={resetFilter}
      />

      {!!mapObj && (
        <LandMarkers
          map={mapObj}
          lands={isEia(mode) ? eiaAsLandLike : landsForMap}
          favoriteIds={isEia(mode) ? undefined : favoriteIds}
          onSelect={handleSelectOverlay}
        />
      )}

      <MapControls
        pageMode={mode}
        currentRole={role}
        onOpenRolePicker={() => setRoleOpen(true)}
        drawingEnabled={drawingEnabled && intent !== "investor"} // ✅ กัน investor
        drawMode={drawMode}
        currentMode={currentMode}
        onSetMode={setCurrentMode}
        onStartDrawing={startDrawing}
        onFinishDrawing={finishDrawing}
        onClearDrawing={clearDrawing}
        onSearch={handleSearch}
        openLayerMenu={openLayerMenu}
        setOpenLayerMenu={setOpenLayerMenu}
        isSatellite={isSatellite}
        setIsSatellite={setIsSatellite}
        isTraffic={isTraffic}
        setIsTraffic={setIsTraffic}
        dolEnabled={dolEnabled}
        setDolEnabled={setDolEnabled}
        dolOpacity={dolOpacity}
        setDolOpacity={setDolOpacity}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onLocate={locateMe}
        onOpenFilter={() => setFilterOpen(true)}
        onOpenChat={openChat} // ✅ เปิด Mock Chat
        onOpenTools={() => alert(t("common.comingSoon"))}
      />

      {/* ✅ stats ด้านล่าง: ถ้า investor result ให้คิดจากรายการแนะนำ */}
      {isEia(mode) ? (
        <EiaDashboardStats eias={eiaAsLandLike} />
      ) : (
        <DashboardStats lands={landsForMap} />
      )}

      {/* ✅ ซ่อน popup ระหว่างเปิดข่าว/สร้าง Broadcast */}
      {!createOpen && !newsOpen && popupApi.popupOpen && (
        <MapPopup {...popupApi}>
          {isEia(mode) ? (
            <EiaDetailPanel
              data={selectedEia}
              onClose={() => {
                setSelectedEia(null);
                popupApi.closePopup();
              }}
            />
          ) : (
            <LandDetailPanel
              mode={mode}
              land={popupApi.selectedLand}
              unlockedFields={unlockedFields}
              onClose={() => popupApi.closePopup()}
              onOpenUnlockPicker={unlockFlow.onOpenUnlockPicker}
              onUnlockAll={unlockFlow.onUnlockAll}
              onChatSeller={() =>
                openChatWithSellerFromLand(popupApi.selectedLand)
              }
            />
          )}
        </MapPopup>
      )}


      {/* ✅ Investor Recommend List (เฉพาะ profile=done) */}
      {isInvestorResult && (
        <InvestorRecommendPanel
          lands={recommendedLands || []}
          onFocus={(x) =>
            navigate(
              `/map?mode=sell&intent=investor&profile=done&focus=${encodeURIComponent(
                x.id
              )}`
            )
          }
        />
      )}

      {/* ✅ SaleSidePanel (ไม่โชว์ใน investor) */}
      {showSalePanel && (
        <SaleSidePanel
          open={saleOpen}
          onToggle={() => setSaleOpen((v) => !v)}
          role={role}
          allowed={showSalePanel}
          mode={mode}
          drawingEnabled={drawingEnabled && intent !== "investor"} // ✅ กัน investor ให้ชัวร์
          landData={landForm}
          setLandData={setLandForm}
          savedLands={myLands}
          onSave={() => {
            const r = handleSaveLand?.(); // {id}
            if (r?.id) {
              const keep = [];
              keep.push(`mode=${encodeURIComponent(mode)}`);
              if (intent) keep.push(`intent=${encodeURIComponent(intent)}`);
              if (profile) keep.push(`profile=${encodeURIComponent(profile)}`);
              keep.push(`focus=${encodeURIComponent(r.id)}`);
              navigate(`/map?${keep.join("&")}`);
            }
          }}
          onDelete={handleDeleteLand}
          onFocusLand={(land) => {
            const keep = [];
            keep.push(`mode=${encodeURIComponent(mode)}`);
            if (intent) keep.push(`intent=${encodeURIComponent(intent)}`);
            if (profile) keep.push(`profile=${encodeURIComponent(profile)}`);
            keep.push(`focus=${encodeURIComponent(land.id)}`);
            navigate(`/map?${keep.join("&")}`);
          }}
        />
      )}

      <UnlockPickerModal
        open={accessApi.unlockOpen}
        landId={accessApi.unlockLandId}
        //title={t("picker.title")}
        //subtitle={t("picker.subtitle")}
        items={accessApi.unlockItems}
        initialSelected={[]}
        onCancel={unlockFlow.onCancelUnlock}
        onAddToCart={unlockFlow.onAddToCartUnlock}
        onConfirm={unlockFlow.onConfirmUnlock}
      />

      <PayModal
        open={unlockFlow.payOpen}
        draft={unlockFlow.payDraft}
        onClose={unlockFlow.onClosePay}
        onPaid={unlockFlow.onPaid}
      />

      {/* 1) ปุ่มลอยข่าว */}
      <BroadcastFab onClick={() => setNewsOpen(true)} />

      {/* 2) ปุ่มในบริบท popup */}
      <BroadcastQuickActions
        land={selectedLand}
        role={role}
        mode={mode}
        sellIntent={intent}
        onAdminClick={() => {
          if (!selectedLand) {
            alert(t("broadcast.selectLandFirst"));
            return;
          }
          openCreate("admin");
        }}
        onConsignorClick={() => {
          if (!selectedLand) {
            alert(t("broadcast.selectLandFirst"));
            return;
          }
          openCreate("consignor");
        }}
      />

      {/* 3) Modal ข่าว */}
      <BroadcastNewsModal
        open={newsOpen}
        onClose={() => setNewsOpen(false)}
        canAdmin={role === "admin"}
        onOpenAdminCreate={() => openCreate("admin")}
      />

      {/* 4) Modal สร้างแคมเปญ */}
      <BroadcastCreateModal
        open={createOpen}
        onClose={closeCreate}
        onSuccess={closeCreate} // ✅ submit สำเร็จ -> ปิด + reopen popup เดิม
        land={landForBroadcast} // ✅ กัน selectedLand หายหลัง closePopup()
        createdByRole={createRole}
        createdByUserId={role} // MVP: ใส่ role ไปก่อน
        mode={
          mode === "sell" && intent === "seller" ? "consignment" : "buy_sell"
        }
        intent={intent || null}
        defaultFeatured={createRole === "consignor"}
        defaultPriceTHB={createRole === "consignor" ? 100 : 0}
      />

      {/* ✅ Mock Chat Modal */}
      <ChatModalMock
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        currentUid={currentUid}
        userProfile={userProfile}
        initialPeer={initialPeer}
      />

      {/* ✅ ตัวช่วย: เปลี่ยนชื่อ mock user (ถ้ายังไม่มี auth profile)
          ลบออกได้ตามต้องการ */}
      {!auth.profile?.name && (
        <div
          style={{
            position: "fixed",
            bottom: 12,
            left: 12,
            zIndex: 9999,
            background: "rgba(255,255,255,.9)",
            border: "1px solid #eee",
            borderRadius: 12,
            padding: "8px 10px",
            fontFamily: "system-ui",
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: 12, opacity: 0.7 }}>mock name:</div>
          <input
            value={mockName}
            onChange={(e) => {
              const v = e.target.value;
              setMockName(v);
              localStorage.setItem("mock_name", v);
            }}
            style={{
              border: "1px solid #ddd",
              borderRadius: 10,
              padding: "6px 8px",
              outline: "none",
              width: 160,
            }}
          />
          <div style={{ fontSize: 12, opacity: 0.6 }}>
            uid: {String(currentUid).slice(0, 10)}…
          </div>
        </div>
      )}
    </div>
  );
}