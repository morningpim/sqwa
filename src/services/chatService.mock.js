// src/services/chatService.mock.js
// Mock P2P chat using localStorage + BroadcastChannel (sync across tabs)

const CH = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("sqwa_chat_mock") : null;

function now() {
  return Date.now();
}

function safeJsonParse(s, fallback) {
  try {
    return JSON.parse(s);
  } catch {
    return fallback;
  }
}

function read(key, fallback) {
  const v = safeJsonParse(localStorage.getItem(key), fallback);

  if (v == null) return fallback;

  // ถ้า fallback เป็น array แต่ v ไม่ใช่ array -> คืน fallback
  if (Array.isArray(fallback) && !Array.isArray(v)) return fallback;

  // ถ้า fallback เป็น object (ไม่ใช่ array) แต่ v ไม่ใช่ object -> คืน fallback
  if (
    fallback &&
    typeof fallback === "object" &&
    !Array.isArray(fallback) &&
    (typeof v !== "object" || Array.isArray(v))
  ) {
    return fallback;
  }

  return v;
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function roomIdOf(uidA, uidB) {
  const [a, b] = [uidA, uidB].sort();
  return `room_${a}_${b}`;
}

function presenceKey() {
  return `mock_presence`;
}
function roomsKey() {
  return `mock_rooms`;
}
function messagesKey(roomId) {
  return `mock_messages_${roomId}`;
}

function emit(type, payload) {
  // trigger same-tab listeners via storage event trick: write a bump key
  const bumpKey = "__mock_chat_bump__";
  localStorage.setItem(bumpKey, JSON.stringify({ type, payload, t: now() }));

  if (CH) {
    CH.postMessage({ type, payload, t: now() });
  }
}

function onAnyChange(handler) {
  const onStorage = (e) => {
    if (!e.key) return;
    // listen any relevant keys
    if (
      e.key === presenceKey() ||
      e.key === roomsKey() ||
      e.key.startsWith("mock_messages_") ||
      e.key === "__mock_chat_bump__"
    ) {
      handler();
    }
  };
  window.addEventListener("storage", onStorage);

  let onMsg = null;
  if (CH) {
    onMsg = () => handler();
    CH.addEventListener("message", onMsg);
  }

  return () => {
    window.removeEventListener("storage", onStorage);
    if (CH && onMsg) CH.removeEventListener("message", onMsg);
  };
}

// ---------------- Presence ----------------
export async function updateUserOnlineStatus(uid, profile) {
  if (!uid) return;

  const list = read(presenceKey(), []);
  const name = profile?.name || `User-${uid.slice(0, 6)}`;
  const photoURL = profile?.photoURL || "";

  const idx = list.findIndex((x) => x.uid === uid);
  const row = { uid, name, photoURL, online: true, lastSeenAt: now() };

  if (idx >= 0) list[idx] = { ...list[idx], ...row };
  else list.push(row);

  write(presenceKey(), list);
  emit("presence", { uid });
}

export function subscribeOnlineUsers(cb) {
  const refresh = () => {
    const raw = read(presenceKey(), []);
    const list = Array.isArray(raw) ? raw : []; // ✅ กัน null/ผิดประเภท

    const t = now();
    const online = list
      .filter(Boolean) // ✅ กัน null item
      .map((u) => ({
        ...u,
        online: !!u?.online && (t - (u?.lastSeenAt || 0) < 70000),
      }))
      .filter((u) => u.online);

    cb(online);
  };

  refresh();
  const unsub = onAnyChange(refresh);
  const timer = setInterval(refresh, 5000);

  return () => {
    unsub?.();
    clearInterval(timer);
  };
}


// ---------------- Rooms (Inbox) ----------------
function ensureRoom(currentUid, currentName, otherUid, otherName = "") {
  const rid = roomIdOf(currentUid, otherUid);
  const rooms = read(roomsKey(), {});

  if (!rooms[rid]) {
    rooms[rid] = {
      roomId: rid,
      members: [currentUid, otherUid],
      memberNames: {
        [currentUid]: currentName || `User-${currentUid.slice(0, 6)}`,
        [otherUid]: otherName || `User-${otherUid.slice(0, 6)}`,
      },
      lastMessage: "",
      lastAt: now(),
      unread: { [currentUid]: 0, [otherUid]: 0 },
    };
    write(roomsKey(), rooms);
  } else {
    // update names
    rooms[rid].memberNames = {
      ...(rooms[rid].memberNames || {}),
      [currentUid]:
        currentName ||
        rooms[rid].memberNames?.[currentUid] ||
        `User-${currentUid.slice(0, 6)}`,
      [otherUid]:
        otherName ||
        rooms[rid].memberNames?.[otherUid] ||
        `User-${otherUid.slice(0, 6)}`,
    };
    write(roomsKey(), rooms);
  }

  return rooms[rid];
}

export function subscribeP2PChatRooms(currentUid, cb) {
  const refresh = () => {
    const roomsMap = read(roomsKey(), {});
    const all = Object.values(roomsMap);

    const rooms = all
      .filter((r) => (r.members || []).includes(currentUid))
      .map((r) => {
        const otherUid = (r.members || []).find((x) => x !== currentUid) || null;
        const otherName =
          r.memberNames?.[otherUid] || (otherUid ? `User-${otherUid.slice(0, 6)}` : "Unknown");
        const unreadCount = r.unread?.[currentUid] || 0;

        return {
          id: r.roomId,
          roomId: r.roomId,
          otherUid,
          otherName,
          lastMessage: r.lastMessage || "",
          lastAt: r.lastAt || 0,
          unreadCount,
        };
      })
      .sort((a, b) => (b.lastAt || 0) - (a.lastAt || 0));

    cb(rooms);
  };

  refresh();
  return onAnyChange(refresh);
}

// ---------------- Messages ----------------
export async function subscribeChat(currentUid, currentName, otherUid, otherName, cb) {
  // ensure room exists
  const room = ensureRoom(currentUid, currentName, otherUid, otherName);
  const rid = room.roomId;

  const refresh = () => {
    const msgs = read(messagesKey(rid), []);
    cb({ roomId: rid, messages: msgs });
  };

  refresh();
  const unsub = onAnyChange(refresh);
  return unsub;
}

export async function sendChatMessage(text, currentUid, currentName, otherUid, otherName = "") {
  const clean = (text || "").trim();
  if (!clean) return;

  const room = ensureRoom(currentUid, currentName, otherUid, otherName);
  const rid = room.roomId;

  const msg = {
    id: `m_${now()}_${Math.random().toString(16).slice(2)}`,
    text: clean,
    fromUid: currentUid,
    fromName: currentName || `User-${currentUid.slice(0, 6)}`,
    toUid: otherUid,
    createdAt: now(),
  };

  const msgs = read(messagesKey(rid), []);
  msgs.push(msg);
  write(messagesKey(rid), msgs);

  // update room meta + unread for recipient
  const rooms = read(roomsKey(), {});
  const r = rooms[rid] || room;

  r.lastMessage = clean;
  r.lastAt = now();
  r.unread = r.unread || {};
  r.unread[otherUid] = (r.unread[otherUid] || 0) + 1;

  rooms[rid] = r;
  write(roomsKey(), rooms);

  emit("message", { roomId: rid });
}

export async function markMessagesAsRead(currentUid, otherUid) {
  const rid = roomIdOf(currentUid, otherUid);
  const rooms = read(roomsKey(), {});
  const r = rooms[rid];
  if (!r) return;

  r.unread = r.unread || {};
  r.unread[currentUid] = 0;

  rooms[rid] = r;
  write(roomsKey(), rooms);
  emit("read", { roomId: rid });
}

export async function deleteChatRoom(currentUid, otherUid) {
  const rid = roomIdOf(currentUid, otherUid);

  const rooms = read(roomsKey(), {});
  delete rooms[rid];
  write(roomsKey(), rooms);

  localStorage.removeItem(messagesKey(rid));
  emit("delete", { roomId: rid });
}
