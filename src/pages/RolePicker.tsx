import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Building2, ChefHat, User, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

type AppRole = "admin" | "estabelecimento" | "profissional";

const roleConfig: Record<AppRole, { icon: typeof Building2; label: string; description: string; route: string; color: string; iconBg: string }> = {
  admin: {
    icon: Shield,
    label: "Administrador",
    description: "Painel administrativo completo",
    route: "/admin",
    color: "text-purple-600",
    iconBg: "bg-purple-100",
  },
  estabelecimento: {
    icon: Building2,
    label: "Estabelecimento",
    description: "Gerencie sua equipe e escalas",
    route: "/app/estabelecimento",
    color: "text-orange-600",
    iconBg: "bg-orange-100",
  },
  profissional: {
    icon: User,
    label: "Profissional",
    description: "Encontre oportunidades de trabalho",
    route: "/app/profissional",
    color: "text-green-600",
    iconBg: "bg-green-100",
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
            Como deseja entrar hoje?
          </h2>
          <p className="text-muted-foreground">
            Olá, {profile?.nome || "usuário"}. Selecione um perfil para continuar.
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
                className="w-full p-6 rounded-xl border-2 border-border bg-card hover:border-primary/50 hover:shadow-md transition-all flex items-center gap-4 text-left group"
              >
                <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors", config.iconBg)}>
                  <Icon className={cn("w-7 h-7", config.color)} />
                </div>
                <div className="flex-1">
                  <p className="font-display font-bold text-lg text-foreground group-hover:text-primary transition-colors">{config.label}</p>
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