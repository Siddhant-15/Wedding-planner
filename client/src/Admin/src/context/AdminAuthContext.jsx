import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { adminService } from "../../../utils/api/services/adminService";

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const t = localStorage.getItem("admin_token");
      const u = localStorage.getItem("admin_user");
      if (t && u) { setToken(t); setUser(JSON.parse(u)); }
    } catch { }
    setReady(true);
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const res = await adminService.login({
      email,
      password,
    });
    localStorage.setItem("admin_token", res.token);
    localStorage.setItem("admin_user", JSON.stringify(res.user));
    setToken(res.token);
    setUser(res.user);
    return res;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    setToken(null); setUser(null);
  }, []);

  const isAuthed = !!token && user?.role === "admin";

  return (
    <AdminAuthContext.Provider value={{ user, token, ready, isAuthed, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
};
