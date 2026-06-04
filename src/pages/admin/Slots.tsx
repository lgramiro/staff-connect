import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const AdminSlots = () => {
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("slots").select("*, estabelecimentos(nome)").order("data", { ascending: false }).limit(100).then(({ data }) => {
      setSlots(data || []);
      setLoading(false);
    });
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold">Slots</h1>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="bg-card rounded-xl border border-border overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 text-sm font-medium">Estabelecimento</th>
                  <th className="text-left p-3 text-sm font-medium">Função</th>
                  <th className="text-left p-3 text-sm font-medium">Data</th>
                  <th className="text-left p-3 text-sm font-medium">Horário</th>
                  <th className="text-left p-3 text-sm font-medium">Valor</th>
                  <th className="text-left p-3 text-sm font-medium">Status</th>
                  <th className="text-left p-3 text-sm font-medium">Urgente</th>
                </tr>
              </thead>
              <tbody>
                {slots.map(s => (
                  <tr key={s.id} className="border-t border-border">
                    <td className="p-3 text-sm">{s.estabelecimentos?.nome || "-"}</td>
                    <td className="p-3 text-sm">{s.funcao}</td>
                    <td className="p-3 text-sm">{s.data}</td>
                    <td className="p-3 text-sm">{s.horario_inicio}-{s.horario_fim}</td>
                    <td className="p-3 text-sm">R$ {Number(s.valor).toFixed(2)}</td>
                    <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs ${s.status === "confirmado" ? "bg-success/20 text-success" : s.status === "aberto" ? "bg-info/20 text-info" : "bg-muted text-muted-foreground"}`}>{s.status}</span></td>
                    <td className="p-3 text-sm">{s.urgente ? "🔥" : "-"}</td>
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

export default AdminSlots;
