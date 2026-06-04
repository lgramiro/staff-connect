import { useQuery } from "@tanstack/react-query";
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
