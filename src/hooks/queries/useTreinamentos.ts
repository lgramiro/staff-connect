import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useTreinamentos = (funcao?: string) =>
  useQuery({
    queryKey: ["treinamentos", funcao],
    queryFn: async () => {
      let q = supabase.from("treinamentos").select("*").eq("ativo", true).order("ordem");
      if (funcao && funcao !== "todos") {
        q = q.in("funcao", ["todos", funcao]);
      }
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

export const useTreinamentosConcluidos = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["treinamentos_concluidos", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("treinamentos_concluidos")
        .select("treinamento_id, concluido_at")
        .eq("profissional_id", user.id);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });
};

export const useMarcarConcluido = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (treinamentoId: string) => {
      if (!user) throw new Error("Usuário não autenticado");
      const { error } = await supabase
        .from("treinamentos_concluidos")
        .insert({ profissional_id: user.id, treinamento_id: treinamentoId });
      if (error && error.code !== "23505") throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["treinamentos_concluidos"] });
      qc.invalidateQueries({ queryKey: ["profissional"] });
    },
  });
};
