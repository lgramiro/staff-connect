import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const AdminSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [edits, setEdits] = useState<Record<string, string>>({});

  useEffect(() => {
    supabase.from("settings").select("*").order("chave").then(({ data }) => {
      setSettings(data || []);
      const e: Record<string, string> = {};
      (data || []).forEach(s => { e[s.id] = s.valor || ""; });
      setEdits(e);
      setLoading(false);
    });
  }, []);

  const handleSave = async (id: string) => {
    await supabase.from("settings").update({ valor: edits[id] }).eq("id", id);
    toast({ title: "Configuração salva!" });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold">Configurações</h1>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="space-y-4">
            {settings.map(s => (
              <div key={s.id} className="bg-card rounded-xl p-4 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold">{s.chave}</p>
                    <p className="text-xs text-muted-foreground">{s.descricao}</p>
                  </div>
                  <Button size="sm" variant="hero" onClick={() => handleSave(s.id)}>Salvar</Button>
                </div>
                <Input value={edits[s.id] || ""} onChange={e => setEdits(prev => ({ ...prev, [s.id]: e.target.value }))} />
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
