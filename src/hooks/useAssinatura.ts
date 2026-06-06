import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEstabelecimentoQuery } from "./queries/useEstabelecimento";
import { startOfMonth, endOfMonth } from "date-fns";

export const useAssinatura = () => {
  const { user } = useAuth();
  const { data: estab } = useEstabelecimentoQuery(user?.id);

  const { data: assinatura, isLoading: loadingAssinatura } = useQuery({
    queryKey: ["assinatura", estab?.id],
    queryFn: async () => {
      if (!estab?.id) return null;
      
      const { data, error } = await supabase
        .from("assinaturas")
        .select(`
          *,
          plano:planos (*)
        `)
        .eq("estabelecimento_id", estab.id)
        .eq("status", "ativa")
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!estab?.id,
  });

  const { data: slotsUsados = 0, isLoading: loadingSlots } = useQuery({
    queryKey: ["slots-usados-mes", estab?.id],
    queryFn: async () => {
      if (!estab?.id) return 0;
      
      const start = startOfMonth(new Date()).toISOString();
      const end = endOfMonth(new Date()).toISOString();

      const { count, error } = await supabase
        .from("slots")
        .select("*", { count: "exact", head: true })
        .eq("estabelecimento_id", estab.id)
        .gte("created_at", start)
        .lte("created_at", end);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!estab?.id,
  });

  const plano = assinatura?.plano;
  const loading = loadingAssinatura || loadingSlots;

  const limiteVagas = () => plano?.limite_slots || null;
  const vagasUsadasMes = () => slotsUsados;

  const podeCriarVaga = () => {
    const limite = limiteVagas();
    if (limite === null) return true;
    return vagasUsadasMes() < limite;
  };

  const permiteRecorrencia = () => plano?.recorrencia || false;
  const permiteExportacao = () => plano?.exportar || false;
  const permiteDestaques = () => plano?.destaques || false;

  return {
    plano,
    assinatura,
    loading,
    podeCriarVaga,
    vagasUsadasMes,
    limiteVagas,
    permiteRecorrencia,
    permiteExportacao,
    permiteDestaques,
  };
};
