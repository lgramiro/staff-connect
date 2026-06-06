import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useMatchingProfissionais = (slotId: string | undefined, estabelecimentoId: string | undefined) => {
  return useQuery({
    queryKey: ["matching-profissionais", slotId, estabelecimentoId],
    queryFn: async () => {
      if (!slotId || !estabelecimentoId) return [];

      // 1. Buscar detalhes do slot
      const { data: slot } = await supabase
        .from("slots")
        .select("funcao, valor")
        .eq("id", slotId)
        .single();

      if (!slot) return [];

      // 2. Buscar profissionais que dão match
      const { data: profs, error } = await supabase
        .from("profissionais")
        .select("*")
        .eq("onboarding_completo", true)
        .contains("funcoes", [slot.funcao])
        .lte("diaria_minima", slot.valor);

      if (error) throw error;

      // 3. Buscar favoritos do estabelecimento
      const { data: favs } = await supabase
        .from("favoritos_profissionais")
        .select("profissional_id")
        .eq("estabelecimento_id", estabelecimentoId);

      const favIds = new Set(favs?.map(f => f.profissional_id) || []);

      // 4. Mapear campo is_favorito e ordenar (ETAPA 2)
      const ranked = profs.map(p => ({
        ...p,
        is_favorito: favIds.has(p.id)
      })).sort((a, b) => {
        // Regra 1: Favoritos primeiro
        if (a.is_favorito && !b.is_favorito) return -1;
        if (!a.is_favorito && b.is_favorito) return 1;

        // Regra 2: Trust score
        const scoreA = Number(a.trust_score || 0);
        const scoreB = Number(b.trust_score || 0);
        if (scoreB !== scoreA) return scoreB - scoreA;

        // Regra 3: Total avaliações
        const totalA = Number(a.total_avaliacoes || 0);
        const totalB = Number(b.total_avaliacoes || 0);
        return totalB - totalA;
      });

      return ranked;
    },
    enabled: !!slotId && !!estabelecimentoId,
  });
};
