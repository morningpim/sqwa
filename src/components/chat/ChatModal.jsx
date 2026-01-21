import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  subscribeOnlineUsers,
  subscribeP2PChatRooms,
  subscribeChat,
  sendChatMessage,
  markMessagesAsRead,
  deleteChatRoom,
  updateUserOnlineStatus,
} from "../../services/chatService";

export default function ChatModal({
  open,
  onClose,
  currentUid,
  userProfile, // { name, photoURL }
  initialPeer, // { uid, name }
}) {
  const { t } = useTranslation();

  const [onlineUsers, setOnlineUsers] = useState([]);
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const [roomId, setRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  const msgEndRef = useRef(null);
  const scrollToBottom = () =>
    msgEndRef.current?.scrollIntoView({ behavior: "smooth" });

  // init
  useEffect(() => {
    if (!open || !currentUid) return;

    let unsubOnline;
    let unsubRooms;
    let onlineTimer;

    unsubOnline = subscribeOnlineUsers((users) => {
      setOnlineUsers(users.filter((u) => u.uid !== currentUid));
    });

    unsubRooms = subscribeP2PChatRooms(currentUid, (rooms) => {
      setChatRooms(rooms);
      setUnreadCount(rooms.reduce((s, r) => s + (r.unreadCount || 0), 0));
    });

    updateUserOnlineStatus(currentUid, userProfile);
    onlineTimer = setInterval(
      () => updateUserOnlineStatus(currentUid, userProfile),
      30000
    );

    return () => {
      unsubOnline?.();
      unsubRooms?.();
      if (onlineTimer) clearInterval(onlineTimer);
    };
  }, [open, currentUid, userProfile]);

  // auto open from map
  useEffect(() => {
    if (!open || !initialPeer?.uid) return;
    setSelectedUser({ uid: initialPeer.uid, name: initialPeer.name || "" });
  }, [open, initialPeer]);

  // subscribe messages
  useEffect(() => {
    if (!open || !currentUid || !selectedUser?.uid) return;

    let unsub;
    (async () => {
      unsub = await subscribeChat(
        currentUid,
        userProfile?.name || "",
        selectedUser.uid,
        selectedUser.name || "",
        ({ roomId, messages }) => {
          setRoomId(roomId);
          setMessages(messages);
          requestAnimationFrame(scrollToBottom);
          markMessagesAsRead(currentUid, selectedUser.uid);
        }
      );
    })();

    return () => unsub?.();
  }, [open, currentUid, selectedUser, userProfile?.name]);

  async function onSend() {
    if (!chatInput.trim()) return;

    if (!userProfile?.name) {
      alert(t("chat.alert.noName"));
      return;
    }
    if (!selectedUser?.uid) {
      alert(t("chat.alert.noReceiver"));
      return;
    }

    try {
      await sendChatMessage(
        chatInput,
        currentUid,
        userProfile.name,
        selectedUser.uid,
        selectedUser.name || ""
      );
      setChatInput("");
    } catch (e) {
      alert(
        t("chat.alert.sendFail", {
          error: e?.message || String(e),
        })
      );
    }
  }

  async function onDeleteRoom(r) {
    const ok = confirm(
      t("chat.confirm.deleteRoom", { name: r.otherName })
    );
    if (!ok) return;

    try {
      await deleteChatRoom(currentUid, r.otherUid);
      if (selectedUser?.uid === r.otherUid) {
        setSelectedUser(null);
        setRoomId(null);
        setMessages([]);
      }
    } catch (e) {
      alert(
        t("chat.alert.deleteFail", {
          error: e?.message || String(e),
        })
      );
    }
  }

  const headerTitle = useMemo(() => {
    if (selectedUser?.uid) {
      return t("chat.header.with", {
        name:
          selectedUser.name ||
          t("chat.userFallback", {
            id: selectedUser.uid.slice(0, 6),
          }),
      });
    }
    return t("chat.header.inbox", { count: unreadCount });
  }, [selectedUser, unreadCount, t]);

  if (!open) return null;

  return (
    <div
      style={styles.backdrop}
      onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div style={styles.modal}>
        <div style={styles.header}>
          <div style={{ fontWeight: 700 }}>{headerTitle}</div>
          <button style={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div style={styles.body}>
          {/* LEFT */}
          <div style={styles.left}>
            <div style={styles.sectionTitle}>{t("chat.section.online")}</div>
            <div style={styles.list}>
              {onlineUsers.map((u) => (
                <button
                  key={u.uid}
                  style={styles.userRow(selectedUser?.uid === u.uid)}
                  onClick={() =>
                    setSelectedUser({ uid: u.uid, name: u.name || "" })
                  }
                >
                  <div style={{ fontWeight: 600 }}>
                    {u.name ||
                      t("chat.userFallback", { id: u.uid.slice(0, 6) })}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>
                    {t("chat.status.online")}
                  </div>
                </button>
              ))}
              {onlineUsers.length === 0 && (
                <div style={styles.empty}>
                  {t("chat.empty.online")}
                </div>
              )}
            </div>

            <div style={{ ...styles.sectionTitle, marginTop: 10 }}>
              {t("chat.section.inbox")}
            </div>
            <div style={styles.list}>
              {chatRooms.map((r) => (
                <div
                  key={r.roomId}
                  style={styles.roomRowWrap(
                    selectedUser?.uid === r.otherUid
                  )}
                >
                  <button
                    style={styles.roomRowBtn}
                    onClick={() =>
                      setSelectedUser({
                        uid: r.otherUid,
                        name: r.otherName,
                      })
                    }
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 8,
                      }}
                    >
                      <div style={{ fontWeight: 700 }}>
                        {r.otherName}
                      </div>
                      {r.unreadCount > 0 && (
                        <span style={styles.badge}>
                          {r.unreadCount}
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        opacity: 0.75,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {r.lastMessage}
                    </div>
                  </button>
                  <button
                    style={styles.trashBtn}
                    title={t("chat.action.delete")}
                    onClick={() => onDeleteRoom(r)}
                  >
                    🗑
                  </button>
                </div>
              ))}
              {chatRooms.length === 0 && (
                <div style={styles.empty}>
                  {t("chat.empty.inbox")}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div style={styles.right}>
            {!selectedUser?.uid ? (
              <div style={styles.placeholder}>
                {t("chat.placeholder.select")}
              </div>
            ) : (
              <>
                <div style={styles.messages}>
                  {messages.map((m) => {
                    const mine = m.fromUid === currentUid;
                    return (
                      <div key={m.id} style={styles.msgRow(mine)}>
                        <div style={styles.msgBubble(mine)}>
                          <div
                            style={{
                              fontSize: 12,
                              opacity: 0.75,
                              marginBottom: 2,
                            }}
                          >
                            {mine
                              ? t("chat.me")
                              : m.fromName || t("chat.other")}
                          </div>
                          <div>{m.text}</div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={msgEndRef} />
                </div>

                <div style={styles.inputBar}>
                  <input
                    style={styles.input}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={t("chat.input.placeholder")}
                    onKeyDown={(e) =>
                      e.key === "Enter" ? onSend() : null
                    }
                  />
                  <button style={styles.sendBtn} onClick={onSend}>
                    {t("chat.action.send")}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {roomId && (
          <div style={styles.footer}>
            {t("chat.room")}: {roomId}
          </div>
        )}
      </div>
    </div>
  );
}
