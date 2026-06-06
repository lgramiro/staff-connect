import { useQuery } from "@tanstack/react-query";
import { ProfissionalLayout } from "@/components/layouts/ProfissionalLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Trophy, MapPin, Inbox, TrendingUp } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmptyState";
import { Link } from "react-router-dom";

const RankingEstabelecimentos = () => {
  const { data: ranking = [], isLoading } = useQuery({
    queryKey: ["ranking-estabelecimentos"],
    queryFn: async () => {
      // Busca estabelecimentos e suas avaliações
      const { data: estabs, error: estabsError } = await supabase
        .from("estabelecimentos")
        .select(`
          id,
          nome,
          cidade,
          avaliacoes_estabelecimentos(nota)
        `);

      if (estabsError) throw estabsError;

      // Calcula a média e formata os dados
      const ranked = estabs.map((e: any) => {
        const avaliacoes = e.avaliacoes_estabelecimentos || [];
        const total = avaliacoes.length;
        const media = total > 0 
          ? avaliacoes.reduce((acc: number, curr: any) => acc + curr.nota, 0) / total 
          : 0;

        return {
          ...e,
          media: Number(media.toFixed(1)),
          totalAvaliacoes: total
        };
      });

      // Ordena por nota média DESC e depois por total de avaliações DESC
      return ranked.sort((a, b) => {
        if (b.media !== a.media) return b.media - a.media;
        return b.totalAvaliacoes - a.totalAvaliacoes;
      });
    }
  });

  return (
    <ProfissionalLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-warning/10 rounded-lg">
            <Trophy className="w-6 h-6 text-warning" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Ranking de Estabelecimentos</h1>
            <p className="text-muted-foreground">Conheça os lugares mais bem avaliados pelos profissionais.</p>
          </div>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : ranking.length === 0 ? (
          <EmptyState icon={Inbox} title="Nenhum estabelecimento avaliado ainda." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ranking.map((estab, index) => (
              <Link key={estab.id} to={`/app/profissional/estabelecimento/${estab.id}`}>
                <Card className="p-5 hover:border-primary/50 transition-all group relative overflow-hidden h-full flex flex-col">
                  {index < 3 && (
                    <div className="absolute top-0 right-0 bg-warning text-warning-foreground text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                      TOP {index + 1}
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{estab.nome}</h3>
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground flex-grow">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary/60" />
                      {estab.cidade}
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary/60" />
                      {estab.totalAvaliacoes} serviço(s) avaliado(s)
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 fill-warning text-warning" />
                      <span className="font-bold text-lg">{estab.media}</span>
                    </div>
                    {estab.media >= 4.5 && (
                      <Badge className="bg-emerald-500 hover:bg-emerald-600 border-none">
                        Top Empregador
                      </Badge>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </ProfissionalLayout>
  );
};

export default RankingEstabelecimentos;