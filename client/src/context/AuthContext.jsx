import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../utils/api"
import jwtDecode from "jwt-decode";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      // Restore user from token on app load
      const accessToken = localStorage.getItem("access_token");
      
      // If no access token but we might have a refresh token (HttpOnly cookie), try to refresh
      if (!accessToken) {
        try {
          const res = await authAPI.refresh();
          const newAccessToken = res.data.access_token;
          localStorage.setItem("access_token", newAccessToken);
          const decoded = jwtDecode(newAccessToken);
          setUser({
            id: decoded.sub,
            email: decoded.email || "",
            type: decoded.role || "customer",
            exp: decoded.exp,
          });
        } catch (err) {
          // No valid refresh token either
        } finally {
          setLoading(false);
        }
        return;
      }
      
      try {
        const decoded = jwtDecode(accessToken);
        const currentTime = Math.floor(Date.now() / 1000);
        if (decoded.exp > currentTime) {
          setUser({
            id: decoded.sub,
            email: decoded.email || "",
            type: decoded.role || "customer",
            exp: decoded.exp,
          });
          setLoading(false);
        } else {
          // Token expired, attempt to refresh on load
          authAPI.refresh().then(res => {
            const newAccessToken = res.data.access_token;
            localStorage.setItem("access_token", newAccessToken);
            const newDecoded = jwtDecode(newAccessToken);
            setUser({
              id: newDecoded.sub,
              email: newDecoded.email || "",
              type: newDecoded.role || "customer",
              exp: newDecoded.exp,
            });
          }).catch(err => {
            console.error("Refresh on load failed:", err);
            localStorage.removeItem("access_token");
          }).finally(() => {
            setLoading(false);
          });
        }
      } catch (err) {
        console.error("Invalid token:", err);
        localStorage.removeItem("access_token");
        setLoading(false);
      }
    };
    
    initializeAuth();
  }, []);

  const login = async (email, password, type) => {
    try {
      const res = await authAPI.login({ email, password, role: type }); // Include role in payload if API expects it
      localStorage.setItem("access_token", res.data.access_token);
  
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

  const register = async (firstName, lastName, email, phone, password, type) => {
    try {
      let payload = {
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        password,
      };

      if (type === 'vendor') {
        payload.business_name = ""; 
      }

      const res = await authAPI.signup(payload, type);

      localStorage.setItem("access_token", res.data.access_token);

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

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
