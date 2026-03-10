import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Building2, User, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

export const AdminViewAs = () => {
  const { setActiveRole, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleViewAs = async (role: "profissional" | "estabelecimento") => {
    // Log the action
    if (user) {
      await supabase.from("admin_logs").insert({
        admin_id: user.id,
        acao: `Visualizar como ${role}`,
        detalhes: { role, timestamp: new Date().toISOString() },
      });
    }

    setActiveRole(role);
    const routes = {
      profissional: "/app/profissional",
      estabelecimento: "/app/estabelecimento",
    };
    toast({
      title: `Modo: ${role === "profissional" ? "Profissional" : "Estabelecimento"}`,
      description: "Você está visualizando como esse tipo de usuário.",
    });
    navigate(routes[role]);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Eye className="w-4 h-4" />
          <span className="hidden sm:inline">Visualizar como</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleViewAs("profissional")}>
          <User className="w-4 h-4 mr-2" />
          Profissional
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleViewAs("estabelecimento")}>
          <Building2 className="w-4 h-4 mr-2" />
          Estabelecimento
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
