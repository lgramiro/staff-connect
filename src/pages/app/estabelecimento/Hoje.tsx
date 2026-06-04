import { EstabelecimentoLayout } from "@/components/layouts/EstabelecimentoLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Phone, CheckCircle2, XCircle, CalendarX } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { useEstabelecimentoQuery } from "@/hooks/queries/useEstabelecimento";
import { useSlotsByEstabelecimento, useUpdateSlotStatus } from "@/hooks/queries/useSlots";
import { useAtualizarCandidatura } from "@/hooks/queries/useCandidaturas";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const Hoje = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { data: estab } = useEstabelecimentoQuery(user?.id);
  const today = new Date().toISOString().split("T")[0];
  
  const { data: slots = [], isLoading: loading } = useSlotsByEstabelecimento(estab?.id, { date: today, status: "confirmado" });
  
  const atualizarCandidatura = useAtualizarCandidatura();
  const updateSlotStatus = useUpdateSlotStatus();

  const handlePresenca = async (candidaturaId: string, slotId: string, compareceu: boolean) => {
    const status = compareceu ? "concluida" : "nao_compareceu";
    
    atualizarCandidatura.mutate({ id: candidaturaId, status });
    
    if (compareceu) {
      updateSlotStatus.mutate({ id: slotId, status: "concluido" });
    }
    
    toast({ title: compareceu ? "Presença confirmada!" : "Não comparecimento registrado." });
  };


  return (
    <EstabelecimentoLayout>
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold">Hoje - {new Date().toLocaleDateString("pt-BR")}</h1>
        {loading ? (
          <LoadingSpinner />
        ) : slots.length === 0 ? (
          <EmptyState icon={CalendarX} title="Nenhum slot confirmado para hoje" description="Aproveite para criar novas escalas ou conferir candidaturas pendentes." />
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
