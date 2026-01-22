// src/components/map/hooks/useChatController.js
import { useCallback, useState } from "react";
import { useChatPresence } from "../../../hooks/useChatPresence";

export function useChatController({ uid, name, photoURL, t }) {
  useChatPresence(uid, name, photoURL);

  const [chatOpen, setChatOpen] = useState(false);
  const [initialPeer, setInitialPeer] = useState(null);

  const openChat = useCallback(() => {
    if (!uid) return alert(t("common.loginRequired"));
    setInitialPeer(null);
    setChatOpen(true);
  }, [uid, t]);

  const openChatWith = useCallback(
    (otherUid, otherName = "") => {
      if (!otherUid) return;
      if (!uid) return alert(t("common.loginRequired"));
      setInitialPeer({ uid: otherUid, name: otherName });
      setChatOpen(true);
    },
    [uid, t]
  );

  const openChatWithSellerFromLand = useCallback(
    (land) => {
      const sellerUid =
        land?.sellerUid || land?.ownerUid || land?.createdByUid;

      if (!sellerUid) {
        alert(t("chat.sellerNotFound"));
        return;
      }

      openChatWith(
        sellerUid,
        land?.sellerName || land?.ownerName || ""
      );
    },
    [openChatWith, t]
  );

  return {
    chatOpen,
    setChatOpen,
    initialPeer,
    openChat,
    openChatWithSellerFromLand,
  };
}
