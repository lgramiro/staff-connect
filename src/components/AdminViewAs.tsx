import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Building2, User, Eye, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface TargetUser {
  id: string;
  nome: string;
}

export const AdminViewAs = () => {
  const { setActiveRole, user, activeRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<TargetUser[]>([]);
  const [search, setSearch] = useState("");
  const [viewingAs, setViewingAs] = useState<{ nome: string; role: string } | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, nome")
        .ilike("nome", `%${search}%`)
        .limit(5);
      
      if (data) setUsers(data as TargetUser[]);
    };

    if (search.length > 2) {
      fetchUsers();
    }
  }, [search]);

  const handleViewAs = async (targetUser: TargetUser, role: "profissional" | "estabelecimento") => {
    if (user) {
      await supabase.from("admin_logs").insert({
        admin_id: user.id,
        acao: "admin_view_as",
        detalhes: { target_user_id: targetUser.id, target_role: role },
      });
    }

    setViewingAs({ nome: targetUser.nome, role });
    setActiveRole(role as any);
    
    const routes = {
      profissional: "/app/profissional",
      estabelecimento: "/app/estabelecimento",
    };
    
    toast({
      title: `Visualizando como ${targetUser.nome}`,
      description: `Modo: ${role === "profissional" ? "Profissional" : "Estabelecimento"}`,
    });
    
    navigate(routes[role]);
  };

  const handleExit = () => {
    setViewingAs(null);
    setActiveRole("admin");
    navigate("/admin");
    toast({
      title: "Modo Administrador",
      description: "Você voltou para o seu perfil original.",
    });
  };

  return (
    <>
      {viewingAs && (
        <div className="fixed top-0 left-0 w-full bg-yellow-400 text-yellow-900 py-2 px-4 flex items-center justify-center gap-4 z-[9999] font-medium shadow-md">
          <span>Visualizando como <strong>{viewingAs.nome}</strong> ({viewingAs.role})</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleExit}
            className="h-7 px-2 hover:bg-yellow-500 text-yellow-900 border border-yellow-600/20"
          >
            Sair da visualização
            <X className="w-3 h-3 ml-1" />
          </Button>
        </div>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">Visualizar como</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <div className="p-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Buscar usuário..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
          </div>
          <DropdownMenuSeparator />
          {users.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted-foreground">
              {search.length > 2 ? "Nenhum usuário encontrado" : "Digite 3 letras para buscar"}
            </div>
          ) : (
            users.map((u) => (
              <div key={u.id} className="p-1">
                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {u.nome}
                </div>
                <DropdownMenuItem onClick={() => handleViewAs(u, "profissional")}>
                  <User className="w-4 h-4 mr-2" />
                  Como Profissional
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleViewAs(u, "estabelecimento")}>
                  <Building2 className="w-4 h-4 mr-2" />
                  Como Estabelecimento
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </div>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};