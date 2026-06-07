import { useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useTreinamentos, useTreinamentosConcluidos, useMarcarConcluido } from "@/hooks/queries/useTreinamentos";
import { useProfissionalQuery, useProfissionalMutation } from "@/hooks/queries/useProfissional";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, CheckCircle2, Circle, PlayCircle, Award, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { QuizTreinamento } from "@/components/treinamentos/QuizTreinamento";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Treinamentos = () => {
  usePageTitle("Treinamentos | Tem Staff");
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showQuiz, setShowQuiz] = useState(false);
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

  const handleAprovadoQuiz = async (acertos: number) => {
    const percentual = (acertos / 10) * 100;
    try {
      await profissionalMutation.mutateAsync({
        treinamento_concluido: true,
        treinamento_nota: Math.round(percentual),
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

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>Seu progresso</span>
                <span>{numConcluidos} de {total} concluídos</span>
              </div>
              <Progress value={percentual} className="h-2" />
            </div>
            {numConcluidos === total && total > 0 && !profissional?.treinamento_concluido && (
              <Button 
                className="w-full mt-4 bg-green-600 hover:bg-green-700"
                onClick={() => setShowQuiz(true)}
              >
                <Award className="mr-2 h-4 w-4" />
                Fazer Quiz de Certificação
              </Button>
            )}
          </CardContent>
        </Card>

        {!obrigatoriosConcluidos && (
          <div className="flex items-center gap-2 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>Por favor, complete todos os treinamentos obrigatórios para melhorar seu Trust Score e visibilidade.</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {treinamentos?.map((t) => {
          const isConcluido = concluidosIds.has(t.id);
          return (
            <Card key={t.id} className={isConcluido ? "opacity-80" : ""}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-lg leading-tight">{t.titulo}</CardTitle>
                  {isConcluido ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
                  ) : (
                    <Circle className="w-6 h-6 text-muted-foreground shrink-0" />
                  )}
                </div>
                <CardDescription className="line-clamp-2">{t.descricao}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {t.obrigatorio && (
                    <Badge variant="destructive" className="text-[10px] uppercase">Obrigatório</Badge>
                  )}
                  {t.funcao !== "todos" && (
                    <Badge variant="secondary" className="text-[10px] uppercase">{t.funcao}</Badge>
                  )}
                  <Badge variant="outline" className="text-[10px]">{t.duracao_minutos} min</Badge>
                </div>

                <div className="flex gap-2">
                  {t.url_video ? (
                    <Button 
                      className="w-full gap-2" 
                      variant={isConcluido ? "outline" : "default"}
                      onClick={() => window.open(t.url_video, '_blank')}
                    >
                      <PlayCircle className="w-4 h-4" />
                      Assistir
                    </Button>
                  ) : !isConcluido && (
                    <Button 
                      className="w-full" 
                      onClick={() => handleMarcarConcluido(t.id)}
                      disabled={mutation.isPending}
                    >
                      Marcar como lido
                    </Button>
                  )}
                  {t.url_video && !isConcluido && (
                    <Button 
                      variant="outline"
                      size="icon"
                      title="Marcar como concluído"
                      onClick={() => handleMarcarConcluido(t.id)}
                      disabled={mutation.isPending}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Treinamentos;
