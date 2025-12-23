import { ProfissionalLayout } from "@/components/layouts/ProfissionalLayout";
import { Button } from "@/components/ui/button";
import { 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  MapPin,
  ArrowRight,
  Calendar,
  DollarSign
} from "lucide-react";
import { Link } from "react-router-dom";

const ProfissionalDashboard = () => {
  const stats = [
    { label: "Candidaturas enviadas", value: "8", icon: Briefcase, color: "bg-primary/10 text-primary" },
    { label: "Aprovadas", value: "5", icon: CheckCircle2, color: "bg-success/10 text-success" },
    { label: "Aguardando", value: "3", icon: Clock, color: "bg-warning/10 text-warning" },
  ];

  const upcomingJobs = [
    { 
      date: "24/12", 
      establishment: "Restaurante Sabor & Arte", 
      role: "Garçom", 
      time: "18:00 - 23:00",
      value: "R$ 150,00",
      status: "confirmed"
    },
    { 
      date: "28/12", 
      establishment: "Buffet Elegance", 
      role: "Auxiliar de Cozinha", 
      time: "10:00 - 18:00",
      value: "R$ 180,00",
      status: "pending_accept"
    },
  ];

  const suggestedJobs = [
    {
      id: 1,
      title: "Garçom para Evento",
      establishment: "Hotel Grand Plaza",
      location: "Centro, São Paulo",
      date: "30/12/2024",
      time: "19:00 - 02:00",
      value: "R$ 200,00",
      type: "Evento"
    },
    {
      id: 2,
      title: "Chef de Partida",
      establishment: "Restaurante La Maison",
      location: "Jardins, São Paulo",
      date: "02/01/2025",
      time: "11:00 - 15:00",
      value: "R$ 250,00",
      type: "Diária"
    },
    {
      id: 3,
      title: "Bartender",
      establishment: "Rooftop Bar Sky",
      location: "Itaim Bibi, São Paulo",
      date: "31/12/2024",
      time: "20:00 - 04:00",
      value: "R$ 350,00",
      type: "Evento"
    },
  ];

  return (
    <ProfissionalLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Olá, João! 👋
          </h1>
          <p className="text-muted-foreground">
            Confira suas oportunidades e próximos trabalhos.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-card rounded-xl p-4 border border-border">
              <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Upcoming Jobs */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-foreground">
              Próximos Trabalhos
            </h2>
            <Link to="/app/profissional/candidaturas" className="text-sm text-primary hover:underline">
              Ver todos
            </Link>
          </div>

          {upcomingJobs.length > 0 ? (
            <div className="space-y-3">
              {upcomingJobs.map((job, index) => (
                <div key={index} className="p-4 rounded-lg bg-muted/30 border border-border">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-display font-semibold text-foreground">{job.role}</span>
                        {job.status === "confirmed" ? (
                          <span className="px-2 py-0.5 rounded-full bg-success/20 text-success text-xs font-medium">
                            Confirmado
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-warning/20 text-warning text-xs font-medium">
                            Aceitar Convite
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{job.establishment}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{job.value}</p>
                      <p className="text-xs text-muted-foreground">{job.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {job.time}
                    </span>
                  </div>
                  {job.status === "pending_accept" && (
                    <div className="flex gap-2 mt-3">
                      <Button variant="hero" size="sm" className="flex-1">
                        Aceitar Convite
                      </Button>
                      <Button variant="ghost" size="sm">
                        Recusar
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">Nenhum trabalho agendado</p>
              <Button variant="hero" className="mt-4" asChild>
                <Link to="/app/profissional/oportunidades">
                  Buscar Oportunidades
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Suggested Jobs */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-foreground">
              Oportunidades para Você
            </h2>
            <Link to="/app/profissional/oportunidades" className="text-sm text-primary hover:underline flex items-center gap-1">
              Ver todas
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {suggestedJobs.map((job) => (
              <div key={job.id} className="bg-card rounded-xl p-5 border border-border hover:border-primary/30 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                  <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
                    {job.type}
                  </span>
                  <span className="font-display font-bold text-foreground">{job.value}</span>
                </div>

                <h3 className="font-display font-semibold text-foreground mb-1">{job.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{job.establishment}</p>

                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {job.date}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {job.time}
                  </div>
                </div>

                <Button variant="outline-primary" className="w-full">
                  Ver Detalhes
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ProfissionalLayout>
  );
};

export default ProfissionalDashboard;
