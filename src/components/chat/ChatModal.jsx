import React, { useEffect, useMemo, useRef, useState } from "react";
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
  userProfile,         // { name, photoURL }
  initialPeer,         // { uid, name } optional (เปิดจาก “แชทผู้ขาย”)
}) {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const [roomId, setRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  const [unreadCount, setUnreadCount] = useState(0);

  const msgEndRef = useRef(null);
  const scrollToBottom = () => msgEndRef.current?.scrollIntoView({ behavior: "smooth" });

  // init facade
  useEffect(() => {
    if (!open) return;
    if (!currentUid) return;

    let unsubOnline = null;
    let unsubRooms = null;
    let onlineTimer = null;

    unsubOnline = subscribeOnlineUsers((users) => {
      setOnlineUsers(users.filter((u) => u.uid !== currentUid));
    });

    unsubRooms = subscribeP2PChatRooms(currentUid, (rooms) => {
      setChatRooms(rooms);
      setUnreadCount(rooms.reduce((s, r) => s + (r.unreadCount || 0), 0));
    });

    // update status now + interval
    updateUserOnlineStatus(currentUid, userProfile);
    onlineTimer = setInterval(() => updateUserOnlineStatus(currentUid, userProfile), 30000);

    return () => {
      unsubOnline?.();
      unsubRooms?.();
      if (onlineTimer) clearInterval(onlineTimer);
    };
  }, [open, currentUid, userProfile]);

  // auto open from map (initialPeer)
  useEffect(() => {
    if (!open) return;
    if (!initialPeer?.uid) return;
    setSelectedUser({ uid: initialPeer.uid, name: initialPeer.name || "" });
  }, [open, initialPeer]);

  // subscribe messages when selectedUser change
  useEffect(() => {
    if (!open) return;
    if (!currentUid) return;
    if (!selectedUser?.uid) return;

    let unsub = null;
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
      alert("กรุณาตั้งชื่อผู้ใช้ก่อนส่งข้อความ");
      return;
    }
    if (!selectedUser?.uid) {
      alert("กรุณาเลือกผู้รับก่อนส่งข้อความ");
      return;
    }
    try {
      await sendChatMessage(chatInput, currentUid, userProfile.name, selectedUser.uid, selectedUser.name || "");
      setChatInput("");
    } catch (e) {
      alert("ไม่สามารถส่งข้อความได้: " + (e?.message || String(e)));
    }
  }

  async function onDeleteRoom(r) {
    const ok = confirm(`ต้องการลบการสนทนากับ "${r.otherName}" หรือไม่?`);
    if (!ok) return;
    try {
      await deleteChatRoom(currentUid, r.otherUid);
      // reset view if deleted current peer
      if (selectedUser?.uid === r.otherUid) {
        setSelectedUser(null);
        setRoomId(null);
        setMessages([]);
      }
    } catch (e) {
      alert("เกิดข้อผิดพลาด: " + (e?.message || String(e)));
    }
  }

  const headerTitle = useMemo(() => {
    if (selectedUser?.uid) return `แชทกับ ${selectedUser.name || `User-${selectedUser.uid.slice(0, 6)}`}`;
    return `แชท (${unreadCount} ใหม่)`;
  }, [selectedUser, unreadCount]);

  if (!open) return null;

  return (
    <div style={styles.backdrop} onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <div style={{ fontWeight: 700 }}>{headerTitle}</div>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={styles.body}>
          {/* left */}
          <div style={styles.left}>
            <div style={styles.sectionTitle}>ออนไลน์</div>
            <div style={styles.list}>
              {onlineUsers.map((u) => (
                <button
                  key={u.uid}
                  style={styles.userRow(selectedUser?.uid === u.uid)}
                  onClick={() => setSelectedUser({ uid: u.uid, name: u.name || "" })}
                >
                  <div style={{ fontWeight: 600 }}>{u.name || `User-${u.uid.slice(0, 6)}`}</div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>online</div>
                </button>
              ))}
              {onlineUsers.length === 0 && <div style={styles.empty}>ไม่มีคนออนไลน์</div>}
            </div>

            <div style={{ ...styles.sectionTitle, marginTop: 10 }}>Inbox</div>
            <div style={styles.list}>
              {chatRooms.map((r) => (
                <div key={r.roomId} style={styles.roomRowWrap(selectedUser?.uid === r.otherUid)}>
                  <button
                    style={styles.roomRowBtn}
                    onClick={() => setSelectedUser({ uid: r.otherUid, name: r.otherName })}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <div style={{ fontWeight: 700 }}>{r.otherName}</div>
                      {r.unreadCount > 0 && <span style={styles.badge}>{r.unreadCount}</span>}
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.75, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {r.lastMessage}
                    </div>
                  </button>
                  <button style={styles.trashBtn} title="ลบแชท" onClick={() => onDeleteRoom(r)}>🗑</button>
                </div>
              ))}
              {chatRooms.length === 0 && <div style={styles.empty}>ยังไม่มีห้องแชท</div>}
            </div>
          </div>

          {/* right */}
          <div style={styles.right}>
            {!selectedUser?.uid ? (
              <div style={styles.placeholder}>เลือกคนเพื่อเริ่มคุย</div>
            ) : (
              <>
                <div style={styles.messages}>
                  {messages.map((m) => {
                    const mine = m.fromUid === currentUid;
                    return (
                      <div key={m.id} style={styles.msgRow(mine)}>
                        <div style={styles.msgBubble(mine)}>
                          <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 2 }}>
                            {mine ? "คุณ" : (m.fromName || "อีกฝ่าย")}
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
                    placeholder="พิมพ์ข้อความ..."
                    onKeyDown={(e) => (e.key === "Enter" ? onSend() : null)}
                  />
                  <button style={styles.sendBtn} onClick={onSend}>ส่ง</button>
                </div>
              </>
            )}
          </div>
        </div>

        {roomId && <div style={styles.footer}>Room: {roomId}</div>}
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,.35)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999,
  },
  modal: { width: "min(1100px, 95vw)", height: "min(680px, 90vh)", background: "#fff", borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column" },
  header: { padding: "10px 12px", borderBottom: "1px solid #eee", display: "flex", alignItems: "center", justifyContent: "space-between" },
  closeBtn: { border: "none", background: "transparent", fontSize: 18, cursor: "pointer" },
  body: { flex: 1, display: "grid", gridTemplateColumns: "320px 1fr", minHeight: 0 },
  left: { borderRight: "1px solid #eee", padding: 10, overflow: "auto" },
  right: { display: "flex", flexDirection: "column", minHeight: 0 },
  sectionTitle: { fontWeight: 800, fontSize: 12, opacity: 0.7, marginBottom: 6 },
  list: { display: "flex", flexDirection: "column", gap: 6 },
  userRow: (active) => ({
    border: `1px solid ${active ? "#222" : "#eee"}`,
    background: active ? "#f6f6f6" : "#fff",
    borderRadius: 10, padding: "8px 10px", cursor: "pointer", textAlign: "left",
  }),
  roomRowWrap: (active) => ({
    display: "grid", gridTemplateColumns: "1fr 34px", gap: 6,
    border: `1px solid ${active ? "#222" : "#eee"}`, borderRadius: 10, overflow: "hidden",
  }),
  roomRowBtn: { border: "none", background: "transparent", padding: "8px 10px", cursor: "pointer", textAlign: "left" },
  trashBtn: { border: "none", background: "#fff", cursor: "pointer" },
  badge: { background: "#111", color: "#fff", borderRadius: 999, padding: "2px 8px", fontSize: 12, lineHeight: "16px", height: 18, alignSelf: "center" },
  placeholder: { flex: 1, display: "grid", placeItems: "center", opacity: 0.7 },
  messages: { flex: 1, padding: 12, overflow: "auto", background: "#fafafa" },
  msgRow: (mine) => ({ display: "flex", justifyContent: mine ? "flex-end" : "flex-start", marginBottom: 10 }),
  msgBubble: (mine) => ({
    maxWidth: "75%",
    borderRadius: 14,
    padding: "8px 10px",
    background: mine ? "#111" : "#fff",
    color: mine ? "#fff" : "#111",
    border: mine ? "1px solid #111" : "1px solid #eaeaea",
  }),
  inputBar: { display: "grid", gridTemplateColumns: "1fr 90px", gap: 8, padding: 10, borderTop: "1px solid #eee" },
  input: { border: "1px solid #ddd", borderRadius: 12, padding: "10px 12px", outline: "none" },
  sendBtn: { border: "none", borderRadius: 12, background: "#111", color: "#fff", cursor: "pointer" },
  footer: { padding: "6px 10px", fontSize: 12, opacity: 0.6, borderTop: "1px solid #eee" },
};
