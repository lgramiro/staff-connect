import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<"admin" | "estabelecimento" | "profissional">;
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { session, profile, loading, activeRole } = useAuth();

  if (loading) {
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

  const effectiveRole = activeRole || profile?.role;

  if (allowedRoles && effectiveRole && !allowedRoles.includes(effectiveRole)) {
    const roleRoutes: Record<string, string> = {
      admin: "/admin",
      estabelecimento: "/app/estabelecimento",
      profissional: "/app/profissional",
    };
    return <Navigate to={roleRoutes[effectiveRole] || "/"} replace />;
  }

  return <>{children}</>;
};
