import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SearchResult {
  id: string;
  nome: string;
  email?: string;
  tipo: "profissional" | "estabelecimento" | "usuario";
}

export const useAdminGlobalSearch = (term: string) => {
  return useQuery({
    queryKey: ["admin-global-search", term],
    queryFn: async () => {
      if (!term || term.length < 3) return { profissionais: [], estabelecimentos: [], usuarios: [] };

      // Using any to avoid TS issues with potentially evolving schema/types
      const [profissionaisRes, estabelecimentosRes, usuariosRes] = await Promise.all([
        supabase
          .from("profissionais")
          .select("user_id, nome")
          .ilike("nome", `%${term}%`)
          .limit(5) as any,
        supabase
          .from("estabelecimentos")
          .select("user_id, nome")
          .ilike("nome", `%${term}%`)
          .limit(5) as any,
        supabase
          .from("profiles")
          .select("id, nome, email")
          .or(`nome.ilike.%${term}%,email.ilike.%${term}%`)
          .limit(5) as any,
      ]);

      const profissionais: SearchResult[] = (profissionaisRes.data || []).map((p: any) => ({
        id: p.user_id,
        nome: p.nome,
        tipo: "profissional",
      }));

      const estabelecimentos: SearchResult[] = (estabelecimentosRes.data || []).map((e: any) => ({
        id: e.user_id,
        nome: e.nome,
        tipo: "estabelecimento",
      }));

      const usuarios: SearchResult[] = (usuariosRes.data || []).map((u: any) => ({
        id: u.id,
        nome: u.nome,
        email: u.email,
        tipo: "usuario",
      }));

      return { profissionais, estabelecimentos, usuarios };
    },
    enabled: term.length >= 3,
  });
};
