// src/services/chatService.firebase.js
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  getDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebase.js";

/* ===============================
  Utils
=============================== */
function getRoomId(uid1, uid2) {
  return [uid1, uid2].sort().join("_");
}

/* ===============================
  Presence
=============================== */
export async function updateUserOnlineStatus(uid, profile) {
  await setDoc(
    doc(db, "users", uid),
    {
      ...profile,
      online: true,
      lastActive: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function setUserOffline(uid) {
  await updateDoc(doc(db, "users", uid), {
    online: false,
    lastActive: serverTimestamp(),
  });
}

/* ===============================
  Online users
=============================== */
export function subscribeOnlineUsers(cb) {
  const q = query(collection(db, "users"), where("online", "==", true));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ uid: d.id, ...d.data() })));
  });
}

/* ===============================
  Inbox
=============================== */
export function subscribeP2PChatRooms(uid, cb) {
  const q = query(
    collection(db, "chatRooms"),
    where("members", "array-contains", uid),
    orderBy("updatedAt", "desc")
  );

  return onSnapshot(q, async (snap) => {
    const rooms = await Promise.all(
      snap.docs.map(async (d) => {
        const data = d.data();
        const otherUid = data.members.find((m) => m !== uid);
        const userSnap = await getDoc(doc(db, "users", otherUid));

        return {
          roomId: d.id,
          otherUid,
          otherName: userSnap.data()?.name || "User",
          lastMessage: data.lastMessage || "",
          unreadCount: 0, // ต่อ unread จริงทีหลังได้
        };
      })
    );

    cb(rooms);
  });
}

/* ===============================
  Chat room
=============================== */
export async function subscribeChat(
  myUid,
  myName,
  peerUid,
  peerName,
  cb
) {
  const roomId = getRoomId(myUid, peerUid);
  const roomRef = doc(db, "chatRooms", roomId);

  await setDoc(
    roomRef,
    {
      members: [myUid, peerUid],
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  const msgRef = collection(roomRef, "messages");
  const q = query(msgRef, orderBy("createdAt"));

  return onSnapshot(q, (snap) => {
    cb({
      roomId,
      messages: snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })),
    });
  });
}

/* ===============================
  Send message
=============================== */
export async function sendChatMessage(
  text,
  fromUid,
  fromName,
  toUid
) {
  const roomId = getRoomId(fromUid, toUid);
  const roomRef = doc(db, "chatRooms", roomId);

  await addDoc(collection(roomRef, "messages"), {
    text,
    fromUid,
    fromName,
    createdAt: serverTimestamp(),
    readBy: [fromUid],
  });

  await updateDoc(roomRef, {
    lastMessage: text,
    updatedAt: serverTimestamp(),
  });
}

/* ===============================
  Read / delete
=============================== */
export async function markMessagesAsRead() {
  // (version แรกยังไม่จำเป็น)
}

export async function deleteChatRoom(myUid, otherUid) {
  const roomId = getRoomId(myUid, otherUid);
  await deleteDoc(doc(db, "chatRooms", roomId));
}
