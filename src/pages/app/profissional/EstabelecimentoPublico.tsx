import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ProfissionalLayout } from "@/components/layouts/ProfissionalLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Building2, Calendar, TrendingUp, UserCheck } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmptyState";

const EstabelecimentoPublico = () => {
  const { id } = useParams();

  const { data: estab, isLoading } = useQuery({
    queryKey: ["estabelecimento-publico", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("estabelecimentos")
        .select(`
          *,
          avaliacoes_estabelecimentos(
            id,
            nota,
            comentario,
            created_at,
            profissionais(nome)
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;

      const avaliacoes = data.avaliacoes_estabelecimentos || [];
      const media = avaliacoes.length > 0 
        ? avaliacoes.reduce((acc: number, curr: any) => acc + curr.nota, 0) / avaliacoes.length 
        : 0;

      // Buscar total de serviços concluídos neste estabelecimento
      const { count: totalServicos } = await supabase
        .from("candidaturas")
        .select("id", { count: 'exact', head: true })
        .eq("status", "concluida")
        .innerJoin("slots", "slots.id", "candidaturas.slot_id")
        .eq("slots.estabelecimento_id", id);

      return {
        ...data,
        media: Number(media.toFixed(1)),
        totalAvaliacoes: avaliacoes.length,
        totalServicos: totalServicos || 0,
        avaliacoes
      };
    },
    enabled: !!id
  });

  if (isLoading) return <ProfissionalLayout><LoadingSpinner /></ProfissionalLayout>;
  if (!estab) return <ProfissionalLayout><EmptyState title="Estabelecimento não encontrado" /></ProfissionalLayout>;

  return (
    <ProfissionalLayout>
      <div className="space-y-8">
        {/* Header Profile */}
        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Building2 className="w-12 h-12 text-primary" />
            </div>
            
            <div className="flex-grow space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-display font-bold">{estab.nome}</h1>
                {estab.media >= 4.5 && (
                  <Badge className="bg-emerald-500 hover:bg-emerald-600 border-none">
                    Top Empregador
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{estab.cidade} - {estab.estado}</span>
              </div>
              
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="bg-muted/50 px-4 py-2 rounded-lg flex items-center gap-2">
                  <Star className="w-5 h-5 fill-warning text-warning" />
                  <div>
                    <p className="text-sm font-bold">{estab.media}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Avaliação Média</p>
                  </div>
                </div>
                <div className="bg-muted/50 px-4 py-2 rounded-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-bold">{estab.totalServicos}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Serviços Realizados</p>
                  </div>
                </div>
                <div className="bg-muted/50 px-4 py-2 rounded-lg flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-500" />
                  <div>
                    <p className="text-sm font-bold">{estab.totalAvaliacoes}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Avaliações Recebidas</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Avaliações */}
        <div className="space-y-4">
          <h2 className="text-xl font-display font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            O que os profissionais dizem
          </h2>
          
          <div className="grid gap-4">
            {estab.avaliacoes.length === 0 ? (
              <p className="text-muted-foreground italic">Este estabelecimento ainda não recebeu avaliações.</p>
            ) : (
              estab.avaliacoes.map((av: any) => (
                <Card key={av.id} className="p-4 border-border">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(n => (
                          <Star key={n} className={`w-3 h-3 ${av.nota >= n ? "fill-warning text-warning" : "text-muted-foreground/30"}`} />
                        ))}
                      </div>
                      <span className="text-xs font-semibold">{av.profissionais?.nome || "Profissional"}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(av.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  {av.comentario && (
                    <p className="text-sm text-muted-foreground italic">"{av.comentario}"</p>
                  )}
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </ProfissionalLayout>
  );
};

export default EstabelecimentoPublico;