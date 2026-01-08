import {
  collection,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  addDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  updateDoc,
  increment,
  limit,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

// ---------- helpers ----------
function getRoomId(uidA, uidB) {
  const [a, b] = [uidA, uidB].sort();
  return `room_${a}_${b}`;
}

async function ensureRoom(currentUid, currentName, otherUid, otherName = "") {
  const roomId = getRoomId(currentUid, otherUid);
  const roomRef = doc(db, "p2pRooms", roomId);
  const snap = await getDoc(roomRef);
  if (!snap.exists()) {
    await setDoc(roomRef, {
      members: [currentUid, otherUid],
      memberNames: {
        [currentUid]: currentName || `User-${currentUid.slice(0, 6)}`,
        [otherUid]: otherName || `User-${otherUid.slice(0, 6)}`,
      },
      lastMessage: "",
      lastAt: serverTimestamp(),
      unread: { [currentUid]: 0, [otherUid]: 0 },
    });
  } else {
    // อัปเดตชื่อเผื่อเปลี่ยน
    const data = snap.data();
    const next = {
      ...(data.memberNames || {}),
      [currentUid]: currentName || data.memberNames?.[currentUid] || `User-${currentUid.slice(0, 6)}`,
      [otherUid]: otherName || data.memberNames?.[otherUid] || `User-${otherUid.slice(0, 6)}`,
    };
    await updateDoc(roomRef, { memberNames: next });
  }
  return { roomId, roomRef };
}

// ---------- 1) online users ----------
export async function updateUserOnlineStatus(uid, profile) {
  if (!uid) return;
  const ref = doc(db, "presence", uid);
  await setDoc(
    ref,
    {
      uid,
      name: profile?.name || `User-${uid.slice(0, 6)}`,
      photoURL: profile?.photoURL || "",
      online: true,
      lastSeenAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export function subscribeOnlineUsers(cb) {
  const qy = query(collection(db, "presence"), where("online", "==", true));
  return onSnapshot(qy, (snap) => {
    const users = snap.docs.map((d) => d.data());
    cb(users);
  });
}

// ---------- 2) inbox rooms ----------
export function subscribeP2PChatRooms(currentUid, cb) {
  const qy = query(
    collection(db, "p2pRooms"),
    where("members", "array-contains", currentUid),
    orderBy("lastAt", "desc")
  );

  return onSnapshot(qy, (snap) => {
    const rooms = snap.docs.map((d) => {
      const data = d.data();
      const otherUid = (data.members || []).find((x) => x !== currentUid);
      const otherName = data.memberNames?.[otherUid] || `User-${(otherUid || "").slice(0, 6)}`;
      const unreadCount = data.unread?.[currentUid] || 0;

      return {
        id: d.id,
        roomId: d.id,
        otherUid,
        otherName,
        lastMessage: data.lastMessage || "",
        lastAt: data.lastAt,
        unreadCount,
      };
    });

    cb(rooms);
  });
}

// ---------- 3) open room: subscribe messages ----------
export async function subscribeChat(currentUid, currentName, otherUid, otherName, cb) {
  const { roomId } = await ensureRoom(currentUid, currentName, otherUid, otherName);
  const qy = query(
    collection(db, "p2pRooms", roomId, "messages"),
    orderBy("createdAt", "asc"),
    limit(300)
  );

  const unsub = onSnapshot(qy, (snap) => {
    const messages = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    cb({ roomId, messages });
  });

  return unsub;
}

// ---------- 2) send message ----------
export async function sendChatMessage(text, currentUid, currentName, otherUid, otherName = "") {
  if (!text?.trim()) return;
  const { roomId, roomRef } = await ensureRoom(currentUid, currentName, otherUid, otherName);

  await addDoc(collection(db, "p2pRooms", roomId, "messages"), {
    text: text.trim(),
    fromUid: currentUid,
    fromName: currentName || `User-${currentUid.slice(0, 6)}`,
    toUid: otherUid,
    createdAt: serverTimestamp(),
  });

  // update last message + unread ของฝั่งผู้รับ +0 ของผู้ส่ง
  await updateDoc(roomRef, {
    lastMessage: text.trim(),
    lastAt: serverTimestamp(),
    [`unread.${otherUid}`]: increment(1),
  });
}

// ---------- 3) mark read ----------
export async function markMessagesAsRead(currentUid, otherUid) {
  const roomId = getRoomId(currentUid, otherUid);
  const roomRef = doc(db, "p2pRooms", roomId);
  await updateDoc(roomRef, { [`unread.${currentUid}`]: 0 });
}

// ---------- 5) delete room (ลบทั้งห้อง + messages) ----------
export async function deleteChatRoom(currentUid, otherUid) {
  const roomId = getRoomId(currentUid, otherUid);

  // หมายเหตุ: Firestore client ลบ subcollection “ทีละ doc”
  // ถ้าข้อความเยอะ แนะนำทำผ่าน Cloud Function
  // ที่นี่ทำแบบ basic ก่อน
  const roomRef = doc(db, "p2pRooms", roomId);
  await deleteDoc(roomRef);
}
