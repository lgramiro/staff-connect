import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const statusColors: Record<string, string> = {
  enviada: "bg-info/20 text-info",
  aprovada: "bg-success/20 text-success",
  confirmada: "bg-primary/20 text-primary",
  recusada: "bg-destructive/20 text-destructive",
  cancelada: "bg-muted text-muted-foreground",
  concluida: "bg-success/20 text-success",
  nao_compareceu: "bg-destructive/20 text-destructive",
};

const AdminCandidaturas = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("candidaturas").select("*, profissionais(nome), slots(funcao, data, estabelecimento_id, estabelecimentos(nome))").order("created_at", { ascending: false }).limit(200).then(({ data }) => {
      setItems(data || []);
      setLoading(false);
    });
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold">Candidaturas</h1>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="bg-card rounded-xl border border-border overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 text-sm font-medium">Profissional</th>
                  <th className="text-left p-3 text-sm font-medium">Função</th>
                  <th className="text-left p-3 text-sm font-medium">Estabelecimento</th>
                  <th className="text-left p-3 text-sm font-medium">Data</th>
                  <th className="text-left p-3 text-sm font-medium">Status</th>
                  <th className="text-left p-3 text-sm font-medium">Criada em</th>
                </tr>
              </thead>
              <tbody>
                {items.map(c => (
                  <tr key={c.id} className="border-t border-border">
                    <td className="p-3 text-sm font-medium">{c.profissionais?.nome || "-"}</td>
                    <td className="p-3 text-sm">{c.slots?.funcao || "-"}</td>
                    <td className="p-3 text-sm">{c.slots?.estabelecimentos?.nome || "-"}</td>
                    <td className="p-3 text-sm">{c.slots?.data || "-"}</td>
                    <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs ${statusColors[c.status] || "bg-muted"}`}>{c.status}</span></td>
                    <td className="p-3 text-sm text-muted-foreground">{new Date(c.created_at).toLocaleDateString("pt-BR")}</td>
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

export default AdminCandidaturas;
