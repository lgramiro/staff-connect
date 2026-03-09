import { useEffect, useState } from "react";
import { EstabelecimentoLayout } from "@/components/layouts/EstabelecimentoLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, User } from "lucide-react";

const Candidaturas = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [candidaturas, setCandidaturas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    const { data: estab } = await supabase.from("estabelecimentos").select("id").eq("user_id", user.id).single();
    if (!estab) return;

    const { data: slots } = await supabase.from("slots").select("id").eq("estabelecimento_id", estab.id);
    if (!slots || slots.length === 0) { setLoading(false); return; }

    const slotIds = slots.map(s => s.id);
    const { data } = await supabase.from("candidaturas").select("*, profissionais(*), slots(*)").in("slot_id", slotIds).order("created_at", { ascending: false });
    setCandidaturas(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const handleAction = async (id: string, status: string, slotId: string) => {
    await supabase.from("candidaturas").update({ status }).eq("id", id);
    if (status === "aprovada") {
      await supabase.from("slots").update({ status: "reservado" }).eq("id", slotId);
    }
    toast({ title: status === "aprovada" ? "Candidatura aprovada!" : "Candidatura recusada." });
    load();
  };

  return (
    <EstabelecimentoLayout>
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold">Candidaturas</h1>
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
        ) : candidaturas.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">Nenhuma candidatura recebida ainda.</div>
        ) : (
          <div className="space-y-3">
            {candidaturas.map(c => (
              <div key={c.id} className="bg-card rounded-xl p-4 border border-border">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{c.profissionais?.nome || "Profissional"}</p>
                      <p className="text-sm text-muted-foreground">{c.slots?.funcao} • {c.slots?.data} • {c.slots?.horario_inicio}-{c.slots?.horario_fim}</p>
                      <p className="text-sm text-muted-foreground">Trust Score: {Number(c.profissionais?.trust_score || 0).toFixed(1)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {c.status === "enviada" ? (
                      <>
                        <Button size="sm" variant="hero" onClick={() => handleAction(c.id, "aprovada", c.slot_id)}>
                          <CheckCircle2 className="w-4 h-4 mr-1" />Aprovar
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleAction(c.id, "recusada", c.slot_id)}>
                          <XCircle className="w-4 h-4 mr-1" />Recusar
                        </Button>
                      </>
                    ) : (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        c.status === "aprovada" ? "bg-success/20 text-success" :
                        c.status === "confirmada" ? "bg-primary/20 text-primary" :
                        c.status === "recusada" ? "bg-destructive/20 text-destructive" :
                        "bg-muted text-muted-foreground"
                      }`}>{c.status}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </EstabelecimentoLayout>
  );
};

export default Candidaturas;
