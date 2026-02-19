import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

import { mockLogin, mockSignup, mockLogout } from "../mocks/mockAuthApi";
import { saveAuth, clearAuth, getUser, getTokens } from "../mocks/authStorage";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [me, setMe] = useState(null);
  const [tokens, setTokens] = useState(null);
  const [loading, setLoading] = useState(true);

  // ==================================================
  // RESTORE SESSION
  // ==================================================
  useEffect(() => {
    try {
      const user = getUser();
      const tk = getTokens();

      if (user && tk?.access) {
        setMe(user);
        setTokens(tk);
      } else {
        clearAuth();
      }
    } catch (err) {
      console.error("Auth restore failed:", err);
      clearAuth();
    } finally {
      setLoading(false);
    }
  }, []);

  // ==================================================
  // LOGIN
  // ==================================================
  const login = useCallback(async (email, password) => {
    const res = await mockLogin(email, password);

    const payload = {
      user: res.user,
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
    };

    saveAuth(payload);

    setMe(payload.user);
    setTokens({
      access: payload.accessToken,
      refresh: payload.refreshToken,
    });

    return payload;
  }, []);

  // ==================================================
  // SIGNUP
  // ==================================================
  const signup = useCallback(async (data) => {
    const res = await mockSignup(data);

    const payload = {
      user: res.user,
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
    };

    saveAuth(payload);

    setMe(payload.user);
    setTokens({
      access: payload.accessToken,
      refresh: payload.refreshToken,
    });

    return payload;
  }, []);

  // ==================================================
  // LOGOUT
  // ==================================================
  const logout = useCallback(async () => {
    try {
      await mockLogout();
    } finally {
      clearAuth();
      setMe(null);
      setTokens(null);
    }
  }, []);

  // ==================================================
  // UPDATE ROLE
  // ==================================================
  const updateRole = useCallback(
    (newRole) => {
      setMe((prev) => {
        if (!prev) return prev;

        const updated = { ...prev, role: newRole };

        saveAuth({
          user: updated,
          accessToken: tokens?.access || "",
          refreshToken: tokens?.refresh || "",
        });

        return updated;
      });
    },
    [tokens]
  );

  // ==================================================
  // PERMISSIONS
  // ==================================================
  const role = me?.role || "guest";

  const hasRole = useCallback(
    (allowed) => {
      if (Array.isArray(allowed)) return allowed.includes(role);
      return allowed === role;
    },
    [role]
  );

  const value = {
    me,
    role,
    tokens,
    loading,
    isLoggedIn: !!me,

    login,
    signup,
    logout,
    updateRole,

    hasRole,

    isAdmin: role === "admin",
    isSeller: role === "seller",
    isLandlord: role === "landlord",
    isAgent: role === "agent",
  };

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

// ==================================================
// HOOK
// ==================================================
export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
