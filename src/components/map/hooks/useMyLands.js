// src/components/map/hooks/useMyLands.js
import { useEffect, useState } from "react";
import { readAllLands, subscribeLandsChanged } from "../../../utils/landsLocal";

export function useMyLands() {
  const [myLands, setMyLands] = useState(() => readAllLands());

  useEffect(() => {
    const sync = () => setMyLands(readAllLands());
    sync();
    const unsub = subscribeLandsChanged(sync);
    return unsub;
  }, []);

  return { myLands, setMyLands };
}
