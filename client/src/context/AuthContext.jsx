import React, { createContext, useContext, useState } from "react";
import { authAPI } from "../services/api.js"

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = async (email, password, type) => {
    try {
      const res = await authAPI.login({ email, password });
      localStorage.setItem("access_token", res.data.access_token);
      localStorage.setItem("refresh_token", res.data.refresh_token);

      // In a real app, fetch user profile after login
      setUser({
        id: res.data.user_id || "1", // depends on backend response
        name: res.data.name || email,
        email,
        type,
      });
    } catch (err) {
      console.error("Login failed:", err.response?.data || err.message);
      throw err;
    }
  };

  const register = async (name, email, password, type) => {
    try {
      const res = await authAPI.signup({
        first_name: name.split(" ")[0] || name,
        last_name: name.split(" ")[1] || "",
        email,
        password,
        phone: "", // placeholder, depends on your backend schema
        role: type, // 'customer' or 'vendor'
      });

      localStorage.setItem("access_token", res.data.access_token);
      localStorage.setItem("refresh_token", res.data.refresh_token);

      setUser({
        id: res.data.user_id || "1",
        name,
        email,
        type,
      });
    } catch (err) {
      console.error("Registration failed:", err.response?.data || err.message);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
