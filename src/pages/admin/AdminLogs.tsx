import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { supabase } from "@/integrations/supabase/client";

const AdminLogs = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("admin_logs").select("*").order("created_at", { ascending: false }).limit(200).then(({ data }) => {
      setLogs(data || []);
      setLoading(false);
    });
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold">Logs de Administração</h1>
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
        ) : logs.length === 0 ? (
          <p className="text-muted-foreground">Nenhum log registrado.</p>
        ) : (
          <div className="bg-card rounded-xl border border-border overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 text-sm font-medium">Ação</th>
                  <th className="text-left p-3 text-sm font-medium">Detalhes</th>
                  <th className="text-left p-3 text-sm font-medium">Data</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(l => (
                  <tr key={l.id} className="border-t border-border">
                    <td className="p-3 text-sm font-medium">{l.acao}</td>
                    <td className="p-3 text-sm text-muted-foreground max-w-xs truncate">{l.detalhes ? JSON.stringify(l.detalhes) : "-"}</td>
                    <td className="p-3 text-sm text-muted-foreground">{new Date(l.created_at).toLocaleString("pt-BR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminLogs;
