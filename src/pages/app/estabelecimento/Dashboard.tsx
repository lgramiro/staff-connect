import { useState, useMemo, useEffect } from "react";
import { EstabelecimentoLayout } from "@/components/layouts/EstabelecimentoLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { 
  CalendarDays, 
  Users, 
  CheckCircle2, 
  Clock, 
  Plus,
  ChevronLeft,
  ChevronRight,
  Zap,
  X,
  TrendingUp,
  Star,
  AlertTriangle,
  Inbox
} from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { Link } from "react-router-dom";
import { useEstabelecimentoQuery } from "@/hooks/queries/useEstabelecimento";
import { useSlotsByEstabelecimento } from "@/hooks/queries/useSlots";
import { useCandidaturasByEstabelecimento } from "@/hooks/queries/useCandidaturas";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { usePageTitle } from "@/hooks/usePageTitle";

const EstabelecimentoDashboard = () => {
  usePageTitle("Dashboard | Tem Staff");
  const { user, profile } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [pendentesAvaliacao, setPendentesAvaliacao] = useState<any[]>([]);
  const queryClient = useQueryClient();

  const { data: estab } = useEstabelecimentoQuery(user?.id);
  
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const startDate = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}-01`;
  const endDate = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}-${daysInMonth}`;

  const { data: slots = [], isLoading: loadingSlots } = useSlotsByEstabelecimento(estab?.id, { startDate, endDate });
  const { data: cands = [], isLoading: loadingCands } = useCandidaturasByEstabelecimento(estab?.id);

  // Buscar avaliações pendentes para mostrar alerta no dashboard
  useEffect(() => {
    if (!user || !estab?.id) return;
    const loadPendentes = async () => {
      const { data: concluida } = await supabase
        .from("candidaturas")
        .select("id")
        .eq("status", "concluida");
      
      const { data: avaliacoes } = await supabase
        .from("avaliacoes")
        .select("candidatura_id")
        .eq("avaliador_id", user.id);
      
      const ratedIds = new Set((avaliacoes || []).map(a => a.candidatura_id));
      const filtered = (concluida || []).filter(c => !ratedIds.has(c.id));
      setPendentesAvaliacao(filtered);
    };
    loadPendentes();
  }, [user, estab?.id]);
  
  const loading = loadingSlots || loadingCands;

  const stats = useMemo(() => {
    const abertos = slots.filter(s => s.status === "aberto").length;
    const confirmados = slots.filter(s => ["confirmado", "concluido"].includes(s.status)).length;
    const pendentes = slots.filter(s => s.status === "reservado").length;
    return { abertos, confirmados, pendentes, total: slots.length };
  }, [slots]);

  const fillRate = useMemo(() => {
    if (stats.total === 0) return 0;
    return Math.round((stats.confirmados / stats.total) * 100);
  }, [stats]);

  const topProfissionais = useMemo(() => {
    if (!cands.length) return [];
    
    // Filtra candidaturas concluídas
    const concluidas = cands.filter(c => c.status === "concluido" && c.profissionais);
    
    // Agrupa por profissional
    const profMap: Record<string, { nome: string; score: number; count: number }> = {};
    
    concluidas.forEach(c => {
      const profId = c.profissional_id;
      if (!profMap[profId]) {
        profMap[profId] = { 
          nome: c.profissionais?.nome || "Profissional", 
          score: c.profissionais?.trust_score || 0,
          count: 0 
        };
      }
      profMap[profId].count++;
    });

    // Converte para array e ordena
    return Object.values(profMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }, [cands]);

  const slotsSemCandidatura = useMemo(() => {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    return slots.filter(s => {
      const createdAt = new Date(s.created_at);
      const isOld = createdAt < twoDaysAgo;
      const noCandidaturas = !s.candidaturas || s.candidaturas.length === 0;
      return s.status === "aberto" && isOld && noCandidaturas;
    });
  }, [slots]);

  const handleMarcarUrgente = async (slotId: string) => {
    const { error } = await supabase
      .from("slots")
      .update({ urgente: true })
      .eq("id", slotId);

    if (error) {
      toast.error("Erro ao marcar como urgente");
    } else {
      toast.success("Vaga marcada como urgente!");
      queryClient.invalidateQueries({ queryKey: ["slots-estabelecimento"] });
    }
  };

  const slotsByDay = useMemo(() => {
    const byDay: Record<number, { count: number; status: string }> = {};
    slots.forEach(s => {
      const day = parseInt(s.data.split("-")[2]);
      if (!byDay[day]) byDay[day] = { count: 0, status: s.status };
      byDay[day].count++;
      if (s.status === "confirmado" || s.status === "concluido") byDay[day].status = "filled";
      else if (s.status === "reservado" && byDay[day].status !== "filled") byDay[day].status = "pending";
      else if (s.status === "aberto" && byDay[day].status !== "filled" && byDay[day].status !== "pending") byDay[day].status = "open";
    });
    return byDay;
  }, [slots]);

  const selectedDaySlots = useMemo(() => {
    if (selectedDay === null) return null;
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
    return slots.filter(s => s.data === dateStr);
  }, [selectedDay, slots, currentMonth]);

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const firstDay = getFirstDayOfMonth(currentMonth);

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
  };

  const statCards = [
    { label: "Total", value: stats.total, icon: CalendarDays, color: "bg-primary/10 text-primary" },
    { label: "Confirmados", value: stats.confirmados, icon: CheckCircle2, color: "bg-success/10 text-success" },
    { label: "Pendentes", value: stats.pendentes, icon: Clock, color: "bg-warning/10 text-warning" },
    { label: "Abertos", value: stats.abertos, icon: Users, color: "bg-info/10 text-info" },
  ];

  return (
    <EstabelecimentoLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Olá, {estab?.nome || profile?.nome || "Estabelecimento"}! 👋
            </h1>
            <p className="text-muted-foreground">Gerencie sua escala mensal e encontre profissionais.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="hero" asChild>
              <Link to="/app/estabelecimento/criar-escala"><Plus className="w-4 h-4 mr-2" />Criar Escala</Link>
            </Button>
            <Button variant="outline-primary" asChild>
              <Link to="/app/estabelecimento/vaga-urgente"><Zap className="w-4 h-4 mr-2" />Urgente</Link>
            </Button>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((stat, i) => (
                <div key={i} className="bg-card rounded-xl p-4 border border-border">
                  <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Calendar */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-semibold text-foreground">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h2>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(day => (
                  <div key={day} className="py-2 text-center text-sm font-medium text-muted-foreground">{day}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }, (_, i) => <div key={`e-${i}`} className="aspect-square" />)}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const event = slotsByDay[day];
                  return (
                    <button key={day} onClick={() => handleDayClick(day)}
                      className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-all hover:bg-muted/50 ${
                        event
                          ? event.status === "filled" ? "bg-success/10 hover:bg-success/20"
                          : event.status === "pending" ? "bg-warning/10 hover:bg-warning/20"
                          : "bg-primary/10 hover:bg-primary/20"
                          : ""
                      }`}
                    >
                      <span className={`font-medium ${event ? "text-foreground" : "text-muted-foreground"}`}>{day}</span>
                      {event && (
                        <div className="flex items-center gap-0.5 mt-0.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${event.status === "filled" ? "bg-success" : event.status === "pending" ? "bg-warning" : "bg-primary"}`} />
                          <span className="text-xs text-muted-foreground">{event.count}</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><div className="w-3 h-3 rounded-full bg-success" />Confirmado</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><div className="w-3 h-3 rounded-full bg-warning" />Pendente</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><div className="w-3 h-3 rounded-full bg-primary" />Aberto</div>
              </div>
            </div>

            {/* Day detail */}
            {selectedDaySlots !== null && (
              <div className="bg-card rounded-xl p-6 border border-border animate-in fade-in slide-in-from-top-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-lg font-semibold">
                    Slots do dia {selectedDay}/{currentMonth.getMonth() + 1}
                  </h2>
                  <Button variant="ghost" size="icon" onClick={() => { setSelectedDay(null); }}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                {selectedDaySlots.length === 0 ? (
                  <EmptyState icon={Inbox} title="Nenhum slot neste dia" />
                ) : (
                  <div className="space-y-2">
                    {selectedDaySlots.map(s => (
                      <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                        <div>
                          <p className="font-semibold">{s.funcao}</p>
                          <p className="text-sm text-muted-foreground">{s.horario_inicio} - {s.horario_fim} • {s.quantidade} vaga(s)</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            s.status === "confirmado" ? "bg-success/20 text-success" :
                            s.status === "reservado" ? "bg-warning/20 text-warning" :
                            "bg-info/20 text-info"
                          }`}>{s.status}</span>
                          <p className="text-sm font-semibold mt-1">R$ {Number(s.valor).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Novos cards e seções */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card Taxa de preenchimento */}
              <div className="bg-card rounded-xl p-6 border border-border flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-display font-semibold">Taxa de preenchimento</h3>
                  </div>
                  <div className="flex items-end justify-between mb-2">
                    <p className="text-3xl font-bold">{fillRate}%</p>
                    <p className="text-sm text-muted-foreground">{stats.confirmados} de {stats.total} slots</p>
                  </div>
                  <Progress value={fillRate} className="h-2" />
                </div>
                <p className="text-xs text-muted-foreground mt-4 italic">Meta sugerida: 85%</p>
              </div>

              {/* Card Profissionais favoritos */}
              <div className="bg-card rounded-xl p-6 border border-border">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-warning/10 rounded-lg">
                    <Star className="w-5 h-5 text-warning" />
                  </div>
                  <h3 className="font-display font-semibold">Profissionais favoritos</h3>
                </div>
                {topProfissionais.length === 0 ? (
                  <EmptyState icon={Star} title="Nenhum profissional recorrente ainda" />
                ) : (
                  <div className="space-y-4">
                    {topProfissionais.map((prof, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                            {prof.nome.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{prof.nome}</p>
                            <p className="text-xs text-muted-foreground">{prof.count} trabalhos realizados</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-warning">
                          <Star className="w-3 h-3 fill-current" />
                          <span className="text-xs font-bold">{prof.score.toFixed(1)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Seção de Avaliações Pendentes */}
            {pendentesAvaliacao.length > 0 && (
              <div className="bg-card rounded-xl p-6 border border-border shadow-sm animate-pulse-soft">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-warning/10 rounded-lg">
                      <Star className="w-5 h-5 text-warning" />
                    </div>
                    <h3 className="font-display font-semibold">Avaliações Pendentes</h3>
                  </div>
                  <Badge variant="secondary">{pendentesAvaliacao.length}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Você tem serviços concluídos aguardando sua avaliação sobre os profissionais.
                </p>
                <Button variant="hero" asChild className="w-full">
                  <Link to="/app/estabelecimento/avaliar">Avaliar Profissionais Agora</Link>
                </Button>
              </div>
            )}

            {/* Seção Slots sem candidatura */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-destructive/10 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                  </div>
                  <h3 className="font-display font-semibold">Slots sem candidatura há +48h</h3>
                </div>
                <Badge variant="outline" className="text-xs">{slotsSemCandidatura.length} vago(s)</Badge>
              </div>
              
              {slotsSemCandidatura.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center border-2 border-dashed border-muted rounded-lg">
                  Ótimo! Todos os seus slots antigos têm interessados.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {slotsSemCandidatura.map(s => (
                    <div key={s.id} className="p-4 rounded-lg bg-muted/30 border border-border flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-semibold text-sm">{s.funcao}</p>
                          {s.urgente && <Badge variant="destructive" className="text-[10px] h-4">Urgente</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground mb-4">
                          {new Date(s.data).toLocaleDateString()} • {s.horario_inicio}
                        </p>
                      </div>
                      <Button 
                        size="sm" 
                        variant={s.urgente ? "ghost" : "outline-primary"} 
                        className="w-full h-8 text-xs"
                        onClick={() => handleMarcarUrgente(s.id)}
                        disabled={s.urgente}
                      >
                        {s.urgente ? "Já está urgente" : "Marcar como urgente"}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </EstabelecimentoLayout>
  );
};

export default EstabelecimentoDashboard;
