import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "./LoadingSpinner";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<"admin" | "estabelecimento" | "profissional">;
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { session, profile, loading, activeRole, userRoles, user } = useAuth();
  const location = useLocation();
  const [trainingLoading, setTrainingLoading] = useState(false);
  const [treinamentoConcluido, setTreinamentoConcluido] = useState<boolean | null>(null);

  useEffect(() => {
    const checkTraining = async () => {
      if (activeRole === "profissional" && user?.id && !location.pathname.includes("/app/profissional/treinamentos")) {
        setTrainingLoading(true);
        const { data, error } = await supabase
          .from("profissionais")
          .select("treinamento_concluido")
          .eq("user_id", user.id)
          .maybeSingle();
        
        if (data) {
          setTreinamentoConcluido(data.treinamento_concluido);
        }
        setTrainingLoading(false);
      }
    };

    checkTraining();
  }, [activeRole, user?.id, location.pathname]);

  if (loading || trainingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" text="Verificando acesso..." />
      </div>
    );
  }

  if (!session) {
    // Save the attempted location to redirect back after login
    return <Navigate to={`/auth?mode=login&redirect=${location.pathname}`} replace />;
  }

  if (profile?.is_blocked) {
    return <Navigate to="/auth?mode=login&blocked=true" replace />;
  }

  // If roles are specified, check if user has permission
  if (allowedRoles) {
    const hasPermission = activeRole && allowedRoles.includes(activeRole);
    const hasOneOfAllowedRoles = userRoles.some((r) => allowedRoles.includes(r));

    if (!hasPermission && !hasOneOfAllowedRoles) {
      // Redirect to their dashboard or profile picker
      if (activeRole) {
        const roleRoutes: Record<string, string> = {
          admin: "/admin",
          estabelecimento: "/app/estabelecimento",
          profissional: "/app/profissional",
        };
        return <Navigate to={roleRoutes[activeRole]} replace />;
      }
      return <Navigate to="/escolher-perfil" replace />;
    }
  }

  if (activeRole === "profissional" && 
      treinamentoConcluido === false && 
      location.pathname.startsWith("/app/profissional") && 
      !location.pathname.includes("/app/profissional/treinamentos")) {
    toast.info("Complete o treinamento obrigatório para acessar a plataforma");
    return <Navigate to="/app/profissional/treinamentos" replace />;
  }

  return <>{children}</>;
};
