import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { MapPin } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const AdminEstabelecimentos = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("estabelecimentos").select("*").order("created_at", { ascending: false }).limit(200).then(({ data }) => {
      setItems(data || []);
      setLoading(false);
    });
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold">Estabelecimentos</h1>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="bg-card rounded-xl border border-border overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 text-sm font-medium">Nome</th>
                  <th className="text-left p-3 text-sm font-medium">Responsável</th>
                  <th className="text-left p-3 text-sm font-medium">Cidade</th>
                  <th className="text-left p-3 text-sm font-medium">Telefone</th>
                  <th className="text-left p-3 text-sm font-medium">Onboarding</th>
                  <th className="text-left p-3 text-sm font-medium">Cadastro</th>
                </tr>
              </thead>
              <tbody>
                {items.map(e => (
                  <tr key={e.id} className="border-t border-border">
                    <td className="p-3 text-sm font-medium">{e.nome}</td>
                    <td className="p-3 text-sm text-muted-foreground">{e.responsavel}</td>
                    <td className="p-3 text-sm"><MapPin className="w-3 h-3 inline mr-1" />{e.cidade}, {e.estado}</td>
                    <td className="p-3 text-sm">{e.telefone}</td>
                    <td className="p-3">{e.onboarding_completo ? <span className="text-success text-sm">✓</span> : <span className="text-muted-foreground text-sm">Pendente</span>}</td>
                    <td className="p-3 text-sm text-muted-foreground">{new Date(e.created_at).toLocaleDateString("pt-BR")}</td>
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

export default AdminEstabelecimentos;
