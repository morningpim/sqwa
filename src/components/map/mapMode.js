export const MAP_MODE = {
  BUY: "buy",
  SELL: "sell",
  EIA: "eia",
};

export const isBuy = (mode) => mode === MAP_MODE.BUY;
export const isSell = (mode) => mode === MAP_MODE.SELL;
export const isEia = (mode) => mode === MAP_MODE.EIA;

export const isLandMode = (mode) =>
  mode === MAP_MODE.BUY || mode === MAP_MODE.SELL;
