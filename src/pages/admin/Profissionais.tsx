import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Star, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const AdminProfissionais = () => {
  const [profissionais, setProfissionais] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("profissionais").select("*").order("trust_score", { ascending: false }).limit(200).then(({ data }) => {
      setProfissionais(data || []);
      setLoading(false);
    });
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold">Profissionais</h1>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="bg-card rounded-xl border border-border overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 text-sm font-medium">Nome</th>
                  <th className="text-left p-3 text-sm font-medium">Cidade</th>
                  <th className="text-left p-3 text-sm font-medium">Funções</th>
                  <th className="text-left p-3 text-sm font-medium">Trust Score</th>
                  <th className="text-left p-3 text-sm font-medium">Avaliações</th>
                  <th className="text-left p-3 text-sm font-medium">Diária Mín.</th>
                  <th className="text-left p-3 text-sm font-medium">Onboarding</th>
                </tr>
              </thead>
              <tbody>
                {profissionais.map(p => (
                  <tr key={p.id} className="border-t border-border">
                    <td className="p-3 text-sm font-medium">{p.nome}</td>
                    <td className="p-3 text-sm text-muted-foreground"><MapPin className="w-3 h-3 inline mr-1" />{p.cidade}, {p.estado}</td>
                    <td className="p-3"><div className="flex flex-wrap gap-1">{(p.funcoes || []).slice(0, 3).map((f: string) => <Badge key={f} variant="outline" className="text-xs">{f}</Badge>)}</div></td>
                    <td className="p-3"><div className="flex items-center gap-1"><Star className="w-4 h-4 text-warning fill-warning" /><span className="font-semibold">{Number(p.trust_score).toFixed(1)}</span></div></td>
                    <td className="p-3 text-sm">{p.total_avaliacoes}</td>
                    <td className="p-3 text-sm">R$ {Number(p.diaria_minima).toFixed(2)}</td>
                    <td className="p-3">{p.onboarding_completo ? <span className="text-success text-sm">✓</span> : <span className="text-muted-foreground text-sm">Pendente</span>}</td>
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

export default AdminProfissionais;
