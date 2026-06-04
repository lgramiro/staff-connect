import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SlotsFilters {
  cidade?: string;
  funcao?: string;
  data?: string;
  valorMin?: string;
}

export const useSlotsAbertos = (filters: SlotsFilters = {}) => {
  return useQuery({
    queryKey: ["slots-abertos", filters],
    queryFn: async () => {
      let query = supabase
        .from("slots")
        .select("*, estabelecimentos(nome, cidade, endereco)")
        .eq("status", "aberto")
        .order("urgente", { ascending: false })
        .order("data", { ascending: true });

      if (filters.cidade) {
        query = query.ilike("estabelecimentos.cidade", `%${filters.cidade}%`);
      }
      if (filters.funcao) {
        query = query.eq("funcao", filters.funcao);
      }
      if (filters.data) {
        query = query.eq("data", filters.data);
      }
      if (filters.valorMin) {
        const min = parseFloat(filters.valorMin);
        if (!isNaN(min)) {
          query = query.gte("valor", min);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
};

export const useSlotsByEstabelecimento = (estabelecimentoId: string | undefined, filters: { startDate?: string; endDate?: string; date?: string; status?: string } = {}) => {
  return useQuery({
    queryKey: ["slots-estabelecimento", estabelecimentoId, filters],
    queryFn: async () => {
      if (!estabelecimentoId) return [];
      let query = supabase
        .from("slots")
        .select("*, candidaturas(*, profissionais(*))")
        .eq("estabelecimento_id", estabelecimentoId);

      if (filters.startDate) query = query.gte("data", filters.startDate);
      if (filters.endDate) query = query.lte("data", filters.endDate);
      if (filters.date) query = query.eq("data", filters.date);
      if (filters.status) query = query.eq("status", filters.status);

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!estabelecimentoId,
  });
};

export const useUpdateSlotStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from("slots")
        .update({ status })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slots-estabelecimento"] });
      queryClient.invalidateQueries({ queryKey: ["slots-abertos"] });
    },
  });
};

