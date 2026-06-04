import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useEstabelecimentoQuery = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["estabelecimento", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("estabelecimentos")
        .select("*")
        .eq("user_id", userId)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!userId,
  });
};
