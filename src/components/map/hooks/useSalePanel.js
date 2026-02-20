// src/components/map/hooks/useSalePanel.js
import { useCallback, useState } from "react";
import { addLand, removeLand, updateLand } from "../../../utils/landsLocal";
import { pointsToPolygon } from "../utils/geo";

function trim(v) {
  return String(v ?? "").trim();
}
function toNum(v) {
  const n = Number(String(v ?? "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function centerOfPolygon(geometry){
  const pts = geometry?.coordinates?.[0];
  if(!pts?.length) return null;

  const sum = pts.reduce(
    (a,p)=>({lon:a.lon+p[0],lat:a.lat+p[1]}),
    {lon:0,lat:0}
  );

  return {
    lon: sum.lon/pts.length,
    lat: sum.lat/pts.length
  };
}

const EMPTY_FORM = {
  id: null,
  size: "",
  price: "",
  totalPrice: "",
  width: "",
  road: "",
  owner: "",
  agent: "",
  phone: "",
  lineId: "",
  landFrame: "",
  deedInformation: "",
  images: [],
  createdAt: null,
  updatedAt: null,
};

export function useSalePanel({ getPoints, clearDrawing, currentUserId, mode, role }) {
  const [saleOpen, setSaleOpen] = useState(true);
  const [landForm, setLandForm] = useState(EMPTY_FORM);

  const resetForm = useCallback(() => setLandForm(EMPTY_FORM), []);

  // ✅ return {id} เมื่อบันทึกสำเร็จ เพื่อให้ MapPage นำไป focus + open popup
  const handleSaveLand = useCallback(() => {
    const points = getPoints?.();
    const geometry = pointsToPolygon(points);

    if (!geometry) {
      alert("กรุณาวาดพื้นที่ก่อนบันทึก");
      return null;
    }

    const nowISO = new Date().toISOString();
    const isEdit = !!landForm?.id;
    const id = isEdit ? String(landForm.id) : `LAND_${Date.now()}`;

    const size = Math.round(toNum(landForm.size));
    const price = Math.round(toNum(landForm.price));
    const totalPrice = Math.round(toNum(landForm.totalPrice));
    const width = toNum(landForm.width);
    const road = toNum(landForm.road);

    const owner = trim(landForm.owner);
    const agent = trim(landForm.agent);
    const phone = trim(landForm.phone);
    const lineId = trim(landForm.lineId);

    // -------------------------
    // validations by mode
    // -------------------------

    if (mode !== "eia") {

      if (size <= 0) {
        alert("กรุณาระบุขนาดที่ดิน (ตร.วา) ให้ถูกต้อง");
        return null;
      }

      if (price <= 0 && totalPrice <= 0) {
        alert("กรุณาระบุ 'ราคาต่อตารางวา' หรือ 'ราคารวม' อย่างน้อย 1 ช่อง");
        return null;
      }

      if (!owner && !agent) {
        alert("กรุณาระบุ 'เจ้าของ' หรือ 'นายหน้า' อย่างน้อย 1 ช่อง");
        return null;
      }

      if (!phone && !lineId) {
        alert("กรุณาระบุ 'โทร' หรือ 'LINE ID' อย่างน้อย 1 ช่อง");
        return null;
      }
    }

    // validation เฉพาะ EIA
    if (mode === "eia") {
      if (!trim(landForm.projectName)) {
        alert("กรุณากรอกชื่อโครงการ");
        return null;
      }
    }

    let finalPrice = price;
    let finalTotal = totalPrice;

    if (mode !== "eia") {
      if (finalPrice > 0 && finalTotal <= 0)
        finalTotal = Math.round(finalPrice * size);

      if (finalTotal > 0 && finalPrice <= 0)
        finalPrice = Math.round(finalTotal / size);
    }
    // -------------------------
    // payload
    // -------------------------
    const payload = {
      ...landForm,
      id,
      geometry,
      __type:"eia",  // ใช้แยก popup 
      ownerId: currentUserId,
      location: centerOfPolygon(geometry) ,

      size: String(size),
      price: String(finalPrice),
      totalPrice: String(finalTotal),
      width: width ? String(width) : "",
      road: road ? String(road) : "",
      owner,
      agent,
      phone,
      lineId,

      // ✅ นับ 14 วันจาก createdAt (วันสร้างประกาศ)
      createdAt: isEdit ? (landForm.createdAt || nowISO) : nowISO,
      updatedAt: nowISO,
      approved: role === "admin"
    };

    if (isEdit) updateLand(id, payload);
    else addLand(payload);

    try {
      clearDrawing?.();
    } catch {}

    resetForm();
    alert(isEdit ? "บันทึกการแก้ไขแล้ว ✅" : "บันทึกแปลงใหม่แล้ว ✅");

    return { id };
  }, [getPoints, clearDrawing, landForm, resetForm, mode]);

  const handleDeleteLand = useCallback((id) => {
    if (!id) return;
    if (!window.confirm("ต้องการลบแปลงนี้ใช่ไหม?")) return;
    removeLand(id);
  }, []);

  return {
    saleOpen,
    setSaleOpen,
    landForm,
    setLandForm,
    handleSaveLand,
    handleDeleteLand,
    resetForm,
  };
}
