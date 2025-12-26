// src/utils/land.js

/**
 * normalizeLand
 * รวมชื่อ field หลายแบบให้เป็นโครงสร้างเดียว
 * เพื่อให้ filter ทำงานได้แน่นอน
 *
 * ปรับ mapping ตรงนี้ “จุดเดียว” ถ้า data จริงของคุณชื่อไม่ตรง
 */
export function normalizeLand(item) {
  const priceSqw =
    item?.pricePerSqw != null
      ? Number(item.pricePerSqw)
      : item?.price != null
      ? Number(item.price)
      : null;

  const areaSqw =
    item?.areaSqw != null
      ? Number(item.areaSqw)
      : item?.size != null
      ? Number(item.size)
      : item?.area != null
      ? Number(item.area)
      : null;

  const roadSize =
    item?.roadSize != null
      ? Number(item.roadSize)
      : item?.road_width != null
      ? Number(item.road_width)
      : null;

  const totalPrice =
    item?.totalPrice != null
      ? Number(item.totalPrice)
      : priceSqw != null && areaSqw != null
      ? priceSqw * areaSqw
      : null;

  const frontWidth =
    item?.frontWidth != null
      ? Number(item.frontWidth)
      : item?.front != null
      ? Number(item.front)
      : null;

  return {
    // ค่าที่ normalize แล้ว (ใช้กับ filter)
    priceSqw,
    areaSqw,
    roadSize,
    totalPrice,
    frontWidth,

    // fields สำหรับ filter แบบ string
    province: item?.province ?? null,
    landType: item?.landType ?? null,

    // เก็บของเดิมไว้ เผื่อใช้ต่อ (เช่นเปิด popup)
    raw: item,
  };
}
