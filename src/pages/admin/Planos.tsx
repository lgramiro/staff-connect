import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const AdminPlanos = () => {
  const { toast } = useToast();
  const [planos, setPlanos] = useState<any[]>([]);
  const [assinaturas, setAssinaturas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [p, a] = await Promise.all([
        supabase.from("planos").select("*").order("preco"),
        supabase.from("assinaturas").select("*, planos(nome), estabelecimentos(nome)").order("created_at", { ascending: false }),
      ]);
      setPlanos(p.data || []);
      setAssinaturas(a.data || []);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold">Planos e Assinaturas</h1>

        <h2 className="font-display text-lg font-semibold">Planos</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {planos.map(p => (
            <div key={p.id} className="bg-card rounded-xl p-5 border border-border">
              <h3 className="font-display font-bold text-lg">{p.nome}</h3>
              <p className="text-2xl font-bold text-primary mt-1">R$ {Number(p.preco).toFixed(2)}<span className="text-sm font-normal text-muted-foreground">/mês</span></p>
              <p className="text-sm text-muted-foreground mt-2">{p.descricao}</p>
              <ul className="mt-3 space-y-1 text-sm">
                <li>Limite: {p.limite_slots ?? "Ilimitado"} slots</li>
                <li>Recorrência: {p.recorrencia ? "✅" : "❌"}</li>
                <li>Relatórios: {p.relatorios ? "✅" : "❌"}</li>
                <li>Favoritos: {p.favoritos ? "✅" : "❌"}</li>
              </ul>
            </div>
          ))}
        </div>

        <h2 className="font-display text-lg font-semibold mt-8">Assinaturas</h2>
        {assinaturas.length === 0 ? (
          <p className="text-muted-foreground">Nenhuma assinatura.</p>
        ) : (
          <div className="bg-card rounded-xl border border-border overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50"><tr><th className="text-left p-3 text-sm font-medium">Estabelecimento</th><th className="text-left p-3 text-sm font-medium">Plano</th><th className="text-left p-3 text-sm font-medium">Status</th><th className="text-left p-3 text-sm font-medium">Início</th></tr></thead>
              <tbody>
                {assinaturas.map(a => (
                  <tr key={a.id} className="border-t border-border">
                    <td className="p-3 text-sm">{a.estabelecimentos?.nome}</td>
                    <td className="p-3 text-sm">{a.planos?.nome}</td>
                    <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs ${a.status === "ativa" ? "bg-success/20 text-success" : "bg-muted"}`}>{a.status}</span></td>
                    <td className="p-3 text-sm">{new Date(a.inicio).toLocaleDateString("pt-BR")}</td>
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

export default AdminPlanos;
