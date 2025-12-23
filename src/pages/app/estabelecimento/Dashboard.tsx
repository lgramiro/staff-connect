import { EstabelecimentoLayout } from "@/components/layouts/EstabelecimentoLayout";
import { Button } from "@/components/ui/button";
import { 
  CalendarDays, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Plus,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useState } from "react";

const EstabelecimentoDashboard = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);

  // Mock data for events
  const events: Record<number, { status: "filled" | "pending" | "open"; count: number }> = {
    5: { status: "filled", count: 3 },
    8: { status: "pending", count: 2 },
    12: { status: "filled", count: 4 },
    15: { status: "open", count: 1 },
    18: { status: "pending", count: 3 },
    20: { status: "filled", count: 2 },
    24: { status: "open", count: 5 },
    28: { status: "pending", count: 2 },
  };

  const stats = [
    { label: "Vagas criadas", value: "24", icon: CalendarDays, color: "bg-primary/10 text-primary" },
    { label: "Profissionais contratados", value: "18", icon: Users, color: "bg-success/10 text-success" },
    { label: "Preenchidas", value: "15", icon: CheckCircle2, color: "bg-success/10 text-success" },
    { label: "Pendentes", value: "9", icon: Clock, color: "bg-warning/10 text-warning" },
  ];

  const alerts = [
    { day: 24, message: "Faltam 3 garçons para o dia 24" },
    { day: 28, message: "Faltam 2 auxiliares para o dia 28" },
  ];

  return (
    <EstabelecimentoLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Olá, Restaurante Sabor & Arte! 👋
            </h1>
            <p className="text-muted-foreground">
              Gerencie sua escala mensal e encontre profissionais.
            </p>
          </div>
          <Button variant="hero">
            <Plus className="w-4 h-4 mr-2" />
            Nova Necessidade
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-card rounded-xl p-4 border border-border">
              <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="bg-warning/10 border border-warning/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground mb-1">Atenção</p>
                <ul className="space-y-1">
                  {alerts.map((alert, index) => (
                    <li key={index} className="text-sm text-muted-foreground">{alert.message}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Calendar */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-semibold text-foreground">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h2>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(day => (
              <div key={day} className="py-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before the first day of the month */}
            {Array.from({ length: firstDay }, (_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            
            {/* Days of the month */}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const event = events[day];
              
              return (
                <button
                  key={day}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-all hover:bg-muted/50 ${
                    event 
                      ? event.status === "filled" 
                        ? "bg-success/10 hover:bg-success/20" 
                        : event.status === "pending"
                          ? "bg-warning/10 hover:bg-warning/20"
                          : "bg-primary/10 hover:bg-primary/20"
                      : ""
                  }`}
                >
                  <span className={`font-medium ${event ? "text-foreground" : "text-muted-foreground"}`}>
                    {day}
                  </span>
                  {event && (
                    <div className="flex items-center gap-0.5 mt-0.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        event.status === "filled" ? "bg-success" : 
                        event.status === "pending" ? "bg-warning" : "bg-primary"
                      }`} />
                      <span className="text-xs text-muted-foreground">{event.count}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-3 h-3 rounded-full bg-success" />
              Preenchido
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-3 h-3 rounded-full bg-warning" />
              Pendente
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-3 h-3 rounded-full bg-primary" />
              Aberto
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <h2 className="font-display text-lg font-semibold text-foreground mb-4">
            Candidaturas Recentes
          </h2>
          <div className="space-y-3">
            {[
              { name: "João Silva", role: "Garçom", date: "Dia 24/12", status: "pending" },
              { name: "Maria Santos", role: "Auxiliar de Cozinha", date: "Dia 24/12", status: "pending" },
              { name: "Carlos Oliveira", role: "Chef", date: "Dia 28/12", status: "approved" },
            ].map((candidate, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {candidate.name.split(" ").map(n => n[0]).join("")}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{candidate.name}</p>
                    <p className="text-sm text-muted-foreground">{candidate.role} • {candidate.date}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {candidate.status === "pending" ? (
                    <>
                      <Button variant="success" size="sm">Aprovar</Button>
                      <Button variant="ghost" size="sm">Recusar</Button>
                    </>
                  ) : (
                    <span className="text-sm text-success font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Aprovado
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </EstabelecimentoLayout>
  );
};

export default EstabelecimentoDashboard;
