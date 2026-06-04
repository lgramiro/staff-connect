import { ProfissionalLayout } from "@/components/layouts/ProfissionalLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Briefcase, CheckCircle2, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useCandidaturasByProfissional, useAtualizarCandidatura } from "@/hooks/queries/useCandidaturas";
import { useProfissionalQuery } from "@/hooks/queries/useProfissional";
import { useUpdateSlotStatus } from "@/hooks/queries/useSlots";

const ProfissionalDashboard = () => {
  const { user, profile } = useAuth();
  const { data: prof } = useProfissionalQuery(user?.id);
  const { data: cands = [], isLoading: loading } = useCandidaturasByProfissional(prof?.id);
  
  const atualizarCandidatura = useAtualizarCandidatura();
  const updateSlotStatus = useUpdateSlotStatus();

  const stats = {
    enviadas: cands.filter(c => c.status === "enviada").length,
    aprovadas: cands.filter(c => ["aprovada", "confirmada", "concluida"].includes(c.status)).length,
    aguardando: cands.filter(c => c.status === "aprovada").length,
  };

  const pendentes = cands.filter(c => c.status === "aprovada");

  const handleConfirm = async (id: string, slotId: string, accept: boolean) => {
    if (accept) {
      atualizarCandidatura.mutate({ id, status: "confirmada" });
      updateSlotStatus.mutate({ id: slotId, status: "confirmado" });
    } else {
      atualizarCandidatura.mutate({ id, status: "recusada" });
    }
  };


  const statCards = [
    { label: "Candidaturas", value: stats.enviadas, icon: Briefcase, color: "bg-primary/10 text-primary" },
    { label: "Aprovadas", value: stats.aprovadas, icon: CheckCircle2, color: "bg-success/10 text-success" },
    { label: "Confirmar", value: stats.aguardando, icon: Clock, color: "bg-warning/10 text-warning" },
  ];

  return (
    <ProfissionalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Olá, {profile?.nome || "Profissional"}! 👋</h1>
          <p className="text-muted-foreground">Confira suas oportunidades e próximos trabalhos.</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {statCards.map((s, i) => (
            <div key={i} className="bg-card rounded-xl p-4 border border-border">
              <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center mb-3`}><s.icon className="w-5 h-5" /></div>
              <p className="text-2xl font-display font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Confirmações pendentes */}
        {pendentes.length > 0 && (
          <div className="bg-card rounded-xl p-6 border border-warning/30">
            <h2 className="font-display text-lg font-semibold mb-4">⚠️ Confirmações Pendentes</h2>
            <div className="space-y-3">
              {pendentes.map(c => (
                <div key={c.id} className="p-4 rounded-lg bg-muted/30 border border-border">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold">{c.slots?.funcao}</p>
                      <p className="text-sm text-muted-foreground">{c.slots?.estabelecimentos?.nome}</p>
                      <p className="text-sm text-muted-foreground">{c.slots?.data} • {c.slots?.horario_inicio}-{c.slots?.horario_fim}</p>
                    </div>
                    <p className="font-semibold">R$ {Number(c.slots?.valor || 0).toFixed(2)}</p>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button variant="hero" size="sm" className="flex-1" onClick={() => handleConfirm(c.id, c.slot_id, true)}>Confirmar Presença</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleConfirm(c.id, c.slot_id, false)}>Recusar</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="hero" asChild className="flex-1">
            <Link to="/app/profissional/oportunidades">🔍 Buscar Oportunidades</Link>
          </Button>
          <Button variant="outline" asChild className="flex-1">
            <Link to="/app/profissional/candidaturas">📋 Minhas Candidaturas</Link>
          </Button>
        </div>
      </div>
    </ProfissionalLayout>
  );
};

export default ProfissionalDashboard;
