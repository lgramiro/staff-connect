import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useProfissionalQuery = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["profissional", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("profissionais")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!userId,
  });
};

export const useProfissionalMutation = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: any) => {
      if (!userId) throw new Error("Usuário não autenticado");
      
      const { data, error } = await supabase
        .from("profissionais")
        .update(formData)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profissional", userId] });
      toast.success("Perfil atualizado!");
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar perfil: " + error.message);
    },
  });
};
