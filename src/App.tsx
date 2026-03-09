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
import RolePicker from "./pages/RolePicker";
import NotFound from "./pages/NotFound";

// Onboarding
import ProfissionalOnboarding from "./pages/onboarding/ProfissionalOnboarding";
import EstabelecimentoOnboarding from "./pages/onboarding/EstabelecimentoOnboarding";

// Estabelecimento routes
import EstabelecimentoDashboard from "./pages/app/estabelecimento/Dashboard";
import CriarEscala from "./pages/app/estabelecimento/CriarEscala";
import VagaUrgente from "./pages/app/estabelecimento/VagaUrgente";
import EstabelecimentoCandidaturas from "./pages/app/estabelecimento/Candidaturas";
import Hoje from "./pages/app/estabelecimento/Hoje";
import Avaliar from "./pages/app/estabelecimento/Avaliar";

// Profissional routes
import ProfissionalDashboard from "./pages/app/profissional/Dashboard";
import Oportunidades from "./pages/app/profissional/Oportunidades";
import MinhasCandidaturas from "./pages/app/profissional/MinhasCandidaturas";
import MeuPerfil from "./pages/app/profissional/MeuPerfil";

// Admin routes
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsuarios from "./pages/admin/Usuarios";
import AdminSlots from "./pages/admin/Slots";
import AdminSettings from "./pages/admin/Settings";
import AdminPlanos from "./pages/admin/Planos";

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
            <Route path="/escolher-perfil" element={
              <ProtectedRoute><RolePicker /></ProtectedRoute>
            } />

            {/* Onboarding */}
            <Route path="/onboarding/profissional" element={
              <ProtectedRoute allowedRoles={["profissional"]}><ProfissionalOnboarding /></ProtectedRoute>
            } />
            <Route path="/onboarding/estabelecimento" element={
              <ProtectedRoute allowedRoles={["estabelecimento"]}><EstabelecimentoOnboarding /></ProtectedRoute>
            } />

            {/* Estabelecimento Routes */}
            <Route path="/app/estabelecimento" element={<ProtectedRoute allowedRoles={["estabelecimento"]}><EstabelecimentoDashboard /></ProtectedRoute>} />
            <Route path="/app/estabelecimento/criar-escala" element={<ProtectedRoute allowedRoles={["estabelecimento"]}><CriarEscala /></ProtectedRoute>} />
            <Route path="/app/estabelecimento/vaga-urgente" element={<ProtectedRoute allowedRoles={["estabelecimento"]}><VagaUrgente /></ProtectedRoute>} />
            <Route path="/app/estabelecimento/candidaturas" element={<ProtectedRoute allowedRoles={["estabelecimento"]}><EstabelecimentoCandidaturas /></ProtectedRoute>} />
            <Route path="/app/estabelecimento/hoje" element={<ProtectedRoute allowedRoles={["estabelecimento"]}><Hoje /></ProtectedRoute>} />
            <Route path="/app/estabelecimento/avaliar" element={<ProtectedRoute allowedRoles={["estabelecimento"]}><Avaliar /></ProtectedRoute>} />

            {/* Profissional Routes */}
            <Route path="/app/profissional" element={<ProtectedRoute allowedRoles={["profissional"]}><ProfissionalDashboard /></ProtectedRoute>} />
            <Route path="/app/profissional/oportunidades" element={<ProtectedRoute allowedRoles={["profissional"]}><Oportunidades /></ProtectedRoute>} />
            <Route path="/app/profissional/candidaturas" element={<ProtectedRoute allowedRoles={["profissional"]}><MinhasCandidaturas /></ProtectedRoute>} />
            <Route path="/app/profissional/perfil" element={<ProtectedRoute allowedRoles={["profissional"]}><MeuPerfil /></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/usuarios" element={<ProtectedRoute allowedRoles={["admin"]}><AdminUsuarios /></ProtectedRoute>} />
            <Route path="/admin/slots" element={<ProtectedRoute allowedRoles={["admin"]}><AdminSlots /></ProtectedRoute>} />
            <Route path="/admin/planos" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPlanos /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={["admin"]}><AdminSettings /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
