import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useEstabelecimentoQuery = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["estabelecimento", userId],
    queryFn: async () => {
      if (!userId) return null;
      console.log("[useEstabelecimentoQuery] Fetching for userId:", userId);
      const { data, error } = await supabase
        .from("estabelecimentos")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      
      if (error) {
        console.error("[useEstabelecimentoQuery] Error:", error);
        throw error;
      }
      return data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 10, // 10 minutes (info stable)
  });
};
