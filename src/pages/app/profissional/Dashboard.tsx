import { useMemo } from "react";
import { ProfissionalLayout } from "@/components/layouts/ProfissionalLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Briefcase, CheckCircle2, Clock, Star, CalendarClock, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import { useCandidaturasByProfissional, useAtualizarCandidatura } from "@/hooks/queries/useCandidaturas";
import { useProfissionalQuery } from "@/hooks/queries/useProfissional";
import { useUpdateSlotStatus } from "@/hooks/queries/useSlots";
import { criarNotificacao, getEstabelecimentoUserIdBySlot } from "@/lib/notificacoes";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { usePageTitle } from "@/hooks/usePageTitle";




const ProfissionalDashboard = () => {
  usePageTitle("Início | Tem Staff");
  const { user, profile } = useAuth();
  const { data: prof } = useProfissionalQuery(user?.id);
  const { data: cands = [], isLoading: loading } = useCandidaturasByProfissional(prof?.id);
  
  if (loading) return <ProfissionalLayout><div className="flex justify-center py-12"><LoadingSpinner text="Carregando seu dashboard..." /></div></ProfissionalLayout>;
  
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
      
      const estabUserId = await getEstabelecimentoUserIdBySlot(slotId);
      if (estabUserId) {
        await criarNotificacao({
          user_id: estabUserId,
          titulo: "Profissional confirmou presença",
          mensagem: "Um profissional confirmou presença em uma vaga.",
          tipo: "confirmacao",
          referencia_id: id,
        });
      }
    } else {
      atualizarCandidatura.mutate({ id, status: "recusada" });
    }
  };


  const statCards = [
    { label: "Candidaturas", value: stats.enviadas, icon: Briefcase, color: "bg-primary/10 text-primary" },
    { label: "Aprovadas", value: stats.aprovadas, icon: CheckCircle2, color: "bg-success/10 text-success" },
    { label: "Confirmar", value: stats.aguardando, icon: Clock, color: "bg-warning/10 text-warning" },
  ];

  // Trust score
  const trustScore = Number(prof?.trust_score || 0);
  const totalAvaliacoes = Number(prof?.total_avaliacoes || 0);

  // Próximo trabalho confirmado
  const hojeStr = new Date().toISOString().split("T")[0];
  const proximoTrabalho = useMemo(() => {
    const futuros = cands
      .filter(c => c.status === "confirmada" && c.slots?.data && c.slots.data >= hojeStr)
      .sort((a, b) => (a.slots?.data || "").localeCompare(b.slots?.data || ""));
    return futuros[0] || null;
  }, [cands, hojeStr]);

  // Ganhos estimados do mês atual
  const ganhosMes = useMemo(() => {
    const now = new Date();
    const ano = now.getFullYear();
    const mes = now.getMonth();
    return cands
      .filter(c => ["confirmada", "concluida"].includes(c.status) && c.slots?.data)
      .filter(c => {
        const d = new Date(c.slots!.data);
        return d.getFullYear() === ano && d.getMonth() === mes;
      })
      .reduce((sum, c) => sum + Number(c.slots?.valor || 0), 0);
  }, [cands]);

  // Candidaturas por mês (últimos 6 meses)
  const chartData = useMemo(() => {
    const meses: { key: string; label: string; total: number }[] = [];
    const now = new Date();
    const nomes = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      meses.push({ key, label: nomes[d.getMonth()], total: 0 });
    }
    cands.forEach(c => {
      if (!c.created_at) return;
      const d = new Date(c.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const slot = meses.find(m => m.key === key);
      if (slot) slot.total++;
    });
    return meses;
  }, [cands]);

  const renderStars = (score: number) => {
    const full = Math.floor(score);
    const half = score - full >= 0.5;
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i < full || (i === full && half);
          return (
            <Star
              key={i}
              className={`w-4 h-4 ${filled ? "fill-warning text-warning" : "text-muted-foreground/30"}`}
            />
          );
        })}
      </div>
    );
  };

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

        {/* Métricas adicionais */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Trust Score */}
          <div className="bg-card rounded-xl p-5 border border-border">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 text-warning flex items-center justify-center">
                <Star className="w-5 h-5" />
              </div>
              <h3 className="font-semibold">Trust Score</h3>
            </div>
            <p className="text-3xl font-display font-bold mb-1">{trustScore.toFixed(1)}</p>
            {renderStars(trustScore)}
            <p className="text-xs text-muted-foreground mt-2">
              {totalAvaliacoes} {totalAvaliacoes === 1 ? "avaliação" : "avaliações"}
            </p>
          </div>

          {/* Próximo trabalho */}
          <div className="bg-card rounded-xl p-5 border border-border">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <CalendarClock className="w-5 h-5" />
              </div>
              <h3 className="font-semibold">Próximo trabalho</h3>
            </div>
            {proximoTrabalho ? (
              <div>
                <p className="font-display font-bold text-lg">{proximoTrabalho.slots?.funcao}</p>
                <p className="text-sm text-muted-foreground">{proximoTrabalho.slots?.estabelecimentos?.nome}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {proximoTrabalho.slots?.data} • {proximoTrabalho.slots?.horario_inicio?.slice(0,5)}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mt-2">Nenhum trabalho confirmado.</p>
            )}
          </div>

          {/* Ganhos estimados */}
          <div className="bg-card rounded-xl p-5 border border-border">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 text-success flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="font-semibold">Ganhos estimados</h3>
            </div>
            <p className="text-3xl font-display font-bold">
              R$ {ganhosMes.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              No mês atual (confirmados + concluídos)
            </p>
          </div>
        </div>

        {/* Gráfico */}
        <div className="bg-card rounded-xl p-5 border border-border">
          <h2 className="font-display text-lg font-semibold mb-4">Candidaturas nos últimos 6 meses</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    color: "hsl(var(--foreground))",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>



        {/* Atalhos rápidos */}
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
