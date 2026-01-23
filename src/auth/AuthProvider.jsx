// src/auth/AuthProvider.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase/firebase.js";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔐 Google Login
  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  // 🚪 Logout
  const logout = async () => {
    await signOut(auth);
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setLoading(true);

      if (!user) {
        setMe(null);
        setLoading(false);
        return;
      }

      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      // 🆕 first login → create user doc
      if (!snap.exists()) {
        const newUser = {
          uid: user.uid,
          name: user.displayName || "User",
          email: user.email,
          photoURL: user.photoURL || "",
          role: "buyer", // default role
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(ref, newUser);
        setMe(newUser);
      } else {
        setMe(snap.data());
      }

      setLoading(false);
    });

    return () => unsub();
  }, []);

  const value = useMemo(
    () => ({
      me,
      loading,
      role: me?.role || "buyer",
      isLoggedIn: !!me,
      login,
      logout,
    }),
    [me, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
