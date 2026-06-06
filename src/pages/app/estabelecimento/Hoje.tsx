import { useState, useEffect } from "react";
import { EstabelecimentoLayout } from "@/components/layouts/EstabelecimentoLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Phone, CheckCircle2, XCircle, CalendarX, Star, AlertTriangle, ShieldCheck, AlertCircle } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { useEstabelecimentoQuery } from "@/hooks/queries/useEstabelecimento";
import { useSlotsByEstabelecimento, useUpdateSlotStatus } from "@/hooks/queries/useSlots";
import { useAtualizarCandidatura } from "@/hooks/queries/useCandidaturas";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { criarNotificacao, getProfissionalUserId } from "@/lib/notificacoes";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Hoje = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { data: estab } = useEstabelecimentoQuery(user?.id);
  const today = new Date().toISOString().split("T")[0];
  
  const { data: slots = [], isLoading: loading, refetch } = useSlotsByEstabelecimento(estab?.id, { date: today, status: "confirmado" });
  
  const atualizarCandidatura = useAtualizarCandidatura();
  const updateSlotStatus = useUpdateSlotStatus();

  const [taxasComparecimento, setTaxasComparecimento] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchTaxas = async () => {
      const profIds = slots.flatMap(slot => 
        slot.candidaturas
          ?.filter((c: any) => c.status === "confirmada")
          .map((c: any) => c.profissional_id) || []
      );

      if (profIds.length === 0) return;

      const uniqueIds = Array.from(new Set(profIds));
      
      const { data: allCands } = await supabase
        .from("candidaturas")
        .select("profissional_id, status")
        .in("profissional_id", uniqueIds)
        .in("status", ["concluida", "no_show", "nao_compareceu"]);

      const stats: Record<string, number> = {};
      uniqueIds.forEach(id => {
        const profCands = allCands?.filter(c => c.profissional_id === id) || [];
        const concluida = profCands.filter(c => c.status === "concluida").length;
        const faltas = profCands.filter(c => ["no_show", "nao_compareceu"].includes(c.status)).length;
        const total = concluida + faltas;
        stats[id] = total > 0 ? (concluida / total) * 100 : 100;
      });
      setTaxasComparecimento(stats);
    };

    if (slots.length > 0) {
      fetchTaxas();
    }
  }, [slots]);

  const handlePresenca = async (candidaturaId: string, slotId: string, compareceu: boolean, profissionalId: string) => {
    const status = compareceu ? "concluida" : "no_show";
    
    // 1. Atualizar candidatura
    await atualizarCandidatura.mutateAsync({ id: candidaturaId, status });
    
    if (compareceu) {
      // 2. Atualizar slot
      await updateSlotStatus.mutateAsync({ id: slotId, status: "concluido" });
      
      // 3. Recalcular Trust Score
      const { data: prof } = await supabase
        .from("profissionais")
        .select("user_id")
        .eq("id", profissionalId)
        .single();

      if (prof) {
        const { data: avs } = await supabase
          .from("avaliacoes")
          .select("nota")
          .eq("avaliado_id", prof.user_id);

        if (avs && avs.length > 0) {
          const media = avs.reduce((acc, a) => acc + a.nota, 0) / avs.length;
          await supabase
            .from("profissionais")
            .update({ trust_score: media, total_avaliacoes: avs.length })
            .eq("id", profissionalId);
        }

        // Notificar
        const profUserId = await getProfissionalUserId(profissionalId);
        if (profUserId) {
          await criarNotificacao({
            user_id: profUserId,
            titulo: "Serviço concluído! 🎉",
            mensagem: "O estabelecimento confirmou sua presença. Avalie sua experiência!",
            tipo: "candidatura",
            referencia_id: candidaturaId,
          });
        }
      }
      
      toast({ title: "Presença confirmada!", description: "Você pode avaliar o profissional agora." });
    } else {
      // 2. Registrar ocorrência
      await supabase.from("ocorrencias_slots").insert({
        slot_id: slotId,
        profissional_id: profissionalId,
        tipo: "no_show",
        descricao: "Profissional não compareceu",
      });

      // 3. Penalizar Trust Score
      const { data: prof } = await supabase
        .from("profissionais")
        .select("trust_score")
        .eq("id", profissionalId)
        .single();
      
      if (prof) {
        const novoScore = Math.max(0, Number(prof.trust_score || 0) - 0.3);
        await supabase
          .from("profissionais")
          .update({ trust_score: novoScore })
          .eq("id", profissionalId);
      }

      toast({ 
        title: "No-show registrado", 
        description: "O profissional foi penalizado.",
        variant: "destructive"
      });
    }

    refetch();
  };

  const renderStars = (score: number) => {
    const full = Math.floor(score);
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={`w-3 h-3 ${i < full ? "fill-warning text-warning" : "text-muted-foreground/30"}`} />
        ))}
      </div>
    );
  };

  const getRiscoBadge = (taxa: number) => {
    if (taxa < 70) return <Badge variant="destructive" className="gap-1"><AlertCircle className="w-3 h-3" /> Risco de no-show</Badge>;
    if (taxa < 90) return <Badge className="bg-warning text-warning-foreground hover:bg-warning/90 gap-1"><AlertTriangle className="w-3 h-3" /> Atenção</Badge>;
    return <Badge className="bg-success text-success-foreground hover:bg-success/90 gap-1"><ShieldCheck className="w-3 h-3" /> Confiável</Badge>;
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
              <div key={slot.id} className="bg-card rounded-xl p-5 border border-border shadow-sm">
                <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
                  <div>
                    <p className="font-display font-bold text-lg text-primary">{slot.funcao}</p>
                    <p className="text-sm text-muted-foreground">{slot.horario_inicio?.slice(0,5)} - {slot.horario_fim?.slice(0,5)} • R$ {Number(slot.valor).toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {slot.candidaturas?.filter((c: any) => c.status === "confirmada").map((c: any) => {
                    const taxa = taxasComparecimento[c.profissional_id] ?? 100;
                    return (
                      <div key={c.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl bg-muted/20 border border-border gap-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-12 h-12 border border-border">
                            <AvatarImage src={c.profissionais?.foto_url} />
                            <AvatarFallback>{c.profissionais?.nome?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-foreground">{c.profissionais?.nome}</p>
                              {getRiscoBadge(taxa)}
                            </div>
                            <div className="flex items-center gap-3 text-xs">
                              {renderStars(Number(c.profissionais?.trust_score || 0))}
                              <span className="text-muted-foreground font-medium">Comparecimento: {taxa.toFixed(0)}%</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {c.profissionais?.whatsapp && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="bg-success/5 hover:bg-success/10 border-success/20 text-success"
                              onClick={() => window.open(`https://wa.me/${c.profissionais.whatsapp.replace(/\D/g, "")}`, "_blank")}
                            >
                              <Phone className="w-4 h-4 mr-2" /> WhatsApp
                            </Button>
                          )}
                          <Button size="sm" variant="hero" onClick={() => handlePresenca(c.id, slot.id, true, c.profissional_id)}>
                            <CheckCircle2 className="w-4 h-4 mr-1" /> Compareceu
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handlePresenca(c.id, slot.id, false, c.profissional_id)}>
                            <XCircle className="w-4 h-4 mr-1" /> Faltou
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </EstabelecimentoLayout>
  );
};

export default Hoje;