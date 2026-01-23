// src/components/chat/ChatModalMock.jsx
import React, { useEffect, useRef, useState } from "react";
import {
  subscribeOnlineUsers,
  subscribeP2PChatRooms,
  subscribeChat,
  sendChatMessage,
  markMessagesAsRead,
  deleteChatRoom,
  updateUserOnlineStatus,
  setUserOffline,
} from "../../services/chatService.firebase";

export default function ChatModalMock({
  open,
  onClose,
  currentUid,
  userProfile,
  initialPeer,
}) {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const [roomId, setRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  const endRef = useRef(null);
  const scrollToBottom = () =>
    endRef.current?.scrollIntoView({ behavior: "smooth" });

  /* ===============================
      Presence (online / offline)
  =============================== */
  useEffect(() => {
    if (!open || !currentUid) return;

    updateUserOnlineStatus(currentUid, {
      name: userProfile?.name || `User-${currentUid.slice(0, 6)}`,
      photoURL: userProfile?.photoURL || "",
    });

    return () => {
      setUserOffline(currentUid);
    };
  }, [open, currentUid, userProfile]);

  /* ===============================
      Online users
  =============================== */
  useEffect(() => {
    if (!open) return;
    return subscribeOnlineUsers((users) => {
      //setOnlineUsers(users.filter((u) => u.uid !== currentUid));
      setOnlineUsers(users);
    });
  }, [open, currentUid]);

  /* ===============================
      Inbox
  =============================== */
  useEffect(() => {
    if (!open || !currentUid) return;
    return subscribeP2PChatRooms(currentUid, setChatRooms);
  }, [open, currentUid]);

  /* ===============================
      Open peer from map
  =============================== */
  useEffect(() => {
    if (!open || !initialPeer?.uid) return;
    setSelectedUser(initialPeer);
  }, [open, initialPeer]);

  /* ===============================
      Subscribe chat room
  =============================== */
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

  /* ===============================
      Actions
  =============================== */
  async function onSend() {
    if (!chatInput.trim() || !selectedUser) return;

    await sendChatMessage(
      chatInput,
      currentUid,
      userProfile?.name || `User-${currentUid.slice(0, 6)}`,
      selectedUser.uid,
      selectedUser.name
    );
    setChatInput("");
  }

  async function onDeleteRoom(room) {
    if (window.confirm("ต้องการลบห้องแชทนี้หรือไม่?")) {
      await deleteChatRoom(currentUid, room.otherUid);
      if (selectedUser?.uid === room.otherUid) {
        setSelectedUser(null);
        setRoomId(null);
        setMessages([]);
      }
    }
  }

  if (!open) return null;

  return (
    <div style={S.backdrop} onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div style={S.modal}>
        <div style={S.header}>
          <div style={{ fontWeight: 800 }}>Chat Support (Mock)</div>
          <button style={S.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={S.body}>
          {/* Left Sidebar */}
          <div style={S.left}>
            <div style={S.sectionTitle}>ออนไลน์ (mock)</div>
            <div style={S.list}>
              {onlineUsers.map((u) => (
                <button
                  key={u.uid}
                  style={S.userRow(selectedUser?.uid === u.uid)}
                  onClick={() => setSelectedUser({ uid: u.uid, name: u.name || "" })}
                >
                  <div style={{ fontWeight: 700 }}>{u.name || `User-${u.uid.slice(0, 6)}`}</div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>online</div>
                </button>
              ))}
              {onlineUsers.length === 0 && (
                <div style={S.empty}>ยังไม่มีคนออนไลน์ (เปิดอีกแท็บเพื่อทดสอบ)</div>
              )}
            </div>

            <div style={{ ...S.sectionTitle, marginTop: 20 }}>Inbox</div>
            <div style={S.list}>
              {chatRooms.map((r) => (
                <div key={r.roomId} style={S.roomRowWrap(selectedUser?.uid === r.otherUid)}>
                  <button
                    style={S.roomRowBtn}
                    onClick={() => setSelectedUser({ uid: r.otherUid, name: r.otherName })}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <div style={{ fontWeight: 800 }}>{r.otherName}</div>
                      {r.unreadCount > 0 && <span style={S.badge}>{r.unreadCount}</span>}
                    </div>
                    <div style={S.lastMsg}>{r.lastMessage}</div>
                  </button>
                  <button style={S.trashBtn} title="ลบแชท" onClick={() => onDeleteRoom(r)}>
                    🗑
                  </button>
                </div>
              ))}
              {chatRooms.length === 0 && <div style={S.empty}>ยังไม่มีห้องแชท</div>}
            </div>
          </div>

          {/* Right Chat Area */}
          <div style={S.right}>
            {!selectedUser?.uid ? (
              <div style={S.placeholder}>เลือกคนเพื่อเริ่มคุย</div>
            ) : (
              <>
                <div style={S.messages}>
                  {messages.map((m) => {
                    const mine = m.fromUid === currentUid;
                    return (
                      <div key={m.id} style={S.msgRow(mine)}>
                        <div style={S.bubble(mine)}>
                          <div style={{ fontSize: 11, opacity: 0.75, marginBottom: 2 }}>
                            {mine ? "คุณ" : (m.fromName || "อีกฝ่าย")}
                          </div>
                          <div>{m.text}</div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={endRef} />
                </div>

                <div style={S.inputBar}>
                  <input
                    style={S.input}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="พิมพ์ข้อความ..."
                    onKeyDown={(e) => (e.key === "Enter" ? onSend() : null)}
                  />
                  <button style={S.sendBtn} onClick={onSend}>ส่ง</button>
                </div>
              </>
            )}
          </div>
        </div>

        {roomId && <div style={S.footer}>Room: {roomId}</div>}
      </div>
    </div>
  );
}

const S = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999
  },
  modal: {
    width: "min(900px, 92vw)",
    height: "min(560px, 80vh)",
    background: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
  },
  header: {
    padding: "10px 16px",
    borderBottom: "1px solid #eee",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  },
  closeBtn: {
    border: "none",
    background: "transparent",
    fontSize: 18,
    cursor: "pointer",
    padding: 4
  },
  body: {
    flex: 1,
    display: "grid",
    gridTemplateColumns: "280px 1fr",
    minHeight: 0
  },
  left: {
    borderRight: "1px solid #eee",
    padding: 12,
    overflowY: "auto",
    background: "#fcfcfc"
  },
  right: {
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
    background: "#fff"
  },
  sectionTitle: {
    fontWeight: 900,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    opacity: 0.5,
    marginBottom: 8
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 8
  },
  empty: {
    padding: "8px 6px",
    opacity: 0.5,
    fontSize: 12,
    textAlign: "center"
  },
  userRow: (active) => ({
    border: `1px solid ${active ? "#111" : "#eee"}`,
    background: active ? "#f0f0f0" : "#fff",
    borderRadius: 10,
    padding: "10px 12px",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.2s"
  }),
  roomRowWrap: (active) => ({
    display: "grid",
    gridTemplateColumns: "1fr 34px",
    gap: 0,
    border: `1px solid ${active ? "#111" : "#eee"}`,
    background: active ? "#f0f0f0" : "#fff",
    borderRadius: 10,
    overflow: "hidden"
  }),
  roomRowBtn: {
    border: "none",
    background: "transparent",
    padding: "10px 12px",
    cursor: "pointer",
    textAlign: "left"
  },
  trashBtn: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    opacity: 0.4,
    fontSize: 14,
    "&:hover": { opacity: 1 }
  },
  badge: {
    background: "#ff4d4f",
    color: "#fff",
    borderRadius: 10,
    padding: "0 6px",
    fontSize: 11,
    fontWeight: "bold",
    height: 18,
    display: "flex",
    alignItems: "center"
  },
  lastMsg: {
    fontSize: 12,
    opacity: 0.6,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    marginTop: 4
  },
  placeholder: {
    flex: 1,
    display: "grid",
    placeItems: "center",
    opacity: 0.4,
    fontSize: 14
  },
  messages: {
    flex: 1,
    padding: "16px",
    overflowY: "auto",
    background: "#f7f7f7",
    display: "flex",
    flexDirection: "column"
  },
  msgRow: (mine) => ({
    display: "flex",
    justifyContent: mine ? "flex-end" : "flex-start",
    marginBottom: 12
  }),
  bubble: (mine) => ({
    maxWidth: "80%",
    borderRadius: mine ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
    padding: "10px 14px",
    background: mine ? "#111" : "#fff",
    color: mine ? "#fff" : "#111",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
    border: mine ? "none" : "1px solid #eee"
  }),
  inputBar: {
    display: "grid",
    gridTemplateColumns: "1fr 80px",
    gap: 10,
    padding: 12,
    borderTop: "1px solid #eee"
  },
  input: {
    border: "1px solid #ddd",
    borderRadius: 10,
    padding: "10px 14px",
    outline: "none",
    fontSize: 14
  },
  sendBtn: {
    border: "none",
    borderRadius: 10,
    background: "#111",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600
  },
  footer: {
    padding: "6px 12px",
    fontSize: 10,
    opacity: 0.4,
    borderTop: "1px solid #eee",
    textAlign: "right",
    background: "#fafafa"
  },
};