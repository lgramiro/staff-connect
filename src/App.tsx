import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import ErrorBoundary from "@/components/ErrorBoundary";

// Lazy loading components for better performance
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const RolePicker = lazy(() => import("./pages/RolePicker"));
const MeusPerfis = lazy(() => import("./pages/MeusPerfis"));
const NotFound = lazy(() => import("./pages/NotFound"));
const SeedTeste = lazy(() => import("./pages/SeedTeste"));

// Onboarding
const ProfissionalOnboarding = lazy(() => import("./pages/onboarding/ProfissionalOnboarding"));
const EstabelecimentoOnboarding = lazy(() => import("./pages/onboarding/EstabelecimentoOnboarding"));

// Estabelecimento routes
const EstabelecimentoDashboard = lazy(() => import("./pages/app/estabelecimento/Dashboard"));
const CriarEscala = lazy(() => import("./pages/app/estabelecimento/CriarEscala"));
const VagaUrgente = lazy(() => import("./pages/app/estabelecimento/VagaUrgente"));
const EstabelecimentoCandidaturas = lazy(() => import("./pages/app/estabelecimento/Candidaturas"));
const Hoje = lazy(() => import("./pages/app/estabelecimento/Hoje"));
const Avaliar = lazy(() => import("./pages/app/estabelecimento/Avaliar"));
const PlanosComparar = lazy(() => import("./pages/app/estabelecimento/PlanosComparar"));

// Profissional routes
const ProfissionalDashboard = lazy(() => import("./pages/app/profissional/Dashboard"));
const Oportunidades = lazy(() => import("./pages/app/profissional/Oportunidades"));
const MinhasCandidaturas = lazy(() => import("./pages/app/profissional/MinhasCandidaturas"));
const MeuPerfil = lazy(() => import("./pages/app/profissional/MeuPerfil"));
const ProfissionalAvaliacoes = lazy(() => import("./pages/app/profissional/Avaliacoes"));

// Admin routes
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminUsuarios = lazy(() => import("./pages/admin/Usuarios"));
const AdminProfissionais = lazy(() => import("./pages/admin/Profissionais"));
const AdminEstabelecimentos = lazy(() => import("./pages/admin/Estabelecimentos"));
const AdminSlots = lazy(() => import("./pages/admin/Slots"));
const AdminCandidaturas = lazy(() => import("./pages/admin/Candidaturas"));
const AdminAvaliacoes = lazy(() => import("./pages/admin/Avaliacoes"));
const AdminSettings = lazy(() => import("./pages/admin/Settings"));
const AdminPlanos = lazy(() => import("./pages/admin/Planos"));
const AdminAssinaturas = lazy(() => import("./pages/admin/Assinaturas"));
const AdminLogs = lazy(() => import("./pages/admin/AdminLogs"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      gcTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
              <LoadingSpinner size="lg" text="Carregando..." />
            </div>
          }>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/seed-teste" element={<SeedTeste />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/escolher-perfil" element={
                <ProtectedRoute><RolePicker /></ProtectedRoute>
              } />
              <Route path="/meus-perfis" element={
                <ProtectedRoute><MeusPerfis /></ProtectedRoute>
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
              <Route path="/app/estabelecimento/planos" element={<ProtectedRoute allowedRoles={["estabelecimento"]}><PlanosComparar /></ProtectedRoute>} />

              {/* Profissional Routes */}
              <Route path="/app/profissional" element={<ProtectedRoute allowedRoles={["profissional"]}><ProfissionalDashboard /></ProtectedRoute>} />
              <Route path="/app/profissional/oportunidades" element={<ProtectedRoute allowedRoles={["profissional"]}><Oportunidades /></ProtectedRoute>} />
              <Route path="/app/profissional/candidaturas" element={<ProtectedRoute allowedRoles={["profissional"]}><MinhasCandidaturas /></ProtectedRoute>} />
              <Route path="/app/profissional/perfil" element={<ProtectedRoute allowedRoles={["profissional"]}><MeuPerfil /></ProtectedRoute>} />
              <Route path="/app/profissional/avaliacoes" element={<ProtectedRoute allowedRoles={["profissional"]}><ProfissionalAvaliacoes /></ProtectedRoute>} />

              {/* Admin Routes */}
              <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/usuarios" element={<ProtectedRoute allowedRoles={["admin"]}><AdminUsuarios /></ProtectedRoute>} />
              <Route path="/admin/profissionais" element={<ProtectedRoute allowedRoles={["admin"]}><AdminProfissionais /></ProtectedRoute>} />
              <Route path="/admin/estabelecimentos" element={<ProtectedRoute allowedRoles={["admin"]}><AdminEstabelecimentos /></ProtectedRoute>} />
              <Route path="/admin/slots" element={<ProtectedRoute allowedRoles={["admin"]}><AdminSlots /></ProtectedRoute>} />
              <Route path="/admin/candidaturas" element={<ProtectedRoute allowedRoles={["admin"]}><AdminCandidaturas /></ProtectedRoute>} />
              <Route path="/admin/avaliacoes" element={<ProtectedRoute allowedRoles={["admin"]}><AdminAvaliacoes /></ProtectedRoute>} />
              <Route path="/admin/planos" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPlanos /></ProtectedRoute>} />
              <Route path="/admin/assinaturas" element={<ProtectedRoute allowedRoles={["admin"]}><AdminAssinaturas /></ProtectedRoute>} />
              <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={["admin"]}><AdminSettings /></ProtectedRoute>} />
              <Route path="/admin/logs" element={<ProtectedRoute allowedRoles={["admin"]}><AdminLogs /></ProtectedRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <Toaster />
          <Sonner />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
