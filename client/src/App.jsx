import React from "react";
import { ToastProvider } from "@/components/ui/Toast";
import { Toaster as Sonner } from "@/components/ui/Sonner";
import { TooltipProvider } from "@/components/ui/Tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext"
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import WeddingVenues from "./pages/services/WeddingVenues";
import DJs from "./pages/services/DJs";
import EventManagement from "./pages/services/EventManagement";
import Catering from "./pages/services/Catering";
import Photography from "./pages/services/Photography";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
      <TooltipProvider>
        <ToastProvider />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/services/wedding-venues" element={<WeddingVenues />} />
            <Route path="/services/djs" element={<DJs />} />
            <Route path="/services/event-management" element={<EventManagement />} />
            <Route path="/services/catering" element={<Catering />} />
            <Route path="/services/photography" element={<Photography />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
