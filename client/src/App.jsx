// App.jsx
import React from "react";
import { ToastProvider } from "@/components/ui/Toast";
import { Toaster as Sonner } from "@/components/ui/Sonner";
import { TooltipProvider } from "@/components/ui/Tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider, useAuth } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import WeddingVenues from "./pages/services/WeddingVenues";
import DJs from "./pages/services/DJs";
import EventManagement from "./pages/services/EventManagement";
import Catering from "./pages/services/Catering";
import Photography from "./pages/services/Photography";
import ImageTest from "./pages/ImageTest";
import MyBookings from "./pages/MyBookings";

// dashboards
import VendorDashboard from "./pages/dashboards/VendorDashboard";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import CustomerDashboard from "./pages/dashboards/CustomerDashboard";
import VendorPage from "./pages/Vendor/VendorPage";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";

const queryClient = new QueryClient();

// 🔑 Role-based router wrapper
function RoleBasedRoutes() {
  const { user, isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Root route: Redirect based on user role or show Index for unauthenticated users */}
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

      {/* Dashboard routes */}
      <Route
        path="/vendor/*"
        element={
          isAuthenticated && user?.type === "vendor" ? (
            <VendorPage />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          isAuthenticated && user?.type === "admin" ? (
            <AdminDashboard />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
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

      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/services/wedding-venues" element={<WeddingVenues />} />
      <Route path="/services/djs" element={<DJs />} />
      <Route path="/services/event-management" element={<EventManagement />} />
      <Route path="/services/catering" element={<Catering />} />
      <Route path="/services/photography" element={<Photography />} />
      <Route path="/image-test" element={<ImageTest />} />
      <Route path="/my-bookings" element={<MyBookings />} />
      <Route path="/wishlist" element={<Wishlist/>}/>
      <Route path="/cart" element={<Cart/>}/>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <TooltipProvider>
              <ToastProvider />
              <Sonner />
              <BrowserRouter>
                <RoleBasedRoutes />
              </BrowserRouter>
            </TooltipProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
