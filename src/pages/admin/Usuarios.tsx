import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Ban, CheckCircle2 } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const AdminUsuarios = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    setProfiles(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleBlock = async (profileId: string, currentBlocked: boolean) => {
    await supabase.from("profiles").update({ is_blocked: !currentBlocked }).eq("id", profileId);
    await supabase.from("admin_logs").insert({ admin_id: user!.id, acao: `${currentBlocked ? "Desbloqueou" : "Bloqueou"} usuário ${profileId}` });
    toast({ title: currentBlocked ? "Usuário desbloqueado" : "Usuário bloqueado" });
    load();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold">Usuários</h1>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr><th className="text-left p-3 text-sm font-medium">Nome</th><th className="text-left p-3 text-sm font-medium">Email</th><th className="text-left p-3 text-sm font-medium">Role</th><th className="text-left p-3 text-sm font-medium">Status</th><th className="p-3"></th></tr>
              </thead>
              <tbody>
                {profiles.map(p => (
                  <tr key={p.id} className="border-t border-border">
                    <td className="p-3 text-sm">{p.nome}</td>
                    <td className="p-3 text-sm text-muted-foreground">{p.email}</td>
                    <td className="p-3"><span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">{p.role}</span></td>
                    <td className="p-3">{p.is_blocked ? <span className="text-destructive text-sm">Bloqueado</span> : <span className="text-success text-sm">Ativo</span>}</td>
                    <td className="p-3">
                      <Button size="sm" variant={p.is_blocked ? "outline" : "ghost"} onClick={() => toggleBlock(p.id, p.is_blocked)}>
                        {p.is_blocked ? <><CheckCircle2 className="w-4 h-4 mr-1" />Desbloquear</> : <><Ban className="w-4 h-4 mr-1" />Bloquear</>}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUsuarios;
