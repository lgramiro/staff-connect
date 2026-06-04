import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

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

      const [profissionaisRes, estabelecimentosRes, usuariosRes] = await Promise.all([
        supabase
          .from("profissionais")
          .select("user_id, nome")
          .ilike("nome", `%${term}%`)
          .limit(5),
        supabase
          .from("estabelecimentos")
          .select("user_id, nome")
          .ilike("nome", `%${term}%`)
          .limit(5),
        supabase
          .from("profiles")
          .select("user_id, nome, email")
          .or(`nome.ilike.%${term}%,email.ilike.%${term}%`)
          .limit(5),
      ]);

      const profissionais: SearchResult[] = (profissionaisRes.data || []).map((p) => ({
        id: p.user_id,
        nome: p.nome,
        tipo: "profissional",
      }));

      const estabelecimentos: SearchResult[] = (estabelecimentosRes.data || []).map((e) => ({
        id: e.user_id,
        nome: e.nome,
        tipo: "estabelecimento",
      }));

      const usuarios: SearchResult[] = (usuariosRes.data || []).map((u) => ({
        id: u.user_id,
        nome: u.nome,
        email: u.email,
        tipo: "usuario",
      }));

      return { profissionais, estabelecimentos, usuarios };
    },
    enabled: term.length >= 3,
  });
};
