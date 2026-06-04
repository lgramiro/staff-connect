import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { 
  Building2, 
  Users, 
  Briefcase, 
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  Activity
} from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { Link } from "react-router-dom";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { usePageTitle } from "@/hooks/usePageTitle";

const AdminDashboard = () => {
  usePageTitle("Admin | Tem Staff");
  const [counts, setCounts] = useState({ estabelecimentos: 0, profissionais: 0, slots: 0, candidaturas: 0 });
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [e, p, s, c, logs] = await Promise.all([
        supabase.from("estabelecimentos").select("id", { count: "exact", head: true }),
        supabase.from("profissionais").select("id", { count: "exact", head: true }),
        supabase.from("slots").select("id", { count: "exact", head: true }),
        supabase.from("candidaturas").select("id", { count: "exact", head: true }),
        supabase.from("admin_logs").select("*").order("created_at", { ascending: false }).limit(10),
      ]);
      setCounts({
        estabelecimentos: e.count || 0,
        profissionais: p.count || 0,
        slots: s.count || 0,
        candidaturas: c.count || 0,
      });
      setRecentLogs(logs.data || []);
      setLoading(false);
    };
    load();
  }, []);

  const stats = [
    { label: "Estabelecimentos", value: counts.estabelecimentos, icon: Building2, color: "bg-primary/10 text-primary" },
    { label: "Profissionais", value: counts.profissionais, icon: Users, color: "bg-success/10 text-success" },
    { label: "Slots", value: counts.slots, icon: Briefcase, color: "bg-warning/10 text-warning" },
    { label: "Candidaturas", value: counts.candidaturas, icon: TrendingUp, color: "bg-info/10 text-info" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Visão geral da plataforma Tem Staff</p>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <div key={index} className="bg-card rounded-xl p-5 border border-border">
                  <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center mb-4`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <p className="text-3xl font-display font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card rounded-xl p-6 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-lg font-semibold text-foreground">Ações Rápidas</h2>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" asChild className="h-auto p-4 flex-col gap-2">
                    <Link to="/admin/usuarios"><Users className="w-5 h-5" />Usuários</Link>
                  </Button>
                  <Button variant="outline" asChild className="h-auto p-4 flex-col gap-2">
                    <Link to="/admin/slots"><Briefcase className="w-5 h-5" />Slots</Link>
                  </Button>
                  <Button variant="outline" asChild className="h-auto p-4 flex-col gap-2">
                    <Link to="/admin/planos"><TrendingUp className="w-5 h-5" />Planos</Link>
                  </Button>
                  <Button variant="outline" asChild className="h-auto p-4 flex-col gap-2">
                    <Link to="/admin/settings"><AlertTriangle className="w-5 h-5" />Settings</Link>
                  </Button>
                </div>
              </div>

              <div className="bg-card rounded-xl p-6 border border-border">
                <h2 className="font-display text-lg font-semibold text-foreground mb-4">Atividade Recente</h2>
                {recentLogs.length === 0 ? (
                  <EmptyState icon={Activity} title="Nenhuma atividade registrada" />
                ) : (
                  <div className="space-y-3">
                    {recentLogs.map((log) => (
                      <div key={log.id} className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full mt-2 bg-primary" />
                        <div className="flex-1">
                          <p className="text-sm text-foreground">{log.acao}</p>
                          <p className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString("pt-BR")}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
