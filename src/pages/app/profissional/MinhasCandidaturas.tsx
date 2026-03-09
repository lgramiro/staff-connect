import { useEffect, useState } from "react";
import { ProfissionalLayout } from "@/components/layouts/ProfissionalLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const MinhasCandidaturas = () => {
  const { user } = useAuth();
  const [candidaturas, setCandidaturas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: prof } = await supabase.from("profissionais").select("id").eq("user_id", user.id).single();
      if (!prof) { setLoading(false); return; }
      const { data } = await supabase.from("candidaturas").select("*, slots(*, estabelecimentos(nome))").eq("profissional_id", prof.id).order("created_at", { ascending: false });
      setCandidaturas(data || []);
      setLoading(false);
    };
    load();
  }, [user]);

  const statusLabel: Record<string, { text: string; class: string }> = {
    enviada: { text: "Enviada", class: "bg-info/20 text-info" },
    aprovada: { text: "Aprovada", class: "bg-success/20 text-success" },
    recusada: { text: "Recusada", class: "bg-destructive/20 text-destructive" },
    confirmada: { text: "Confirmada", class: "bg-primary/20 text-primary" },
    concluida: { text: "Concluída", class: "bg-success/20 text-success" },
    nao_compareceu: { text: "Não compareceu", class: "bg-destructive/20 text-destructive" },
  };

  return (
    <ProfissionalLayout>
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold">Minhas Candidaturas</h1>
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
        ) : candidaturas.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">Nenhuma candidatura enviada.</div>
        ) : (
          <div className="space-y-3">
            {candidaturas.map(c => (
              <div key={c.id} className="bg-card rounded-xl p-4 border border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{c.slots?.funcao}</p>
                    <p className="text-sm text-muted-foreground">{c.slots?.estabelecimentos?.nome}</p>
                    <p className="text-sm text-muted-foreground">{c.slots?.data} • {c.slots?.horario_inicio}-{c.slots?.horario_fim}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusLabel[c.status]?.class || "bg-muted"}`}>
                      {statusLabel[c.status]?.text || c.status}
                    </span>
                    <p className="font-semibold mt-1">R$ {Number(c.slots?.valor || 0).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProfissionalLayout>
  );
};

export default MinhasCandidaturas;
