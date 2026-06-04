import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Building2, User, Shield, ArrowLeftRight, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type AppRole = "admin" | "estabelecimento" | "profissional";

const roleLabels: Record<AppRole, { icon: typeof Building2; label: string; route: string }> = {
  profissional: { icon: User, label: "Profissional", route: "/app/profissional" },
  estabelecimento: { icon: Building2, label: "Estabelecimento", route: "/app/estabelecimento" },
  admin: { icon: Shield, label: "Admin", route: "/admin" },
};

export const RoleSwitcher = () => {
  const { userRoles, activeRole, setActiveRole } = useAuth();
  const navigate = useNavigate();

  if (userRoles.length < 1) return null;

  const handleSwitch = (role: AppRole) => {
    setActiveRole(role);
    navigate(roleLabels[role].route);
  };

  const currentConfig = activeRole ? roleLabels[activeRole] : null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeftRight className="w-4 h-4" />
          <span className="hidden sm:inline">{currentConfig?.label || "Trocar perfil"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {userRoles.map((role) => {
          const config = roleLabels[role];
          if (!config) return null;
          const Icon = config.icon;
          return (
            <DropdownMenuItem
              key={role}
              onClick={() => handleSwitch(role)}
              className={role === activeRole ? "bg-primary/10" : ""}
            >
              <Icon className="w-4 h-4 mr-2" />
              {config.label}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/meus-perfis")}>
          <UserCog className="w-4 h-4 mr-2" />
          Meus Perfis
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
