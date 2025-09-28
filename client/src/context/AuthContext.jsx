import React, { createContext, useContext, useState } from "react";
import { authAPI } from "../services/api.js"
import jwtDecode from "jwt-decode";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = async (email, password, type) => {
    try {
      const res = await authAPI.login({ email, password });
      localStorage.setItem("access_token", res.data.access_token);
      localStorage.setItem("refresh_token", res.data.refresh_token);

      // Decode user info from JWT (server encodes { sub, exp })
      const decoded = jwtDecode(res.data.access_token);
      setUser({
        id: decoded.sub,
        email,
        type,
        exp: decoded.exp,
      });
    } catch (err) {
      console.error("Login failed:", err.response?.data || err.message);
      throw err;
    }
  };

  const register = async (firstName, lastName, email, phone, password, type) => {
    try {
      const res = await authAPI.signup({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        phone,
        role: type,
      });

      localStorage.setItem("access_token", res.data.access_token);
      localStorage.setItem("refresh_token", res.data.refresh_token);

      const decoded = jwtDecode(res.data.access_token);
      setUser({
        id: decoded.sub,
        email,
        type,
        exp: decoded.exp,
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