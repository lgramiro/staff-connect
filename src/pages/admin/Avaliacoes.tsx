import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Star } from "lucide-react";

const AdminAvaliacoes = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("avaliacoes").select("*, candidaturas(slots(funcao, data))").order("created_at", { ascending: false }).limit(200).then(({ data }) => {
      setItems(data || []);
      setLoading(false);
    });
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold">Avaliações</h1>
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
        ) : (
          <div className="bg-card rounded-xl border border-border overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 text-sm font-medium">Nota</th>
                  <th className="text-left p-3 text-sm font-medium">Comentário</th>
                  <th className="text-left p-3 text-sm font-medium">Função</th>
                  <th className="text-left p-3 text-sm font-medium">Data</th>
                  <th className="text-left p-3 text-sm font-medium">Criada em</th>
                </tr>
              </thead>
              <tbody>
                {items.map(a => (
                  <tr key={a.id} className="border-t border-border">
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(n => (
                          <Star key={n} className={`w-4 h-4 ${n <= a.nota ? "text-warning fill-warning" : "text-muted-foreground"}`} />
                        ))}
                      </div>
                    </td>
                    <td className="p-3 text-sm max-w-xs truncate">{a.comentario || "-"}</td>
                    <td className="p-3 text-sm">{a.candidaturas?.slots?.funcao || "-"}</td>
                    <td className="p-3 text-sm">{a.candidaturas?.slots?.data || "-"}</td>
                    <td className="p-3 text-sm text-muted-foreground">{new Date(a.created_at).toLocaleDateString("pt-BR")}</td>
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

export default AdminAvaliacoes;
