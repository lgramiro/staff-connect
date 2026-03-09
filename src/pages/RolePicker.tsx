import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Building2, ChefHat, User, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

type AppRole = "admin" | "estabelecimento" | "profissional";

const roleConfig: Record<AppRole, { icon: typeof Building2; label: string; description: string; route: string }> = {
  profissional: {
    icon: User,
    label: "Profissional",
    description: "Buscar oportunidades de trabalho freelancer",
    route: "/app/profissional",
  },
  estabelecimento: {
    icon: Building2,
    label: "Estabelecimento",
    description: "Gerenciar escalas e contratar profissionais",
    route: "/app/estabelecimento",
  },
  admin: {
    icon: Shield,
    label: "Administrador",
    description: "Gerenciar a plataforma Tem Staff",
    route: "/admin",
  },
};

const RolePicker = () => {
  const navigate = useNavigate();
  const { userRoles, setActiveRole, profile } = useAuth();

  const handleSelect = (role: AppRole) => {
    setActiveRole(role);
    navigate(roleConfig[role].route);
  };

  return (
    <div className="min-h-screen bg-gradient-warm flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex items-center justify-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-hero flex items-center justify-center shadow-glow">
            <ChefHat className="w-7 h-7 text-primary-foreground" />
          </div>
          <span className="font-display text-2xl font-bold text-foreground">Tem Staff</span>
        </div>

        <div className="text-center space-y-2">
          <h2 className="font-display text-2xl font-bold text-foreground">
            Olá, {profile?.nome || "usuário"}!
          </h2>
          <p className="text-muted-foreground">
            Escolha como deseja entrar
          </p>
        </div>

        <div className="space-y-4">
          {userRoles.map((role) => {
            const config = roleConfig[role];
            if (!config) return null;
            const Icon = config.icon;
            return (
              <button
                key={role}
                onClick={() => handleSelect(role)}
                className="w-full p-6 rounded-xl border-2 border-border bg-card hover:border-primary/50 hover:shadow-md transition-all flex items-center gap-4 text-left"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <p className="font-display font-bold text-lg text-foreground">{config.label}</p>
                  <p className="text-sm text-muted-foreground">{config.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RolePicker;
