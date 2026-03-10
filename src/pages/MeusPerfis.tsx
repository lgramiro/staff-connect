import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Building2, User, Shield, ChefHat, ArrowLeft, Plus, CheckCircle2 } from "lucide-react";

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

const allRoles: AppRole[] = ["profissional", "estabelecimento"];

const MeusPerfis = () => {
  const { userRoles, activeRole, setActiveRole, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activating, setActivating] = useState<AppRole | null>(null);

  const handleSwitch = (role: AppRole) => {
    setActiveRole(role);
    navigate(roleConfig[role].route);
  };

  const handleActivateRole = async (role: AppRole) => {
    if (!user) return;
    setActivating(role);
    try {
      // Insert into user_roles
      const { error } = await supabase.from("user_roles").insert({ user_id: user.id, role });
      if (error) {
        if (error.code === "23505") {
          toast({ title: "Perfil já ativo", description: `Você já possui o perfil de ${roleConfig[role].label}.` });
        } else {
          throw error;
        }
      } else {
        // If establishing a new estabelecimento role, create the estabelecimentos record
        if (role === "estabelecimento") {
          await supabase.from("estabelecimentos").insert({ user_id: user.id }).select().maybeSingle();
        }
        if (role === "profissional") {
          await supabase.from("profissionais").insert({ user_id: user.id }).select().maybeSingle();
        }
        toast({ title: "Perfil ativado!", description: `Agora você também pode entrar como ${roleConfig[role].label}.` });
        // Reload to refresh roles
        window.location.reload();
      }
    } catch (err: any) {
      toast({ title: "Erro", description: err.message || "Não foi possível ativar o perfil.", variant: "destructive" });
    } finally {
      setActivating(null);
    }
  };

  const availableToActivate = allRoles.filter((r) => !userRoles.includes(r));

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-primary" />
            <h1 className="font-display text-2xl font-bold text-foreground">Meus Perfis</h1>
          </div>
        </div>

        {/* Active Roles */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Perfis ativos</h2>
          {userRoles.map((role) => {
            const config = roleConfig[role];
            if (!config) return null;
            const Icon = config.icon;
            const isActive = role === activeRole;
            return (
              <Card key={role} className={`transition-all ${isActive ? "border-primary shadow-md" : "border-border"}`}>
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isActive ? "bg-primary/20" : "bg-muted"}`}>
                      <Icon className={`w-6 h-6 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">{config.label}</p>
                        {isActive && <Badge variant="default" className="text-xs">Ativo</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{config.description}</p>
                    </div>
                  </div>
                  {!isActive && (
                    <Button variant="outline" size="sm" onClick={() => handleSwitch(role)}>
                      Entrar
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Available to Activate */}
        {availableToActivate.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Ativar novo perfil</h2>
            <p className="text-sm text-muted-foreground">Adicione um novo perfil à sua conta para acessar mais funcionalidades.</p>
            {availableToActivate.map((role) => {
              const config = roleConfig[role];
              const Icon = config.icon;
              return (
                <Card key={role} className="border-dashed border-2 border-border">
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                        <Icon className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{config.label}</p>
                        <p className="text-sm text-muted-foreground">{config.description}</p>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => handleActivateRole(role)} disabled={activating === role}>
                      <Plus className="w-4 h-4 mr-1" />
                      {activating === role ? "Ativando..." : "Ativar"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MeusPerfis;
