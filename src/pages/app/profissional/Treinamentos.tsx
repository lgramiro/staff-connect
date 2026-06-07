import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useTreinamentos, useTreinamentosConcluidos, useMarcarConcluido } from "@/hooks/queries/useTreinamentos";
import { useProfissionalQuery, useProfissionalMutation } from "@/hooks/queries/useProfissional";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BookOpen, CheckCircle2, Circle, Award, AlertCircle, Check, 
  ChevronLeft, ChevronRight, PartyPopper, Star, Clock, AlertTriangle, 
  UserCheck, Shirt, ShieldCheck, MessageSquare, TrendingUp,
  Thermometer, ShieldAlert, LucideIcon, Droplets, Utensils,
  ClipboardCheck, LayoutGrid, GlassWater, Lock, HandMetal,
  UserPlus, ListChecks, Info, Zap
} from "lucide-react";
import { toast } from "sonner";
import { QuizTreinamento } from "@/components/treinamentos/QuizTreinamento";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface SlideContent {
  titulo: string;
  icone: string;
  paragrafos: string[];
  lista?: string[];
  paragrafos2?: string[];
}

const iconMap: Record<string, LucideIcon> = {
  PartyPopper, Star, Clock, AlertTriangle, UserCheck, Shirt, 
  ShieldCheck, MessageSquare, TrendingUp, Thermometer, ShieldAlert,
  Droplets, Utensils, ClipboardCheck, LayoutGrid, GlassWater,
  Lock, HandMetal, UserPlus, ListChecks, Info, Zap, BookOpen
};

const conteudoTreinamentos: Record<string, SlideContent[]> = {
  "Bem-vindo ao Tem Staff": [
    { titulo: "Como funciona a plataforma", icone: "PartyPopper", paragrafos: ["O Tem Staff conecta profissionais de alimentação com estabelecimentos que precisam de reforço na equipe — de forma rápida, segura e profissional."], lista: ["Estabelecimentos publicam vagas temporárias com data, horário e função", "Você se candidata às vagas que se encaixam na sua agenda", "Após a confirmação, você trabalha e recebe sua avaliação", "Com boas avaliações, seu perfil sobe e você recebe mais oportunidades"] },
    { titulo: "Você é seu próprio chefe", icone: "Star", paragrafos: ["Aqui você decide quando e onde trabalhar. Mas a responsabilidade também é toda sua.", "💡 Dica: Complete seu perfil 100% para aparecer em mais buscas dos estabelecimentos."] }
  ],
  "Pontualidade e Compromisso": [
    { titulo: "Quando você confirma, o estabelecimento conta com você", icone: "Clock", paragrafos: ["Atrasos e faltas causam transtornos sérios para a equipe e para os clientes."], lista: ["Chegue com pelo menos 10 minutos de antecedência", "Se surgir imprevisto, avise pelo app com o máximo de antecedência", "Nunca abandone um serviço no meio sem comunicação", "Cumpra o horário completo combinado"] },
    { titulo: "Consequências de faltas não justificadas", icone: "AlertTriangle", paragrafos: ["Faltas sem aviso têm impacto direto no seu perfil."], lista: ["📉 Seu Trust Score cai automaticamente", "🔕 Você pode ser removido de listas de candidatos", "⭐ O estabelecimento pode te avaliar negativamente"], paragrafos2: ["💡 Dica: No app você encontra o botão 'Reportar imprevisto' — use sempre que precisar cancelar."] }
  ],
  "Apresentação Pessoal": [
    { titulo: "Checklist de apresentação", icone: "UserCheck", paragrafos: ["Sua aparência é a primeira impressão que o cliente terá."], lista: ["Cabelo limpo e preso (para quem trabalha com alimentos, sempre preso)", "Barba feita ou bem aparada", "Unhas curtas e limpas — sem esmalte para quem manipula alimentos", "Uniforme limpo, passado e completo antes de sair de casa", "Sapato fechado e antiderrapante (obrigatório em cozinhas)", "Sem perfumes fortes", "Sem acessórios excessivos"] },
    { titulo: "Sem uniforme?", icone: "Shirt", paragrafos: ["Se o estabelecimento não fornecer uniforme, use roupa preta, limpa e formal.", "💡 Dica: Leve sempre uma muda de roupa reserva para imprevistos no caminho."] }
  ],
  "Postura Profissional": [
    { titulo: "Comportamento no ambiente de trabalho", icone: "ShieldCheck", paragrafos: [], lista: ["Cumprimente a equipe ao chegar e apresente-se ao responsável", "Celular no bolso e no silencioso durante todo o serviço", "Nunca use o celular na frente dos clientes", "Respeite a hierarquia: ouça antes de questionar", "Não discuta com colegas ou superiores na frente de clientes", "Trate todos com respeito e cordialidade"] },
    { titulo: "Em caso de conflito", icone: "MessageSquare", paragrafos: ["Registre pelo app após o turno. Nunca resolva conflitos em público.", "💡 Dica: Um 'bom dia' e um sorriso custam zero e valem muito na avaliação final."] }
  ],
  "Como Funciona a Avaliação": [
    { titulo: "Avaliação de 1 a 5 estrelas", icone: "Star", paragrafos: ["Após cada serviço, o estabelecimento avalia seu desempenho."], lista: ["🟢 Média acima de 4,5 → Perfil em destaque nas buscas", "🟡 Média entre 3,5 e 4,4 → Perfil normal", "🔴 Média abaixo de 3,5 → Perfil com restrições"] },
    { titulo: "Trust Score", icone: "TrendingUp", paragrafos: ["O Trust Score combina: média das avaliações, taxa de comparecimento, tempo de cadastro e completude do perfil.", "💡 Dica: Você pode ver sua média e Trust Score a qualquer momento no seu dashboard."] }
  ],
  "Segurança e Higiene Alimentar": [
    { titulo: "Higiene alimentar básica", icone: "Droplets", paragrafos: [], lista: ["Lave as mãos antes de iniciar o serviço e após qualquer pausa", "Nunca manipule alimentos com cortes ou feridas sem proteção", "Mantenha alimentos frios em refrigeração e quentes acima de 60°C"] },
    { titulo: "Zona de perigo", icone: "Thermometer", paragrafos: ["Entre 5°C e 60°C as bactérias se multiplicam rapidamente. Evite manter alimentos nessa faixa de temperatura."] },
    { titulo: "Segurança no ambiente", icone: "ShieldAlert", paragrafos: ["💡 Em emergência médica: SAMU 192 ou Bombeiros 193."], lista: ["Sinalize imediatamente qualquer piso molhado", "Use os EPIs disponíveis", "Nunca improvise com equipamentos elétricos ou de gás", "Em caso de acidente: informe o responsável imediatamente"] }
  ],
  "Técnicas de Serviço de Mesa": [
    { titulo: "Mise en place", icone: "LayoutGrid", paragrafos: ["A preparação correta garante que o serviço flua sem interrupções."], lista: ["Verifique se os talheres e taças estão polidos e sem manchas", "Garanta que galheteiros e saleiros estejam cheios", "Tenha sempre guardanapos extras à mão"] },
    { titulo: "Sequência de serviço", icone: "Utensils", paragrafos: ["Siga sempre o protocolo da casa, mas o padrão básico é:"], lista: ["Sirva as bebidas primeiro", "Sirva as mulheres e os mais velhos primeiro", "Pratos principais saem juntos para a mesma mesa", "Retire os pratos apenas quando todos terminarem"] }
  ],
  "Anotação e Confirmação de Pedidos": [
    { titulo: "Como anotar pedidos", icone: "ClipboardCheck", paragrafos: ["Anotar corretamente evita desperdício e reclamações."], lista: ["Confirme sempre o ponto da carne", "Pergunte sobre acompanhamentos opcionais", "Repita o pedido completo para o cliente antes de sair da mesa"] },
    { titulo: "Alergias e Restrições", icone: "ShieldAlert", paragrafos: ["Isso é vital para a segurança do cliente."], lista: ["Destaque alergias na comanda em letras garrafais", "Comunique verbalmente à cozinha ou ao bar", "Confirme os ingredientes se o cliente tiver dúvidas"] }
  ],
  "Mise en Place e Organização da Praça": [
    { titulo: "Organização da praça (Cozinha)", icone: "LayoutGrid", paragrafos: ["Cozinha organizada é cozinha rápida."], lista: ["Tenha todos os insumos picados e pesados antes do serviço", "Mantenha seus utensílios limpos e no mesmo lugar", "Siga o sistema PEPS (Primeiro que Entra, Primeiro que Sai)"] }
  ],
  "Mise en Place do Bar": [
    { titulo: "Preparação do Bar", icone: "GlassWater", paragrafos: ["O bar deve estar pronto antes do primeiro drink."], lista: ["Garanta que o gelo esteja reposto", "Pique frutas frescas para guarnição", "Verifique se os xaropes e sucos estão na validade"] }
  ],
  "Higiene na Cozinha": [
    { titulo: "Protocolos de Higiene", icone: "Droplets", paragrafos: ["A segurança do cliente começa na sua mão."], lista: ["Use touca cobrindo todo o cabelo", "Mantenha unhas curtas e sem esmalte", "Lave as mãos a cada troca de tarefa"] }
  ]
};

const Treinamentos = () => {
  usePageTitle("Treinamentos | Tem Staff");
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedTreinamento, setSelectedTreinamento] = useState<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const { data: profissional } = useProfissionalQuery(user?.id);
  const profissionalMutation = useProfissionalMutation(user?.id);
  const { data: treinamentos, isLoading: loadingTreinamentos } = useTreinamentos(profissional?.funcoes?.[0]);
  const { data: concluidos, isLoading: loadingConcluidos } = useTreinamentosConcluidos();
  const mutation = useMarcarConcluido();

  if (loadingTreinamentos || loadingConcluidos) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getSlides = (titulo: string) => {
    const key = Object.keys(conteudoTreinamentos).find(
      k => k.toLowerCase().trim() === titulo.toLowerCase().trim()
    );
    
    if (key && conteudoTreinamentos[key]) {
      return conteudoTreinamentos[key];
    }
    
    return [
      { 
        titulo: titulo, 
        icone: "BookOpen", 
        paragrafos: [selectedTreinamento?.descricao || "Leia com atenção este módulo de treinamento."],
        lista: ["Siga as orientações do estabelecimento", "Em caso de dúvida, pergunte ao responsável", "Mantenha a postura profissional"],
        paragrafos2: ["Clique em Concluir quando estiver pronto."]
      }
    ];
  };

  const slides = selectedTreinamento ? getSlides(selectedTreinamento.titulo) : [];

  const handleNextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleMarcarConcluido(selectedTreinamento.id);
      setSelectedTreinamento(null);
      setCurrentSlide(0);
    }
  };

  const handlePrevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const concluidosIds = new Set(concluidos?.map((c) => c.treinamento_id) || []);
  const total = treinamentos?.length || 0;
  const numConcluidos = treinamentos?.filter((t) => concluidosIds.has(t.id)).length || 0;
  const percentual = total > 0 ? Math.round((numConcluidos / total) * 100) : 0;

  const obrigatorios = treinamentos?.filter((t) => t.obrigatorio) || [];
  const obrigatoriosConcluidos = obrigatorios.every((t) => concluidosIds.has(t.id));

  const handleMarcarConcluido = async (id: string) => {
    try {
      await mutation.mutateAsync(id);
      toast.success("Treinamento concluído!");
    } catch (error) {
      toast.error("Erro ao marcar como concluído.");
    }
  };

  const handleAprovadoQuiz = async (acertos: number, totalQuestoes: number) => {
    const percentualResult = (acertos / totalQuestoes) * 100;
    try {
      await profissionalMutation.mutateAsync({
        treinamento_concluido: true,
        treinamento_nota: Math.round(percentualResult),
        treinamento_data: new Date().toISOString()
      });
      toast.success("Certificação concluída com sucesso!");
      navigate("/app/profissional");
    } catch (error) {
      toast.error("Erro ao salvar resultado.");
    }
  };

  if (showQuiz) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="ghost" onClick={() => setShowQuiz(false)}>Voltar</Button>
          <h1 className="text-2xl font-bold">Quiz de Certificação</h1>
        </div>
        <QuizTreinamento 
          funcao={profissional?.funcoes?.[0] || "garcom"} 
          onAprovado={(acertos) => handleAprovadoQuiz(acertos)} 
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            Treinamentos
          </h1>
          {obrigatoriosConcluidos && total > 0 && (
            <Badge className="bg-green-100 text-green-700 border-green-200 gap-1 px-3 py-1">
              <Award className="w-4 h-4" />
              Profissional Certificado Tem Staff
            </Badge>
          )}
        </div>

        <Card className="overflow-hidden border-primary/20">
          <CardHeader className="bg-primary/5 pb-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Status de Certificação
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>Progresso Geral</span>
                  <span>{numConcluidos} de {total} concluídos</span>
                </div>
                <Progress value={percentual} className="h-3" />
              </div>

              {numConcluidos === total && total > 0 && !profissional?.treinamento_concluido ? (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
                    <Zap className="w-5 h-5 shrink-0 text-green-600 animate-pulse" />
                    <span>Excelente! Você concluiu todos os módulos. Agora faça o quiz final para obter sua certificação.</span>
                  </div>
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700 h-14 text-lg font-bold shadow-lg shadow-green-200"
                    onClick={() => setShowQuiz(true)}
                  >
                    <Award className="mr-2 h-6 w-6" />
                    INICIAR QUIZ DE CERTIFICAÇÃO
                  </Button>
                </div>
              ) : numConcluidos < total && (
                <div className="flex items-center gap-2 p-3 bg-muted/50 border rounded-lg text-muted-foreground text-sm italic">
                  <Lock className="w-4 h-4 shrink-0" />
                  <span>O quiz final será liberado automaticamente após a conclusão de todos os {total} módulos.</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {!obrigatoriosConcluidos && (
          <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-600" />
            <p><strong>Atenção:</strong> Complete os treinamentos obrigatórios para ser aprovado nos processos seletivos dos estabelecimentos.</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {treinamentos?.map((t) => {
          const isConcluido = concluidosIds.has(t.id);
          return (
            <Card key={t.id} className={cn("transition-all duration-200", isConcluido ? "bg-muted/30" : "hover:border-primary/50 shadow-sm")}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-base leading-tight font-bold">{t.titulo}</CardTitle>
                  {isConcluido ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                  )}
                </div>
                <CardDescription className="line-clamp-2 text-xs">{t.descricao}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-1.5">
                  {t.obrigatorio && (
                    <Badge variant="destructive" className="text-[9px] h-5 px-1.5 uppercase font-bold tracking-wider">Obrigatório</Badge>
                  )}
                  {t.funcao !== "todos" && (
                    <Badge variant="secondary" className="text-[9px] h-5 px-1.5 uppercase">{t.funcao}</Badge>
                  )}
                  <Badge variant="outline" className="text-[9px] h-5 px-1.5">{t.duracao_minutos} min</Badge>
                </div>

                <div className="flex flex-col gap-2">
                  {isConcluido ? (
                    <Badge className="w-full justify-center bg-green-100 text-green-700 border-green-200 py-2 font-medium">
                      <Check className="w-4 h-4 mr-2" />
                      Módulo Concluído
                    </Badge>
                  ) : (
                    <Button 
                      className="w-full gap-2 font-semibold" 
                      onClick={() => {
                        setSelectedTreinamento(t);
                        setCurrentSlide(0);
                      }}
                    >
                      <BookOpen className="w-4 h-4" />
                      Começar Treinamento
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!selectedTreinamento} onOpenChange={(open) => !open && setSelectedTreinamento(null)}>
        <DialogContent className="max-w-3xl sm:h-auto h-[100dvh] flex flex-col p-0 overflow-hidden gap-0">
          <DialogHeader className="p-4 border-b shrink-0 bg-white z-10">
            <div className="flex flex-col gap-2">
              <DialogTitle className="text-lg pr-8">{selectedTreinamento?.titulo}</DialogTitle>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  <span>Página {currentSlide + 1} de {slides.length}</span>
                  <span>{Math.round(((currentSlide + 1) / slides.length) * 100)}%</span>
                </div>
                <Progress value={((currentSlide + 1) / slides.length) * 100} className="h-1.5" />
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 bg-white">
            <div className="p-6 sm:p-10 flex flex-col items-center justify-center min-h-[50vh] text-center">
              {slides[currentSlide] && (
                <div className="space-y-8 w-full max-w-xl animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                    {(() => {
                      const Icon = iconMap[slides[currentSlide].icone] || BookOpen;
                      return <Icon className="w-12 h-12 text-primary" />;
                    })()}
                  </div>
                  
                  <div className="space-y-3">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                      {slides[currentSlide].titulo}
                    </h2>
                    <div className="h-1 w-12 bg-primary mx-auto rounded-full" />
                  </div>
                  
                  <div className="space-y-6 text-left">
                    {slides[currentSlide].paragrafos.map((p, i) => (
                      <p key={i} className="text-base sm:text-lg text-muted-foreground leading-relaxed font-medium">{p}</p>
                    ))}
                    
                    {slides[currentSlide].lista && slides[currentSlide].lista.length > 0 && (
                      <ul className="space-y-3 mt-6 bg-primary/5 p-5 rounded-2xl border border-primary/10">
                        {slides[currentSlide].lista.map((item, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm sm:text-base text-foreground font-medium">
                            <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {slides[currentSlide].paragrafos2?.map((p, i) => (
                      <div key={i} className="flex items-center gap-2 p-4 bg-muted rounded-xl text-muted-foreground text-sm italic border-l-4 border-primary">
                        <Info className="w-5 h-5 shrink-0 text-primary" />
                        <p>{p}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 border-t flex flex-row justify-between items-center bg-muted/30 shrink-0 gap-4">
            <Button 
              variant="outline" 
              onClick={handlePrevSlide} 
              disabled={currentSlide === 0}
              className="flex-1 sm:flex-none gap-2 h-12"
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </Button>
            
            <Button 
              onClick={handleNextSlide} 
              className="flex-[2] sm:flex-none gap-2 h-12 min-w-[140px] font-bold"
              disabled={mutation.isPending}
            >
              {currentSlide === slides.length - 1 
                ? (mutation.isPending ? "Salvando..." : "Concluir") 
                : "Próximo"} 
              {currentSlide !== slides.length - 1 && <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Treinamentos;
