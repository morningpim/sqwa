import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored =
      localStorage.getItem("authUser") ||
      sessionStorage.getItem("authUser");

    if (stored) setUser(JSON.parse(stored));

    setLoading(false);
  }, []);

  const login = (userData, remember) => {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem("authUser", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("authUser");
    sessionStorage.removeItem("authUser");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
