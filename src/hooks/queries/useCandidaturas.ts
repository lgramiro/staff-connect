import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useCandidaturasByProfissional = (profissionalId: string | undefined) => {
  return useQuery({
    queryKey: ["candidaturas", "profissional", profissionalId],
    queryFn: async () => {
      if (!profissionalId) return [];
      
      const { data, error } = await supabase
        .from("candidaturas")
        .select(`
          *,
          slots:slot_id (
            *,
            estabelecimentos:estabelecimento_id (*)
          )
        `)
        .eq("profissional_id", profissionalId);

      if (error) {
        if (import.meta.env.DEV) console.error("Erro ao buscar candidaturas");
        throw error;
      }
      return data;
    },
    enabled: !!profissionalId,
  });
};

export const useCandidaturasByEstabelecimento = (estabelecimentoId: string | undefined) => {
  return useQuery({
    queryKey: ["candidaturas", "estabelecimento", estabelecimentoId],
    queryFn: async () => {
      if (!estabelecimentoId) return [];
      const { data, error } = await supabase
        .from("candidaturas")
        .select(`
          *,
          slots!inner (
            *,
            estabelecimentos!inner (*)
          ),
          profissionais_publicos:profissional_id (*)
        `)
        .eq("slots.estabelecimento_id", estabelecimentoId);

      if (error) {
        if (import.meta.env.DEV) console.error("Erro ao buscar candidaturas do estabelecimento");
        throw error;
      }
      return data;
    },
    enabled: !!estabelecimentoId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useCriarCandidatura = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (values: { slot_id: string; profissional_id: string }) => {
      const { data, error } = await supabase
        .from("candidaturas")
        .insert(values)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidaturas"] });
      toast.success("Candidatura enviada com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao enviar candidatura: " + error.message);
    },
  });
};

export const useAtualizarCandidatura = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from("candidaturas")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidaturas"] });
      toast.success("Status da candidatura atualizado!");
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar candidatura: " + error.message);
    },
  });
};
