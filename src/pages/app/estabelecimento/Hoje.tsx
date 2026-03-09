import { useEffect, useState } from "react";
import { EstabelecimentoLayout } from "@/components/layouts/EstabelecimentoLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Phone, CheckCircle2, XCircle, Star } from "lucide-react";

const Hoje = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split("T")[0];

  const load = async () => {
    if (!user) return;
    const { data: estab } = await supabase.from("estabelecimentos").select("id").eq("user_id", user.id).single();
    if (!estab) { setLoading(false); return; }

    const { data } = await supabase.from("slots").select("*, candidaturas(*, profissionais(*))").eq("estabelecimento_id", estab.id).eq("data", today).eq("status", "confirmado");
    setSlots(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const handlePresenca = async (candidaturaId: string, slotId: string, compareceu: boolean) => {
    const status = compareceu ? "concluida" : "nao_compareceu";
    await supabase.from("candidaturas").update({ status }).eq("id", candidaturaId);
    if (compareceu) {
      await supabase.from("slots").update({ status: "concluido" }).eq("id", slotId);
    }
    toast({ title: compareceu ? "Presença confirmada!" : "Não comparecimento registrado." });
    load();
  };

  return (
    <EstabelecimentoLayout>
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold">Hoje - {new Date().toLocaleDateString("pt-BR")}</h1>
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
        ) : slots.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">Nenhum slot confirmado para hoje.</div>
        ) : (
          <div className="space-y-4">
            {slots.map(slot => (
              <div key={slot.id} className="bg-card rounded-xl p-5 border border-border">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-display font-semibold text-lg">{slot.funcao}</p>
                    <p className="text-sm text-muted-foreground">{slot.horario_inicio} - {slot.horario_fim} • R$ {Number(slot.valor).toFixed(2)}</p>
                  </div>
                </div>
                {slot.candidaturas?.filter((c: any) => c.status === "confirmada").map((c: any) => (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border mt-2">
                    <div>
                      <p className="font-semibold">{c.profissionais?.nome}</p>
                      <p className="text-sm text-muted-foreground">{c.profissionais?.whatsapp}</p>
                    </div>
                    <div className="flex gap-2">
                      {c.profissionais?.whatsapp && (
                        <Button size="sm" variant="outline" onClick={() => window.open(`https://wa.me/${c.profissionais.whatsapp.replace(/\D/g, "")}`, "_blank")}>
                          <Phone className="w-4 h-4" />
                        </Button>
                      )}
                      <Button size="sm" variant="hero" onClick={() => handlePresenca(c.id, slot.id, true)}>
                        <CheckCircle2 className="w-4 h-4 mr-1" />Compareceu
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handlePresenca(c.id, slot.id, false)}>
                        <XCircle className="w-4 h-4 mr-1" />Faltou
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </EstabelecimentoLayout>
  );
};

export default Hoje;
