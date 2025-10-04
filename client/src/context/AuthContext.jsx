import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../utils/api"
import jwtDecode from "jwt-decode";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Restore user from token on app load
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
      try {
        const decoded = jwtDecode(accessToken);
        const currentTime = Math.floor(Date.now() / 1000);
        if (decoded.exp > currentTime) { // Check if token is not expired
          setUser({
            id: decoded.sub,
            email: decoded.email || "", // Adjust based on token contents
            type: decoded.role || "customer", // Fallback role
            exp: decoded.exp,
          });
        } else {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        }
      } catch (err) {
        console.error("Invalid token:", err);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      }
    }
  }, []);

  const login = async (email, password, type) => {
    try {
      const res = await authAPI.login({ email, password, role: type }); // Include role in payload if API expects it
      localStorage.setItem("access_token", res.data.access_token);
      localStorage.setItem("refresh_token", res.data.refresh_token);
  
      const decoded = jwtDecode(res.data.access_token);
      let userRole = decoded.role || type; // Fallback to type if role is missing
      if (Array.isArray(userRole)) {
        userRole = userRole[0]; // Extract first element if array
      }
      userRole = userRole.toString().trim().toLowerCase();
      if (!["customer", "vendor", "admin"].includes(userRole)) {
        throw new Error("Invalid role in token");
      }
      setUser({
        id: decoded.sub,
        email,
        type: userRole,
        exp: decoded.exp,
      });
    } catch (err) {
      console.error("Login failed:", err.response?.data || err.message);
      throw err;
    }
  };

  const register = async (firstName, lastName, email, password, type) => {
    try {
      let payload;
        payload = {
          first_name: firstName,
          last_name: lastName,
          email,
          password,
        };

      const res = await authAPI.signup(payload, type);

      localStorage.setItem("access_token", res.data.access_token);
      localStorage.setItem("refresh_token", res.data.refresh_token);

      const decoded = jwtDecode(res.data.access_token);
      setUser({
        id: decoded.sub,
        email,
        type: decoded.role || type,
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
