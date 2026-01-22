// src/services/chatService.mock.js

const CHANNEL = new BroadcastChannel("mock-chat");

const LS_ONLINE = "mock-online-users";
const LS_ROOMS = "mock-chat-rooms";
const LS_MESSAGES = "mock-chat-messages";

/* ---------- helpers ---------- */
function load(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getRoomId(uidA, uidB) {
  const [a, b] = [uidA, uidB].sort();
  return `room_${a}_${b}`;
}

/* =========================================================
   1) ONLINE USERS
========================================================= */
export function updateUserOnlineStatus(uid, profile) {
  if (!uid) return;

  const online = load(LS_ONLINE, {});
  const wasOnline = online[uid]?.online === true;

  online[uid] = {
    uid,
    name: profile?.name || `User-${uid.slice(0, 6)}`,
    photoURL: profile?.photoURL || "",
    online: true,
    lastSeenAt: Date.now(),
  };

  save(LS_ONLINE, online);

  // ยิง event เฉพาะตอนเปลี่ยนสถานะ
  CHANNEL.postMessage({ type: "online" });
}

export function setUserOffline(uid) {
  if (!uid) return;

  const online = load(LS_ONLINE, {});
  if (!online[uid]) return;

  delete online[uid];
  save(LS_ONLINE, online);

  CHANNEL.postMessage({ type: "online" });
}

export function subscribeOnlineUsers(cb) {
  const emit = () => {
    const raw = load(LS_ONLINE, {});
    cb(Object.values(raw));
  };

  emit();

  const onMsg = (e) => {
    if (e.data?.type === "online") emit();
  };

  CHANNEL.addEventListener("message", onMsg);
  return () => CHANNEL.removeEventListener("message", onMsg);
}

/* =========================================================
   2) INBOX / ROOMS
========================================================= */
export function subscribeP2PChatRooms(currentUid, cb) {
  const emit = () => {
    const rooms = Object.values(load(LS_ROOMS, {}))
      .filter((r) => r.members.includes(currentUid))
      .sort((a, b) => (b.lastAt || 0) - (a.lastAt || 0));

    cb(
      rooms.map((r) => {
        const otherUid = r.members.find((x) => x !== currentUid);
        return {
          roomId: r.roomId,
          otherUid,
          otherName: r.memberNames?.[otherUid],
          lastMessage: r.lastMessage || "",
          lastAt: r.lastAt,
          unreadCount: r.unread?.[currentUid] || 0,
        };
      })
    );
  };

  emit();

  const onMsg = (e) => e.data?.type === "rooms" && emit();
  CHANNEL.addEventListener("message", onMsg);

  return () => CHANNEL.removeEventListener("message", onMsg);
}

/* =========================================================
   3) OPEN ROOM / MESSAGES
========================================================= */
export async function subscribeChat(
  currentUid,
  currentName,
  otherUid,
  otherName,
  cb
) {
  const roomId = getRoomId(currentUid, otherUid);
  const rooms = load(LS_ROOMS, {});

  if (!rooms[roomId]) {
    rooms[roomId] = {
      roomId,
      members: [currentUid, otherUid],
      memberNames: {
        [currentUid]: currentName || `User-${currentUid.slice(0, 6)}`,
        [otherUid]: otherName || `User-${otherUid.slice(0, 6)}`,
      },
      lastMessage: "",
      lastAt: Date.now(),
      unread: { [currentUid]: 0, [otherUid]: 0 },
    };
    save(LS_ROOMS, rooms);
    CHANNEL.postMessage({ type: "rooms" });
  }

  const emit = () => {
    const messages = load(LS_MESSAGES, {})[roomId] || [];
    cb({ roomId, messages });
  };

  emit();

  const onMsg = (e) =>
    e.data?.type === "message" && e.data.roomId === roomId && emit();

  CHANNEL.addEventListener("message", onMsg);
  return () => CHANNEL.removeEventListener("message", onMsg);
}

/* =========================================================
   4) SEND MESSAGE
========================================================= */
export async function sendChatMessage(
  text,
  currentUid,
  currentName,
  otherUid,
  otherName = ""
) {
  if (!text?.trim()) return;

  const roomId = getRoomId(currentUid, otherUid);

  const messages = load(LS_MESSAGES, {});
  const list = messages[roomId] || [];

  list.push({
    id: Date.now() + Math.random(),
    text: text.trim(),
    fromUid: currentUid,
    fromName: currentName || `User-${currentUid.slice(0, 6)}`,
    toUid: otherUid,
    createdAt: Date.now(),
  });

  messages[roomId] = list;
  save(LS_MESSAGES, messages);

  const rooms = load(LS_ROOMS, {});
  const room = rooms[roomId];

  room.lastMessage = text.trim();
  room.lastAt = Date.now();
  room.unread[otherUid] = (room.unread[otherUid] || 0) + 1;

  save(LS_ROOMS, rooms);

  CHANNEL.postMessage({ type: "message", roomId });
  CHANNEL.postMessage({ type: "rooms" });
}

/* =========================================================
   5) READ / DELETE
========================================================= */
export async function markMessagesAsRead(currentUid, otherUid) {
  const roomId = getRoomId(currentUid, otherUid);
  const rooms = load(LS_ROOMS, {});
  if (!rooms[roomId]) return;

  rooms[roomId].unread[currentUid] = 0;
  save(LS_ROOMS, rooms);

  CHANNEL.postMessage({ type: "rooms" });
}

export async function deleteChatRoom(currentUid, otherUid) {
  const roomId = getRoomId(currentUid, otherUid);

  const rooms = load(LS_ROOMS, {});
  const messages = load(LS_MESSAGES, {});

  delete rooms[roomId];
  delete messages[roomId];

  save(LS_ROOMS, rooms);
  save(LS_MESSAGES, messages);

  CHANNEL.postMessage({ type: "rooms" });
}
