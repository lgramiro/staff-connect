import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "./LoadingSpinner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<"admin" | "estabelecimento" | "profissional">;
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { session, profile, loading, activeRole, userRoles, user } = useAuth();
  const location = useLocation();
  const { data: profData, isLoading: trainingLoading } = useQuery({
    queryKey: ["profissional-training-check", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("profissionais")
        .select("treinamento_concluido")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: activeRole === "profissional" && !!user?.id && !location.pathname.includes("/app/profissional/treinamentos"),
    staleTime: 1000 * 60 * 5,
  });

  const treinamentoConcluido = profData?.treinamento_concluido ?? null;

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
    
    return <Navigate to="/app/profissional/treinamentos" replace />;
  }

  return <>{children}</>;
};
