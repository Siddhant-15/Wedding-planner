import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { adminService } from "../../../utils/api/services/adminService";

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("admin_token");
      const storedUser = localStorage.getItem("admin_user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error("Failed to restore admin session", err);
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
    } finally {
      setReady(true);
    }
  }, []);

  const login = useCallback(async ({ email, password }) => {
    try {
      const res = await adminService.login({
        email,
        password,
      });


      const adminUser = {
        id: res.admin_id,
        email: res.email,
        role: String(res.role || "").toLowerCase(),
      };

      localStorage.setItem(
        "admin_token",
        res.access_token
      );

      localStorage.setItem(
        "admin_user",
        JSON.stringify(adminUser)
      );

      setToken(res.access_token);
      setUser(adminUser);

      return adminUser;
    } catch (error) {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");

      setToken(null);
      setUser(null);

      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");

    setToken(null);
    setUser(null);
  }, []);

  const isAuthed = Boolean(token);

  const isAdmin =
    user?.role === "admin" ||
    user?.role === "super_admin";

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        token,
        ready,
        isAuthed,
        isAdmin,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);

  if (!ctx) {
    throw new Error(
      "useAdminAuth must be used within AdminAuthProvider"
    );
  }

  return ctx;
};