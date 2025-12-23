import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Users, 
  Briefcase, 
  FileText,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  ArrowUpRight
} from "lucide-react";

const AdminDashboard = () => {
  const stats = [
    { 
      label: "Estabelecimentos", 
      value: "127", 
      change: "+12%", 
      trend: "up",
      icon: Building2, 
      color: "bg-primary/10 text-primary" 
    },
    { 
      label: "Profissionais", 
      value: "2,458", 
      change: "+8%", 
      trend: "up",
      icon: Users, 
      color: "bg-success/10 text-success" 
    },
    { 
      label: "Vagas Ativas", 
      value: "342", 
      change: "+23%", 
      trend: "up",
      icon: Briefcase, 
      color: "bg-warning/10 text-warning" 
    },
    { 
      label: "Documentos Gerados", 
      value: "1,891", 
      change: "+15%", 
      trend: "up",
      icon: FileText, 
      color: "bg-info/10 text-info" 
    },
  ];

  const alerts = [
    { type: "warning", message: "3 assinaturas vencem em 7 dias", action: "Ver lista" },
    { type: "info", message: "12 estabelecimentos próximos do limite de vagas", action: "Verificar" },
    { type: "error", message: "2 denúncias pendentes de análise", action: "Analisar" },
  ];

  const recentActivity = [
    { type: "signup", message: "Novo estabelecimento: Restaurante Bella Vista", time: "2 min atrás" },
    { type: "subscription", message: "Upgrade de plano: Buffet Elegance (Moderado → Completo)", time: "15 min atrás" },
    { type: "document", message: "Convite gerado: João Silva → Restaurante Sabor", time: "32 min atrás" },
    { type: "signup", message: "Novo profissional: Maria Santos (Chef)", time: "1h atrás" },
    { type: "payment", message: "Pagamento confirmado: Hotel Grand Plaza", time: "2h atrás" },
  ];

  const topEstablishments = [
    { name: "Hotel Grand Plaza", plan: "Completo", jobs: 45, professionals: 128 },
    { name: "Buffet Elegance", plan: "Completo", jobs: 38, professionals: 92 },
    { name: "Restaurante La Maison", plan: "Moderado", jobs: 24, professionals: 56 },
    { name: "Rooftop Bar Sky", plan: "Moderado", jobs: 18, professionals: 34 },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Visão geral da plataforma Tem Staff
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Exportar Relatório</Button>
            <Button variant="hero">Ver Métricas</Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-card rounded-xl p-5 border border-border">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  stat.trend === "up" ? "text-success" : "text-destructive"
                }`}>
                  {stat.trend === "up" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {stat.change}
                </div>
              </div>
              <p className="text-3xl font-display font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Alerts */}
          <div className="lg:col-span-2 bg-card rounded-xl p-6 border border-border">
            <h2 className="font-display text-lg font-semibold text-foreground mb-4">
              Alertas & Ações Pendentes
            </h2>
            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <div 
                  key={index} 
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    alert.type === "error" ? "bg-destructive/10 border border-destructive/20" :
                    alert.type === "warning" ? "bg-warning/10 border border-warning/20" :
                    "bg-info/10 border border-info/20"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className={`w-5 h-5 ${
                      alert.type === "error" ? "text-destructive" :
                      alert.type === "warning" ? "text-warning" :
                      "text-info"
                    }`} />
                    <span className="text-sm text-foreground">{alert.message}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary">
                    {alert.action}
                    <ArrowUpRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Card */}
          <div className="bg-gradient-hero rounded-xl p-6 text-primary-foreground">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-primary-foreground/70 text-sm">Receita do Mês</p>
                <p className="text-2xl font-display font-bold">R$ 12.450</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-primary-foreground/70">Assinaturas ativas</span>
                <span className="font-medium">87</span>
              </div>
              <div className="flex justify-between">
                <span className="text-primary-foreground/70">Novos este mês</span>
                <span className="font-medium">+12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-primary-foreground/70">Churn</span>
                <span className="font-medium">3</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <h2 className="font-display text-lg font-semibold text-foreground mb-4">
              Atividade Recente
            </h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === "signup" ? "bg-success" :
                    activity.type === "subscription" ? "bg-primary" :
                    activity.type === "document" ? "bg-info" :
                    "bg-warning"
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Establishments */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <h2 className="font-display text-lg font-semibold text-foreground mb-4">
              Top Estabelecimentos
            </h2>
            <div className="space-y-4">
              {topEstablishments.map((est, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{est.name}</p>
                      <p className="text-xs text-muted-foreground">Plano {est.plan}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{est.jobs} vagas</p>
                    <p className="text-xs text-muted-foreground">{est.professionals} profissionais</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
