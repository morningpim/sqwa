import { useCallback } from "react";

function resolveLandLoc(land, loc) {
  if (loc?.lat != null && loc?.lon != null) return loc;

  if (land?.location?.lat != null && land?.location?.lon != null) return land.location;

  if (land?.lat != null && land?.lon != null) return { lat: land.lat, lon: land.lon };

  return null;
}

export function useLandSelection({ popupApi, accessApi }) {
  const openPopupForWithAccess = useCallback(
    (land, loc) => {
      if (!land || !loc) return;

      popupApi.openPopupFor(land, loc);
      // sync access ล่าสุดทุกครั้งที่เปิด popup
      accessApi.setAccess(accessApi.loadAccess());
    },
    [popupApi, accessApi]
  );

  const onSelectLand = useCallback(
    (land, loc) => {
      if (!land) return;
      const finalLoc = resolveLandLoc(land, loc);
      if (!finalLoc) return;

      openPopupForWithAccess(land, finalLoc);
    },
    [openPopupForWithAccess]
  );

  return {
    openPopupForWithAccess,
    onSelectLand,
  };
}
