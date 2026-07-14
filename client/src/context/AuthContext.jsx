import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../utils/api/services/auth.service";
import jwtDecode from "jwt-decode";

const AuthContext = createContext(undefined);

// ✅ helper to extract token safely
const extractToken = (res) => {
  return res?.token || res?.data?.access_token;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ helper to set user from token
  const setUserFromToken = (token, fallbackEmail = "") => {
    try {
      const decoded = jwtDecode(token);

      let role = decoded.role || "customer";
      if (Array.isArray(role)) role = role[0];

      role = role.toString().trim().toLowerCase();

      setUser({
        id: decoded.sub,
        email: decoded.email || fallbackEmail,
        type: role,
        exp: decoded.exp,
      });
    } catch (err) {
      console.error("Token decode failed:", err);
      localStorage.removeItem("access_token");
      setUser(null);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const accessToken = localStorage.getItem("access_token");

      // 🔁 Try refresh if no token
      if (!accessToken) {
        try {
          const res = await authService.refresh();
          const newToken = extractToken(res);

          if (!newToken) throw new Error("No token in refresh");

          localStorage.setItem("access_token", newToken);
          setUserFromToken(newToken);
        } catch (err) {
          // silent fail
        } finally {
          setLoading(false);
        }
        return;
      }

      try {
        const decoded = jwtDecode(accessToken);
        const currentTime = Math.floor(Date.now() / 1000);

        // ✅ valid token
        if (decoded.exp > currentTime) {
          setUserFromToken(accessToken);
        } else {
          // 🔁 expired → refresh
          try {
            const res = await authService.refresh();
            const newToken = extractToken(res);

            if (!newToken) throw new Error("No token in refresh");

            localStorage.setItem("access_token", newToken);
            setUserFromToken(newToken);
          } catch (err) {
            console.error("Refresh failed:", err);
            localStorage.removeItem("access_token");
          }
        }
      } catch (err) {
        console.error("Invalid token:", err);
        localStorage.removeItem("access_token");
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // 🔐 LOGIN
  const login = async (email, password, type) => {
    try {
      const res = await authService.login({
        email,
        password,
        role: type,
      });

      const token = extractToken(res);

      if (!token) {
        throw new Error("Login failed: No token received");
      }

      localStorage.setItem("access_token", token);
      setUserFromToken(token, email);

    } catch (err) {
      console.error("Login failed:", err.message);
      throw err;
    }
  };

  // 📝 REGISTER
  const register = async (firstName, lastName, email, phone, password, type) => {
    try {
      let payload = {
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        password,
      };

      if (type === "vendor") {
        payload.business_name = "";
      }

      const res = await authService.signup(payload, type);

      const token = extractToken(res);

      if (!token) {
        throw new Error("Registration failed: No token received");
      }

      localStorage.setItem("access_token", token);
      setUserFromToken(token, email);

    } catch (err) {
      console.error("Registration failed:", err.message);
      throw err;
    }
  };

  // 🚪 LOGOUT
  const logout = () => {
    localStorage.removeItem("access_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// 🧠 HOOK
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}