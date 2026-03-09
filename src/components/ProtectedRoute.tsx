import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useOnboardingStatus } from "@/hooks/useOnboarding";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<"admin" | "estabelecimento" | "profissional">;
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { session, profile, loading, userRoles, activeRole } = useAuth();
  const { onboardingCompleto, loading: onboardingLoading } = useOnboardingStatus();

  if (loading || onboardingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth?mode=login" replace />;
  }

  if (profile?.is_blocked) {
    return <Navigate to="/auth?mode=login&blocked=true" replace />;
  }

  // If user has multiple roles and hasn't picked one yet, redirect to picker
  if (userRoles.length > 1 && !activeRole && !window.location.pathname.startsWith("/escolher-perfil")) {
    return <Navigate to="/escolher-perfil" replace />;
  }

  const effectiveRole = activeRole || profile?.role;

  if (allowedRoles && effectiveRole && !allowedRoles.includes(effectiveRole)) {
    const roleRoutes: Record<string, string> = {
      admin: "/admin",
      estabelecimento: "/app/estabelecimento",
      profissional: "/app/profissional",
    };
    return <Navigate to={roleRoutes[effectiveRole] || "/"} replace />;
  }

  // Redirect to onboarding if not complete (except for onboarding routes)
  if (effectiveRole && effectiveRole !== "admin" && onboardingCompleto === false) {
    const onboardingRoute = `/onboarding/${effectiveRole}`;
    if (!window.location.pathname.startsWith("/onboarding")) {
      return <Navigate to={onboardingRoute} replace />;
    }
  }

  return <>{children}</>;
};
