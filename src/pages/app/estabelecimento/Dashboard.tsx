import { useEffect, useState } from "react";
import { EstabelecimentoLayout } from "@/components/layouts/EstabelecimentoLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  CalendarDays, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Plus,
  ChevronLeft,
  ChevronRight,
  Zap,
  X
} from "lucide-react";
import { Link } from "react-router-dom";

const EstabelecimentoDashboard = () => {
  const { user, profile } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [stats, setStats] = useState({ abertos: 0, confirmados: 0, pendentes: 0, total: 0 });
  const [slotsByDay, setSlotsByDay] = useState<Record<number, { count: number; status: string }>>({});
  const [selectedDaySlots, setSelectedDaySlots] = useState<any[] | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [estabName, setEstabName] = useState("");
  const [loading, setLoading] = useState(true);

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: estab } = await supabase.from("estabelecimentos").select("id, nome").eq("user_id", user.id).single();
      if (!estab) { setLoading(false); return; }
      setEstabName(estab.nome);

      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
      const endDate = `${year}-${String(month + 1).padStart(2, "0")}-${getDaysInMonth(currentMonth)}`;

      const { data: slots } = await supabase.from("slots")
        .select("*")
        .eq("estabelecimento_id", estab.id)
        .gte("data", startDate)
        .lte("data", endDate);

      if (slots) {
        const abertos = slots.filter(s => s.status === "aberto").length;
        const confirmados = slots.filter(s => ["confirmado", "concluido"].includes(s.status)).length;
        const pendentes = slots.filter(s => s.status === "reservado").length;
        setStats({ abertos, confirmados, pendentes, total: slots.length });

        const byDay: Record<number, { count: number; status: string }> = {};
        slots.forEach(s => {
          const day = parseInt(s.data.split("-")[2]);
          if (!byDay[day]) byDay[day] = { count: 0, status: s.status };
          byDay[day].count++;
          // Priority: confirmado > reservado > aberto
          if (s.status === "confirmado" || s.status === "concluido") byDay[day].status = "filled";
          else if (s.status === "reservado" && byDay[day].status !== "filled") byDay[day].status = "pending";
          else if (s.status === "aberto" && byDay[day].status !== "filled" && byDay[day].status !== "pending") byDay[day].status = "open";
        });
        setSlotsByDay(byDay);
      }
      setLoading(false);
    };
    load();
  }, [user, currentMonth]);

  const handleDayClick = async (day: number) => {
    if (!user) return;
    setSelectedDay(day);
    const { data: estab } = await supabase.from("estabelecimentos").select("id").eq("user_id", user.id).single();
    if (!estab) return;
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const { data } = await supabase.from("slots").select("*").eq("estabelecimento_id", estab.id).eq("data", dateStr);
    setSelectedDaySlots(data || []);
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);

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
              Olá, {estabName || profile?.nome || "Estabelecimento"}! 👋
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
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
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
              <div className="bg-card rounded-xl p-6 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-lg font-semibold">
                    Slots do dia {selectedDay}/{currentMonth.getMonth() + 1}
                  </h2>
                  <Button variant="ghost" size="icon" onClick={() => { setSelectedDaySlots(null); setSelectedDay(null); }}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                {selectedDaySlots.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Nenhum slot neste dia.</p>
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
          </>
        )}
      </div>
    </EstabelecimentoLayout>
  );
};

export default EstabelecimentoDashboard;
