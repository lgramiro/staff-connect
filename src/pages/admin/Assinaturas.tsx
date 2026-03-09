import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

const AdminAssinaturas = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [planos, setPlanos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [a, p] = await Promise.all([
      supabase.from("assinaturas").select("*, planos(nome, slug), estabelecimentos(nome)").order("created_at", { ascending: false }),
      supabase.from("planos").select("*").order("preco"),
    ]);
    setItems(a.data || []);
    setPlanos(p.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const changePlan = async (assinaturaId: string, planoId: string) => {
    await supabase.from("assinaturas").update({ plano_id: planoId }).eq("id", assinaturaId);
    await supabase.from("admin_logs").insert({ admin_id: user!.id, acao: `Alterou plano da assinatura ${assinaturaId}` });
    toast({ title: "Plano alterado!" });
    load();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold">Assinaturas</h1>
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
        ) : items.length === 0 ? (
          <p className="text-muted-foreground">Nenhuma assinatura encontrada.</p>
        ) : (
          <div className="bg-card rounded-xl border border-border overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 text-sm font-medium">Estabelecimento</th>
                  <th className="text-left p-3 text-sm font-medium">Plano Atual</th>
                  <th className="text-left p-3 text-sm font-medium">Status</th>
                  <th className="text-left p-3 text-sm font-medium">Início</th>
                  <th className="text-left p-3 text-sm font-medium">Alterar Plano</th>
                </tr>
              </thead>
              <tbody>
                {items.map(a => (
                  <tr key={a.id} className="border-t border-border">
                    <td className="p-3 text-sm font-medium">{a.estabelecimentos?.nome || "-"}</td>
                    <td className="p-3"><span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">{a.planos?.nome}</span></td>
                    <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs ${a.status === "ativa" ? "bg-success/20 text-success" : "bg-muted"}`}>{a.status}</span></td>
                    <td className="p-3 text-sm text-muted-foreground">{new Date(a.inicio).toLocaleDateString("pt-BR")}</td>
                    <td className="p-3">
                      <select
                        className="text-sm border border-input rounded-md px-2 py-1 bg-background"
                        value={a.plano_id}
                        onChange={e => changePlan(a.id, e.target.value)}
                      >
                        {planos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                      </select>
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

export default AdminAssinaturas;
