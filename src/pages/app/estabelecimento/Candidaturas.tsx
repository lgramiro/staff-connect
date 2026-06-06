import { useState, useMemo } from "react";
import { EstabelecimentoLayout } from "@/components/layouts/EstabelecimentoLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { 
  CheckCircle2, 
  XCircle, 
  User, 
  Star, 
  Instagram, 
  Linkedin, 
  Globe, 
  MapPin, 
  Briefcase, 
  Inbox, 
  Heart,
  ChevronRight,
  Send,
  ExternalLink
} from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { criarNotificacao, getProfissionalUserId } from "@/lib/notificacoes";
import { useEstabelecimentoQuery } from "@/hooks/queries/useEstabelecimento";
import { useCandidaturasByEstabelecimento, useAtualizarCandidatura, useCriarCandidatura } from "@/hooks/queries/useCandidaturas";
import { useSlotsByEstabelecimento, useUpdateSlotStatus } from "@/hooks/queries/useSlots";
import { useMatchingProfissionais } from "@/hooks/queries/useMatching";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const Candidaturas = () => {
  const { user } = useAuth();
  const { data: estab } = useEstabelecimentoQuery(user?.id);
  const { data: candidaturas = [], isLoading: loading } = useCandidaturasByEstabelecimento(estab?.id);
  
  const atualizarCandidatura = useAtualizarCandidatura();
  const updateSlotStatus = useUpdateSlotStatus();

  const handleAction = async (id: string, status: string, slotId: string, profissionalId: string) => {
    atualizarCandidatura.mutate({ id, status });
    
    if (status === "aprovada") {
      updateSlotStatus.mutate({ id: slotId, status: "reservado" });
      const profUserId = await getProfissionalUserId(profissionalId);
      if (profUserId) {
        await criarNotificacao({
          user_id: profUserId,
          titulo: "Sua candidatura foi aprovada!",
          mensagem: "Confirme sua presença para garantir a vaga.",
          tipo: "aprovacao",
          referencia_id: id,
        });
      }
    } else if (status === "concluida") {
      updateSlotStatus.mutate({ id: slotId, status: "concluido" });
      const profUserId = await getProfissionalUserId(profissionalId);
      if (profUserId) {
        await criarNotificacao({
          user_id: profUserId,
          titulo: "Serviço concluído! 🎉",
          mensagem: "O estabelecimento finalizou seu serviço. Avalie sua experiência!",
          tipo: "candidatura",
          referencia_id: id,
        });
      }
    }
  };

  const renderStars = (score: number) => {
    const full = Math.floor(score);
    const half = score - full >= 0.5;
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i < full || (i === full && half);
          return (
            <Star
              key={i}
              className={`w-3 h-3 ${filled ? "fill-warning text-warning" : "text-muted-foreground/30"}`}
            />
          );
        })}
      </div>
    );
  };

  const ProfileDialog = ({ prof }: { prof: any }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Ver perfil</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Perfil do Profissional</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
            <Avatar className="w-24 h-24 border-2 border-primary/20">
              <AvatarImage src={prof?.foto_url} alt={prof?.nome} />
              <AvatarFallback><User className="w-12 h-12" /></AvatarFallback>
            </Avatar>
            
            <div className="space-y-2 flex-1">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:justify-between">
                <h2 className="text-2xl font-bold">{prof?.nome}</h2>
                <div className="flex items-center gap-2 justify-center">
                  <span className="font-bold text-lg">{Number(prof?.trust_score || 0).toFixed(1)}</span>
                  {renderStars(Number(prof?.trust_score || 0))}
                  <span className="text-sm text-muted-foreground">({prof?.total_avaliacoes || 0})</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {prof?.cidade}, {prof?.estado}
                </Badge>
                {prof?.diaria_minima && (
                  <Badge variant="outline">Diária a partir de R$ {Number(prof.diaria_minima).toFixed(2)}</Badge>
                )}
              </div>

              <div className="flex gap-3 justify-center md:justify-start pt-2">
                {prof?.instagram && (
                  <a href={prof.instagram} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary">
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {prof?.linkedin && (
                  <a href={prof.linkedin} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary">
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}
                {prof?.portfolio && (
                  <a href={prof.portfolio} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary">
                    <Globe className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold flex items-center gap-2 mb-2">
                  <Briefcase className="w-4 h-4 text-primary" /> Funções
                </h3>
                <div className="flex flex-wrap gap-2">
                  {prof?.funcoes?.map((f: string) => (
                    <Badge key={f} variant="default">{f}</Badge>
                  ))}
                  {(!prof?.funcoes || prof.funcoes.length === 0) && <p className="text-sm text-muted-foreground">Não informadas</p>}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Idiomas</h3>
                <div className="flex flex-wrap gap-2">
                  {prof?.idiomas?.map((i: string) => (
                    <Badge key={i} variant="outline">{i}</Badge>
                  ))}
                  {(!prof?.idiomas || prof.idiomas.length === 0) && <p className="text-sm text-muted-foreground">Não informados</p>}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Experiência</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {prof?.experiencia || "Nenhuma experiência detalhada informada."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  const tabs = [
    { id: "pendentes", label: "Pendentes", statuses: ["enviada"] },
    { id: "aprovadas", label: "Aprovadas", statuses: ["aprovada", "confirmada"] },
    { id: "concluidas", label: "Concluídas", statuses: ["concluida"] },
  ];

  return (
    <EstabelecimentoLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="font-display text-2xl font-bold">Candidaturas</h1>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : candidaturas.length === 0 ? (
          <EmptyState icon={Inbox} title="Nenhuma candidatura recebida ainda" description="As candidaturas aparecerão aqui assim que profissionais se inscreverem nos seus slots." />
        ) : (
          <Tabs defaultValue="pendentes" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0 mb-6">
              {tabs.map(t => (
                <TabsTrigger 
                  key={t.id} 
                  value={t.id}
                  className="data-[state=active]:border-primary data-[state=active]:bg-transparent border-b-2 border-transparent rounded-none px-6 py-3 font-semibold"
                >
                  {t.label}
                  <Badge variant="secondary" className="ml-2 bg-muted">
                    {candidaturas.filter(c => t.statuses.includes(c.status)).length}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>

            {tabs.map(t => (
              <TabsContent key={t.id} value={t.id} className="space-y-3 mt-0">
                {candidaturas.filter(c => t.statuses.includes(c.status)).length === 0 ? (
                  <EmptyState icon={Inbox} title="Nenhuma candidatura nesta categoria" />
                ) : (
                  candidaturas
                    .filter(c => t.statuses.includes(c.status))
                    .map(c => (
                      <div key={c.id} className="bg-card rounded-xl p-5 border border-border hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <Avatar className="w-12 h-12 border border-border">
                              <AvatarImage src={c.profissionais_publicos?.foto_url} alt={c.profissionais_publicos?.nome} />
                              <AvatarFallback><User className="w-6 h-6" /></AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-bold text-lg leading-none">{c.profissionais_publicos?.nome || "Profissional"}</p>
                                {renderStars(Number(c.profissionais_publicos?.trust_score || 0))}
                              </div>
                              <p className="text-sm text-muted-foreground font-medium">
                                {c.slots?.funcao} • {c.slots?.data} • {c.slots?.horario_inicio?.slice(0, 5)}-{c.slots?.horario_fim?.slice(0, 5)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 ml-16 md:ml-0">
                            <ProfileDialog prof={c.profissionais_publicos} />
                            
                            {c.status === "enviada" && (
                              <>
                                <Button size="sm" variant="hero" onClick={() => handleAction(c.id, "aprovada", c.slot_id, c.profissional_id)}>
                                  <CheckCircle2 className="w-4 h-4 mr-1" /> Aprovar
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => handleAction(c.id, "recusada", c.slot_id, c.profissional_id)}>
                                  <XCircle className="w-4 h-4 mr-1" /> Recusar
                                </Button>
                              </>
                            )}

                            {(c.status === "aprovada" || c.status === "confirmada") && (
                              <Button size="sm" variant="hero" onClick={() => handleAction(c.id, "concluida", c.slot_id, c.profissional_id)}>
                                <CheckCircle2 className="w-4 h-4 mr-1" /> Finalizar Serviço
                              </Button>
                            )}

                            {c.status === "concluida" && (
                              <Badge className="bg-blue-500/20 text-blue-500 hover:bg-blue-500/20 border-none">
                                Concluída
                              </Badge>
                            )}

                            {c.status === "recusada" && (
                              <Badge className="bg-destructive/20 text-destructive hover:bg-destructive/20 border-none">
                                Recusada
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </EstabelecimentoLayout>
  );
};

export default Candidaturas;