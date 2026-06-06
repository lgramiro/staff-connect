import { useMemo, useState, useEffect } from "react";
import { ProfissionalLayout } from "@/components/layouts/ProfissionalLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  Star, 
  CalendarClock, 
  DollarSign, 
  AlertCircle, 
  History, 
  Zap,
  MapPin
} from "lucide-react";
import { Link } from "react-router-dom";
import { useCandidaturasByProfissional, useAtualizarCandidatura } from "@/hooks/queries/useCandidaturas";
import { useProfissionalQuery } from "@/hooks/queries/useProfissional";
import { useUpdateSlotStatus } from "@/hooks/queries/useSlots";
import { criarNotificacao, getEstabelecimentoUserIdBySlot } from "@/lib/notificacoes";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { usePageTitle } from "@/hooks/usePageTitle";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const VagasUrgentesSection = ({ profId, profFuncoes }: { profId: string | undefined, profFuncoes: string[] }) => {
  const [urgentes, setUrgentes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [candidaturasIds, setCandidaturasIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    const fetchUrgentes = async () => {
      if (!profId || profFuncoes.length === 0) {
        setLoading(false);
        return;
      }
      
      const { data } = await supabase
        .from("slots")
        .select("*, estabelecimentos(nome)")
        .eq("urgente", true)
        .eq("status", "aberto")
        .in("funcao", profFuncoes)
        .limit(3);
      
      if (data) setUrgentes(data);
      
      const { data: cands } = await supabase
        .from("candidaturas")
        .select("slot_id")
        .eq("profissional_id", profId);
      
      if (cands) setCandidaturasIds(new Set(cands.map(c => c.slot_id)));
      setLoading(false);
    };

    fetchUrgentes();
  }, [profId, profFuncoes]);

  const handleCandidatar = async (slotId: string) => {
    const { data, error } = await supabase
      .from("candidaturas")
      .insert({ slot_id: slotId, profissional_id: profId })
      .select()
      .single();
    
    if (error) {
      toast({ title: "Erro ao se candidatar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Candidatura enviada!" });
      setCandidaturasIds(prev => new Set([...prev, slotId]));
    }
  };

  if (loading) return null;
  if (urgentes.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg font-bold flex items-center gap-2">
        <Zap className="w-5 h-5 text-destructive fill-destructive" />
        Vagas Urgentes para Você
      </h2>
      <div className="grid gap-4 md:grid-cols-3">
        {urgentes.map(vaga => (
          <div key={vaga.id} className="bg-card rounded-xl p-4 border border-destructive/20 bg-destructive/5 space-y-3 relative overflow-hidden group hover:border-destructive/40 transition-all">
            <div className="flex justify-between items-start">
              <Badge variant="destructive" className="text-[10px]">URGENTE</Badge>
              <p className="font-bold text-success">R$ {Number(vaga.valor).toFixed(0)}</p>
            </div>
            <div>
              <p className="font-bold text-sm line-clamp-1">{vaga.funcao}</p>
              <p className="text-xs text-muted-foreground line-clamp-1">{vaga.estabelecimentos?.nome}</p>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <CalendarClock className="w-3 h-3" />
              {new Date(vaga.data).toLocaleDateString("pt-BR")}
            </div>
            {candidaturasIds.has(vaga.id) ? (
              <Button disabled variant="secondary" size="sm" className="w-full text-xs h-8">Candidatado</Button>
            ) : (
              <Button variant="hero" size="sm" className="w-full text-xs h-8" onClick={() => handleCandidatar(vaga.id)}>Candidatar-se</Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const ProfissionalDashboard = () => {
  usePageTitle("Início | Tem Staff");
  const { user, profile } = useAuth();
  const { data: prof } = useProfissionalQuery(user?.id);
  const { data: cands = [], isLoading: loading } = useCandidaturasByProfissional(prof?.id);
  const atualizarCandidatura = useAtualizarCandidatura();
  const updateSlotStatus = useUpdateSlotStatus();

  const [ocorrenciasRecentes, setOcorrenciasRecentes] = useState(0);

  useEffect(() => {
    const fetchOcorrencias = async () => {
      if (!prof?.id) return;
      const trintaDiasAtras = new Date();
      trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
      
      const { count } = await supabase
        .from("ocorrencias_slots")
        .select("*", { count: 'exact', head: true })
        .eq("profissional_id", prof.id)
        .eq("tipo", "no_show")
        .gte("created_at", trintaDiasAtras.toISOString());
      
      setOcorrenciasRecentes(count || 0);
    };

    fetchOcorrencias();
  }, [prof?.id]);

  // Trust score
  const trustScore = Number(prof?.trust_score || 0);
  const totalAvaliacoes = Number(prof?.total_avaliacoes || 0);

  // Taxa de comparecimento
  const taxaComparecimento = useMemo(() => {
    const validas = cands.filter(c => ["concluida", "no_show", "nao_compareceu"].includes(c.status));
    const concluidas = validas.filter(c => c.status === "concluida").length;
    if (validas.length === 0) return 100;
    return (concluidas / validas.length) * 100;
  }, [cands]);

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

  const stats = {
    enviadas: cands.filter(c => c.status === "enviada").length,
    aprovadas: cands.filter(c => ["aprovada", "confirmada", "concluida"].includes(c.status)).length,
    aguardando: cands.filter(c => c.status === "aprovada").length,
  };

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

  const statCards = [
    { label: "Candidaturas", value: stats.enviadas, icon: Briefcase, color: "bg-primary/10 text-primary" },
    { label: "Aprovadas", value: stats.aprovadas, icon: CheckCircle2, color: "bg-success/10 text-success" },
    { label: "Confirmar", value: stats.aguardando, icon: Clock, color: "bg-warning/10 text-warning" },
  ];

  if (loading) return <ProfissionalLayout><div className="flex justify-center py-12"><LoadingSpinner text="Carregando seu dashboard..." /></div></ProfissionalLayout>;

  return (
    <ProfissionalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Olá, {profile?.nome || "Profissional"}! 👋</h1>
          <p className="text-muted-foreground">Confira suas oportunidades e próximos trabalhos.</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {statCards.map((s, i) => (
            <div key={i} className="bg-card rounded-xl p-4 border border-border shadow-sm">
              <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center mb-3`}><s.icon className="w-5 h-5" /></div>
              <p className="text-2xl font-display font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Métricas Anti No-Show e Financeiras */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Taxa de Comparecimento */}
          <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                taxaComparecimento >= 90 ? "bg-success/10 text-success" : 
                taxaComparecimento >= 70 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"
              }`}>
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-sm">Comparecimento</h3>
            </div>
            <p className={`text-3xl font-display font-bold mb-1 ${
              taxaComparecimento >= 90 ? "text-success" : 
              taxaComparecimento >= 70 ? "text-warning" : "text-destructive"
            }`}>{taxaComparecimento.toFixed(0)}%</p>
            <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${
                  taxaComparecimento >= 90 ? "bg-success" : 
                  taxaComparecimento >= 70 ? "bg-warning" : "bg-destructive"
                }`} 
                style={{ width: `${taxaComparecimento}%` }} 
              />
            </div>
          </div>

          {/* Ocorrências */}
          <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${ocorrenciasRecentes > 0 ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}>
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-sm">No-Shows (30d)</h3>
            </div>
            <p className="text-3xl font-display font-bold mb-1">{ocorrenciasRecentes}</p>
            <Link to="/app/profissional/historico" className="text-xs text-primary hover:underline flex items-center gap-1">
              <History className="w-3 h-3" /> Ver histórico
            </Link>
          </div>

          {/* Trust Score */}
          <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 text-warning flex items-center justify-center">
                <Star className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-sm">Trust Score</h3>
            </div>
            <p className="text-3xl font-display font-bold mb-1">{trustScore.toFixed(1)}</p>
            {renderStars(trustScore)}
            <p className="text-xs text-muted-foreground mt-2">
              {totalAvaliacoes} avaliações
            </p>
          </div>

          {/* Ganhos estimados */}
          <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 text-success flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-sm">Ganhos (Mês)</h3>
            </div>
            <p className="text-3xl font-display font-bold">
              R$ {ganhosMes.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Confirmados + Concluídos
            </p>
          </div>
        </div>

        {/* Próximo trabalho e Gráfico */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-1">
            <div className="bg-card rounded-xl p-5 border border-border shadow-sm h-full">
              <div className="flex items-center gap-2 mb-4 border-b border-border pb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <CalendarClock className="w-5 h-5" />
                </div>
                <h3 className="font-semibold">Próximo trabalho</h3>
              </div>
              {proximoTrabalho ? (
                <div className="space-y-3">
                  <p className="font-display font-bold text-xl text-primary">{proximoTrabalho.slots?.funcao}</p>
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{proximoTrabalho.slots?.estabelecimentos?.nome}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(proximoTrabalho.slots?.data || "").toLocaleDateString("pt-BR")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {proximoTrabalho.slots?.horario_inicio?.slice(0,5)} às {proximoTrabalho.slots?.horario_fim?.slice(0,5)}
                    </p>
                  </div>
                  <div className="pt-2">
                    <p className="text-xl font-bold text-success">R$ {Number(proximoTrabalho.slots?.valor || 0).toFixed(2)}</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-center">
                  <p className="text-sm text-muted-foreground italic">Nenhum trabalho confirmado no momento.</p>
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-card rounded-xl p-5 border border-border shadow-sm h-full">
              <h2 className="font-display text-lg font-semibold mb-4">Atividade nos últimos 6 meses</h2>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" fontSize={12} axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        <VagasUrgentesSection profId={prof?.id} profFuncoes={prof?.funcoes || []} />

        {/* Atalhos rápidos */}
        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <Button variant="hero" asChild className="flex-1 h-12 text-lg shadow-md hover:shadow-lg transition-all">
            <Link to="/app/profissional/oportunidades">🔍 Buscar Oportunidades</Link>
          </Button>
          <Button variant="outline" asChild className="flex-1 h-12 text-lg border-primary/20 hover:bg-primary/5 transition-all">
            <Link to="/app/profissional/candidaturas">📋 Minhas Candidaturas</Link>
          </Button>
        </div>
      </div>
    </ProfissionalLayout>
  );
};

export default ProfissionalDashboard;