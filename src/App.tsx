import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
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
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          
          {/* Estabelecimento Routes */}
          <Route path="/app/estabelecimento" element={<EstabelecimentoDashboard />} />
          <Route path="/app/estabelecimento/*" element={<EstabelecimentoDashboard />} />
          
          {/* Profissional Routes */}
          <Route path="/app/profissional" element={<ProfissionalDashboard />} />
          <Route path="/app/profissional/*" element={<ProfissionalDashboard />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
