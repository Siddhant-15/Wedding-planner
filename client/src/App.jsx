import React from "react";
import { ToastProvider } from "@/components/ui/Toast";
import { Toaster as Sonner } from "@/components/ui/Sonner";
import { TooltipProvider } from "@/components/ui/Tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider, useAuth } from "@/context/AuthContext";

// ✅ Admin imports
import { AdminAuthProvider } from "./Admin/src/context/AdminAuthContext";
import ProtectedAdminRoute from "./Admin/src/components/admin/layout/ProtectedAdminRoute";
import AdminLayout from "./Admin/src/components/admin/layout/AdminLayout";
import AdminLogin from "./Admin/src/pages/admin/AdminLogin";
import Dashboard from "./Admin/src/pages/admin/Dashboard";
import Vendors from "./Admin/src/pages/admin/Vendors";
import Services from "./Admin/src/pages/admin/Services";
import Bookings from "./Admin/src/pages/admin/Bookings";
import Reviews from "./Admin/src/pages/admin/Reviews";
import Reports from "./Admin/src/pages/admin/Reports";
import Featured from "./Admin/src/pages/admin/Featured";
import Analytics from "./Admin/src/pages/admin/Analytics";
import Settings from "./Admin/src/pages/admin/Settings";

// Customer & others
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

import HomeDashboard from "./Customer/src/pages/customer-homepage/src/pages/customer/HomePage";
import VendorPage from "./Vendor/src/pages/VendorPage";
import CustomerLayout from "./Customer/src/Layout/CustomerLayout";
import VendorLayout from "./Vendor/src/Layout/VendorLayout";
import WishlistsPage from "./Wishlist/src/pages/customer/wishlist/WishlistsPage";
import WishlistDetailPage from "./Wishlist/src/pages/customer/wishlist/WishlistDetailPage";

// Protected pages
import MyAccount from "./Profile/MyAccount";
import Payments from "./Profile/Payments";
import MyBookings from "./Profile/MyBookings";
import ProfileSettings from "./Profile/ProfileSettings";
import Notification from "./notifications-navbar/src/pages/Notifications";
import VendorLeads from "./Vendor/src/pages/VendorLeads";
import VendorAvailability from "./wedding-platform/src/pages/vendor/VendorAvailability";

import Lottie from "lottie-react";
import loadingAnimation from "@/assets/animations/loading.json";
import ViewRequest from "./Customer/src/pages/customer/ViewRequest/ViewRequest";
import VendorOnboarding from "./Vendor/src/components/vendor/VendorOnboarding";

const queryClient = new QueryClient();


// 🔒 Protected Route Wrapper
function ProtectedRoute({ children, isAuthenticated, user, allowedRoles }) {
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user?.type)) {
    return <Navigate to="/" replace />;
  }

  return children;
}


// 🔑 Role-based router
function RoleBasedRoutes() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", height: "100vh", alignItems: "center", flexDirection: "column" }}>
        <Lottie animationData={loadingAnimation} loop autoplay style={{ width: 200 }} />
        <p>Loading, please wait...</p>
      </div>
    );
  }

  return (
    <Routes>

      {/* ✅ Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />

      <Route
        path="/admin/*"
        element={
          <ProtectedAdminRoute>
            <AdminLayout />
          </ProtectedAdminRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="vendors" element={<Vendors />} />
        <Route path="services" element={<Services />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="reports" element={<Reports />} />
        <Route path="featured" element={<Featured />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Root */}
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

      {/* ===================== */}
      {/* ✅ CUSTOMER ROUTES */}
      {/* ===================== */}
      <Route
        path="/customer"
        element={
          isAuthenticated && user?.type === "customer" ? (
            <CustomerLayout />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        <Route path="dashboard" element={<HomeDashboard />} />
        <Route path="profile" element={<MyAccount />} />
        <Route path="request" element={<ViewRequest />} />
        <Route path="booking" element={<MyBookings />} />
        <Route path="payment" element={<Payments />} />
        <Route path="wishlist" element={<WishlistsPage />} />
        <Route path="wishlist/:id" element={<WishlistDetailPage />} />
        <Route path="services/venue" element={<WeddingVenues />} />
        <Route path="services/dj" element={<DJs />} />
        <Route path="services/event_management" element={<EventManagement />} />
        <Route path="services/catering" element={<Catering />} />
        <Route path="services/photography" element={<Photography />} />
        <Route path="services/makeup_artist" element={<MakeupArtist />} />
        <Route path="services/:serviceType/:id" element={<ServiceDetail />} />
        <Route path="notifications" element={<Notification />} />
      </Route>

      {/* Vendor */}
      <Route
        path="/vendor/onboarding"
        element={
          <ProtectedRoute
            isAuthenticated={isAuthenticated}
            user={user}
            allowedRoles={["vendor"]}
          >
            <VendorOnboarding />
          </ProtectedRoute>
        }
      />
      <Route
        element={
          <ProtectedRoute
            isAuthenticated={isAuthenticated}
            user={user}
            allowedRoles={["vendor"]}
          >
            <VendorLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/vendor/dashboard" element={<VendorPage />} />
        <Route path="/vendor/notifications" element={<Notification />} />
        <Route path="/vendor/leads" element={<VendorLeads />} />
        <Route path="/vendor/availability" element={<VendorAvailability />} />
      </Route>

      {/* Other Protected */}
      {/* <Route path="/my-account" element={<ProtectedRoute isAuthenticated={isAuthenticated} user={user}><MyAccount /></ProtectedRoute>} /> */}

      <Route path="/profile-settings" element={
        <ProtectedRoute isAuthenticated={isAuthenticated} user={user}>
          <ProfileSettings />
        </ProtectedRoute>
      } />

      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* <Route path="/services/venue" element={<WeddingVenues />} />
      <Route path="/services/dj" element={<DJs />} />
      <Route path="/services/event_management" element={<EventManagement />} />
      <Route path="/services/catering" element={<Catering />} />
      <Route path="/services/photography" element={<Photography />} />
      <Route path="/services/makeup_artist" element={<MakeupArtist />} />

      <Route path="/services/:serviceType/:id" element={<ServiceDetail />} /> */}

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}


function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AdminAuthProvider>
          <TooltipProvider>
            <ToastProvider />
            <Sonner />
            <BrowserRouter>
              <RoleBasedRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </AdminAuthProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;