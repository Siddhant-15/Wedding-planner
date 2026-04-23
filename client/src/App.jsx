// App.jsx
import React from "react";
import { ToastProvider } from "@/components/ui/Toast";
import { Toaster as Sonner } from "@/components/ui/Sonner";
import { TooltipProvider } from "@/components/ui/Tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider, useAuth } from "@/context/AuthContext";
import { WishlistProvider } from "@/context/WishlistContext";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";

import WeddingVenues from "./Customer/src/pages/customer/WeddingVenues";
import DJs from "./Customer/src/pages/customer/DJs";
import EventManagement from "./Customer/src/pages/customer/EventManagement";
import Catering from "./Customer/src/pages/customer/Catering";
import Photography from "./Customer/src/pages/customer/Photography";
import MakeupArtist from "./Customer/src/pages/customer/MakeupArtist";

import ServiceDetail from "./Customer/src/pages/customer/ServiceDetail";

import CustomerDashboard from "./pages/dashboards/CustomerDashboard";
import VendorDashboard from "./pages/dashboards/VendorDashboard";
import VendorPage from "./Vendor/src/pages/VendorPage";

// 🔐 Protected pages
import MyAccount from "./Profile/MyAccount"
import Payments from "./Profile/Payments";
import MyBookings from "./Profile/MyBookings";
import ProfileSettings from "./Profile/ProfileSettings";

import Lottie from "lottie-react";
import loadingAnimation from "@/assets/animations/loading.json";

const queryClient = new QueryClient();


// 🔒 Protected Route Wrapper
function ProtectedRoute({ children, isAuthenticated, user, allowedRoles }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.type)) {
    return <Navigate to="/" replace />;
  }

  return children;
}


// 🔑 Role-based router wrapper
function RoleBasedRoutes() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          width: "100vw",
          backgroundColor: "#ffffff",
          flexDirection: "column",
        }}
      >
        <Lottie
          animationData={loadingAnimation}
          loop
          autoplay
          style={{ width: 200, height: 200 }}
        />
        <p
          style={{
            marginTop: 16,
            fontSize: 16,
            color: "#555555",
            fontFamily: "Arial, sans-serif",
          }}
        >
          Loading, please wait...
        </p>
      </div>
    );
  }

  return (
    <Routes>
      {/* Root route */}
      <Route
        path="/"
        element={
          isAuthenticated && user ? (
            <Navigate
              to={
                user.type === "vendor"
                  ? "/vendor/dashboard"
                  : user.type === "admin"
                    ? "/admin/dashboard"
                    : "/customer/dashboard"
              }
              replace
            />
          ) : (
            <Index />
          )
        }
      />

      {/* Customer dashboard */}
      <Route
        path="/customer/dashboard"
        element={
          isAuthenticated && user?.type === "customer" ? (
            <CustomerDashboard />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />


      {/* Vendor dashboard */}
      <Route
        path="/vendor/dashboard"
        element={
          <ProtectedRoute
            isAuthenticated={isAuthenticated}
            user={user}
            allowedRoles={["vendor"]}
          >
            <VendorPage />
          </ProtectedRoute>
        }
      />

      {/* 🔒 Protected Routes */}
      <Route
        path="/my-account"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated} user={user}>
            <MyAccount />
          </ProtectedRoute>
        }
      />

      <Route
        path="/payment"
        element={
          <ProtectedRoute
            isAuthenticated={isAuthenticated}
            user={user}
            allowedRoles={["customer"]}
          >
            <Payments />
          </ProtectedRoute>
        }
      />

      <Route
        path="/booking"
        element={
          <ProtectedRoute
            isAuthenticated={isAuthenticated}
            user={user}
            allowedRoles={["customer"]}
          >
            <MyBookings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile-settings"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated} user={user}>
            <ProfileSettings />
          </ProtectedRoute>
        }
      />

      {/* 🌐 Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/services/venue" element={<WeddingVenues />} />
      <Route path="/services/dj" element={<DJs />} />
      <Route path="/services/event_management" element={<EventManagement />} />
      <Route path="/services/catering" element={<Catering />} />
      <Route path="/services/photography" element={<Photography />} />
      <Route path="/services/makeup_artist" element={<MakeupArtist />} />

      {/* 🔥 Dynamic Service Route */}
      <Route path="/services/:serviceType/:id" element={<ServiceDetail />} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}


function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WishlistProvider>
          <TooltipProvider>
            <ToastProvider />
            <Sonner />
            <BrowserRouter>
              <RoleBasedRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </WishlistProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;