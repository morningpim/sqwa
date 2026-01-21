// src/utils/landUnit.js
import { parseNum } from "./number";

export function sqwToRNW(totalSqw) {
  const sqw = Math.max(0, Math.floor(parseNum(totalSqw) ?? 0));
  const rai = Math.floor(sqw / 400);
  const rem = sqw % 400;
  const ngan = Math.floor(rem / 100);
  const wah = rem % 100;
  return { rai, ngan, wah };
}
