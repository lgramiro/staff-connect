import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

// App routes
import EstabelecimentoDashboard from "./pages/app/estabelecimento/Dashboard";
import ProfissionalDashboard from "./pages/app/profissional/Dashboard";
import AdminDashboard from "./pages/admin/Dashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Estabelecimento Routes */}
            <Route path="/app/estabelecimento" element={
              <ProtectedRoute allowedRoles={["estabelecimento"]}>
                <EstabelecimentoDashboard />
              </ProtectedRoute>
            } />
            <Route path="/app/estabelecimento/*" element={
              <ProtectedRoute allowedRoles={["estabelecimento"]}>
                <EstabelecimentoDashboard />
              </ProtectedRoute>
            } />
            
            {/* Profissional Routes */}
            <Route path="/app/profissional" element={
              <ProtectedRoute allowedRoles={["profissional"]}>
                <ProfissionalDashboard />
              </ProtectedRoute>
            } />
            <Route path="/app/profissional/*" element={
              <ProtectedRoute allowedRoles={["profissional"]}>
                <ProfissionalDashboard />
              </ProtectedRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/*" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
