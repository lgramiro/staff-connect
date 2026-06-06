import { useState, useMemo } from "react";
import { ProfissionalLayout } from "@/components/layouts/ProfissionalLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useCandidaturasByProfissional, useAtualizarCandidatura } from "@/hooks/queries/useCandidaturas";
import { useProfissionalQuery } from "@/hooks/queries/useProfissional";
import { useUpdateSlotStatus } from "@/hooks/queries/useSlots";
import { criarNotificacao, getEstabelecimentoUserIdBySlot } from "@/lib/notificacoes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { CheckCircle2, XCircle, Clock, Calendar, MapPin, DollarSign, Star, Inbox } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const MinhasCandidaturas = () => {
  const { user } = useAuth();
  const { data: prof } = useProfissionalQuery(user?.id);
  const { data: candidaturas = [], isLoading } = useCandidaturasByProfissional(prof?.id);
  
  const atualizarCandidatura = useAtualizarCandidatura();
  const updateSlotStatus = useUpdateSlotStatus();

  // Buscar avaliações de estabelecimentos feitas pelo profissional
  const { data: avaliacoesEstab = [], refetch: refetchAvaliacoes } = useQuery({
    queryKey: ["avaliacoes-estabelecimentos-feitas", prof?.id],
    queryFn: async () => {
      if (!prof?.id) return [];
      const { data } = await supabase
        .from("avaliacoes_estabelecimentos")
        .select("candidatura_id")
        .eq("profissional_id", prof.id);
      return data || [];
    },
    enabled: !!prof?.id,
  });

  const handleConfirm = async (id: string, slotId: string, accept: boolean) => {
    if (accept) {
      atualizarCandidatura.mutate({ id, status: "confirmada" });
      updateSlotStatus.mutate({ id: slotId, status: "confirmado" });
      
      const estabUserId = await getEstabelecimentoUserIdBySlot(slotId);
      if (estabUserId) {
        await criarNotificacao({
          user_id: estabUserId,
          titulo: "Profissional confirmou presença",
          mensagem: "Um profissional confirmou presença em uma vaga.",
          tipo: "confirmacao",
          referencia_id: id,
        });
      }
    } else {
      atualizarCandidatura.mutate({ id, status: "recusada" });
    }
  };

  const handleFinalize = async (id: string, slotId: string) => {
    atualizarCandidatura.mutate({ id, status: "concluida" });
    updateSlotStatus.mutate({ id: slotId, status: "concluido" });
    
    const estabUserId = await getEstabelecimentoUserIdBySlot(slotId);
    if (estabUserId) {
      await criarNotificacao({
        user_id: estabUserId,
        titulo: "Serviço concluído pelo profissional",
        mensagem: "O profissional marcou o serviço como concluído. Avalie o desempenho!",
        tipo: "candidatura",
        referencia_id: id,
      });
    }
  };

  const groups = useMemo(() => {
    return {
      analise: candidaturas.filter(c => c.status === "enviada"),
      aprovadas: candidaturas.filter(c => ["aprovada", "confirmada"].includes(c.status)),
      concluidas: candidaturas.filter(c => c.status === "concluida"),
      recusadas: candidaturas.filter(c => ["recusada", "nao_compareceu"].includes(c.status)),
    };
  }, [candidaturas]);

  const statusInfo: Record<string, { label: string; color: string }> = {
    enviada: { label: "Em análise", color: "text-blue-500 bg-blue-500/10" },
    aprovada: { label: "Aguardando sua confirmação", color: "text-amber-500 bg-amber-500/10" },
    confirmada: { label: "Confirmada", color: "text-emerald-500 bg-emerald-500/10" },
    concluida: { label: "Concluída", color: "text-gray-500 bg-gray-500/10" },
    recusada: { label: "Recusada", color: "text-red-500 bg-red-500/10" },
    nao_compareceu: { label: "Não compareceu", color: "text-red-700 bg-red-700/10" },
  };

  const [evaluating, setEvaluating] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmitEvaluation = async () => {
    if (!evaluating || rating === 0) return;
    
    setIsSubmitting(true);
    const { error } = await supabase.from("avaliacoes_estabelecimentos").insert({
      candidatura_id: evaluating.id,
      profissional_id: prof.id,
      estabelecimento_id: evaluating.slots.estabelecimento_id,
      nota: rating,
      comentario: comment
    });

    setIsSubmitting(false);
    if (error) {
      toast({ title: "Erro ao enviar avaliação", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Avaliação enviada com sucesso!" });
      setEvaluating(null);
      setRating(0);
      setComment("");
      refetchAvaliacoes();
    }
  };

  const CandidaturaCard = ({ c }: { c: any }) => {
    const jaAvaliou = avaliacoesEstab.some(a => a.candidatura_id === c.id);
    
    return (
      <Card key={c.id} className="p-4 border-border overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg">{c.slots?.funcao}</h3>
              <Badge variant="outline" className={statusInfo[c.status]?.color || ""}>
                {statusInfo[c.status]?.label || c.status}
              </Badge>
            </div>
            <Link to={`/app/profissional/estabelecimento/${c.slots?.estabelecimento_id}`} className="text-primary hover:underline font-medium">
              {c.slots?.estabelecimentos?.nome}
            </Link>
            
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-2">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{c.slots?.data}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{c.slots?.horario_inicio?.slice(0, 5)} - {c.slots?.horario_fim?.slice(0, 5)}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{c.slots?.estabelecimentos?.cidade}</span>
              </div>
              <div className="flex items-center gap-1 font-semibold text-foreground">
                <DollarSign className="w-4 h-4" />
                <span>R$ {Number(c.slots?.valor || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 min-w-[140px]">
            {c.status === "aprovada" && (
              <>
                <Button 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" 
                  onClick={() => handleConfirm(c.id, c.slot_id, true)}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Confirmar
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full text-red-500 border-red-200 hover:bg-red-50"
                  onClick={() => handleConfirm(c.id, c.slot_id, false)}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Recusar
                </Button>
              </>
            )}

            {c.status === "confirmada" && (
              <Button 
                variant="hero" 
                className="w-full"
                onClick={() => handleFinalize(c.id, c.slot_id)}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Concluir Serviço
              </Button>
            )}

            {c.status === "concluida" && (
              <div className="space-y-2">
                <Badge variant="outline" className={jaAvaliou ? "bg-emerald-50 text-emerald-700 border-emerald-200 w-full justify-center" : "bg-blue-50 text-blue-700 border-blue-200 w-full justify-center"}>
                  {jaAvaliou ? "Avaliado" : "Pendente de avaliação"}
                </Badge>
                {!jaAvaliou && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="hero" size="sm" className="w-full" onClick={() => setEvaluating(c)}>
                        <Star className="w-4 h-4 mr-2" />
                        Avaliar Estabelecimento
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Avaliar {c.slots?.estabelecimentos?.nome}</DialogTitle>
                        <DialogDescription>
                          Sua avaliação ajuda outros profissionais a escolherem os melhores lugares para trabalhar.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="flex flex-col items-center gap-3">
                          <p className="font-medium text-sm text-muted-foreground">Como foi sua experiência?</p>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(n => (
                              <button
                                key={n}
                                onClick={() => setRating(n)}
                                className="transition-transform active:scale-90"
                              >
                                <Star 
                                  className={`w-10 h-10 ${rating >= n ? "fill-warning text-warning" : "text-muted-foreground/30"}`} 
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Comentário (opcional)</label>
                          <Textarea 
                            placeholder="Conte-nos como foi trabalhar lá..." 
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="resize-none"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="ghost">Cancelar</Button>
                        </DialogClose>
                        <Button variant="hero" onClick={handleSubmitEvaluation} disabled={rating === 0 || isSubmitting}>
                          {isSubmitting ? "Enviando..." : "Enviar Avaliação"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  };

  const EmptyMsg = ({ message }: { message: string }) => (
    <EmptyState icon={Inbox} title={message} />
  );

  return (
    <ProfissionalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Minhas Candidaturas</h1>
          <p className="text-muted-foreground">Acompanhe o status das suas solicitações e confirme seus trabalhos.</p>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <Tabs defaultValue="analise" className="w-full">
            <TabsList className="grid grid-cols-4 w-full h-auto p-1 mb-6">
              <TabsTrigger value="analise" className="py-2 flex items-center gap-2">
                Análise
                <Badge variant="secondary" className="h-5 min-w-5 px-1 flex items-center justify-center">
                  {groups.analise.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="aprovadas" className="py-2 flex items-center gap-2">
                Aprovadas
                <Badge variant="secondary" className="h-5 min-w-5 px-1 flex items-center justify-center">
                  {groups.aprovadas.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="concluidas" className="py-2 flex items-center gap-2">
                Concluídas
                <Badge variant="secondary" className="h-5 min-w-5 px-1 flex items-center justify-center">
                  {groups.concluidas.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="recusadas" className="py-2 flex items-center gap-2">
                Recusadas
                <Badge variant="secondary" className="h-5 min-w-5 px-1 flex items-center justify-center">
                  {groups.recusadas.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analise" className="space-y-4">
              {groups.analise.length > 0 ? (
                groups.analise.map(c => <CandidaturaCard key={c.id} c={c} />)
              ) : (
                <EmptyMsg message="Nenhuma candidatura em análise no momento." />
              )}
            </TabsContent>

            <TabsContent value="aprovadas" className="space-y-4">
              {groups.aprovadas.length > 0 ? (
                groups.aprovadas.map(c => <CandidaturaCard key={c.id} c={c} />)
              ) : (
                <EmptyMsg message="Você ainda não tem candidaturas aprovadas." />
              )}
            </TabsContent>

            <TabsContent value="concluidas" className="space-y-4">
              {groups.concluidas.length > 0 ? (
                groups.concluidas.map(c => <CandidaturaCard key={c.id} c={c} />)
              ) : (
                <EmptyMsg message="Nenhum trabalho concluído encontrado." />
              )}
            </TabsContent>

            <TabsContent value="recusadas" className="space-y-4">
              {groups.recusadas.length > 0 ? (
                groups.recusadas.map(c => <CandidaturaCard key={c.id} c={c} />)
              ) : (
                <EmptyMsg message="Nenhuma candidatura recusada." />
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </ProfissionalLayout>
  );
};

export default MinhasCandidaturas;