// src/hooks/useChatPresence.js
import { useEffect, useRef } from "react";
import {
  updateUserOnlineStatus,
  setUserOffline,
} from "../services/chatService.mock";

export function useChatPresence(currentUid, profile) {
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!currentUid) return;

    // กัน React 18 StrictMode (dev)
    if (mountedRef.current) return;
    mountedRef.current = true;

    updateUserOnlineStatus(currentUid, {
      name: profile?.name,
      photoURL: profile?.photoURL,
    });

    const onUnload = () => {
      setUserOffline(currentUid);
    };

    window.addEventListener("beforeunload", onUnload);

    return () => {
      window.removeEventListener("beforeunload", onUnload);
      setUserOffline(currentUid);
    };
  }, [currentUid]);
}
