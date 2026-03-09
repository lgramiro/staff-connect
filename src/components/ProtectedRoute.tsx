import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useOnboardingStatus } from "@/hooks/useOnboarding";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<"admin" | "estabelecimento" | "profissional">;
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { session, profile, loading } = useAuth();
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

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    const roleRoutes: Record<string, string> = {
      admin: "/admin",
      estabelecimento: "/app/estabelecimento",
      profissional: "/app/profissional",
    };
    return <Navigate to={roleRoutes[profile.role] || "/"} replace />;
  }

  // Redirect to onboarding if not complete (except for onboarding routes)
  if (profile && profile.role !== "admin" && onboardingCompleto === false) {
    const onboardingRoute = `/onboarding/${profile.role}`;
    if (!window.location.pathname.startsWith("/onboarding")) {
      return <Navigate to={onboardingRoute} replace />;
    }
  }

  return <>{children}</>;
};
