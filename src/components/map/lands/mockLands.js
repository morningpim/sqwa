export const mockLands = [
  {
    id: "LAND_001",
    updatedAt: "14/11/2025",
    brokerName: "อ้อ",
    phone: "092-642-2937",
    areaSqWa: 1544,
    rai: 3,
    ngan: 3,
    wa: 44,
    frontage: 63,
    roadWidth: 28,
    pricePerWa: 63471.5,
    totalPrice: 98000000,
    lat: 13.7563,
    lon: 100.5018,
  },

  // ✅ เพิ่มแปลงใหม่
  {
    id: "LAND_002",
    updatedAt: "25/12/2025",
    brokerName: "พี่บี",
    phone: "081-234-5678",
    lineId: "bee.land",          // ใส่เพิ่มได้ ถ้า normalizeLand รองรับ key นี้
    areaSqWa: 800,
    rai: 2,
    ngan: 0,
    wa: 0,
    frontage: 25,
    roadWidth: 6,
    pricePerWa: 45000,
    totalPrice: 36000000,
    lat: 13.7367,
    lon: 100.5231,
  },
];
