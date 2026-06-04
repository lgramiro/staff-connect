import { supabase } from "@/integrations/supabase/client";

type TipoNotificacao = "candidatura" | "aprovacao" | "confirmacao" | "avaliacao";

interface CriarNotificacaoParams {
  user_id: string;
  titulo: string;
  mensagem?: string;
  tipo: TipoNotificacao;
  referencia_id?: string;
}

/**
 * Cria uma notificação para um usuário.
 * Falhas são apenas logadas — não devem quebrar o fluxo principal.
 */
export const criarNotificacao = async (params: CriarNotificacaoParams) => {
  const { error } = await supabase.from("notificacoes").insert(params);
  if (error) {
    console.error("Erro ao criar notificação:", error);
  }
};

/**
 * Busca o user_id do dono de um estabelecimento.
 */
export const getEstabelecimentoUserId = async (estabelecimentoId: string): Promise<string | null> => {
  const { data } = await supabase
    .from("estabelecimentos")
    .select("user_id")
    .eq("id", estabelecimentoId)
    .single();
  return data?.user_id ?? null;
};

/**
 * Busca o user_id de um profissional.
 */
export const getProfissionalUserId = async (profissionalId: string): Promise<string | null> => {
  const { data } = await supabase
    .from("profissionais")
    .select("user_id")
    .eq("id", profissionalId)
    .single();
  return data?.user_id ?? null;
};

/**
 * Busca o user_id do dono do estabelecimento a partir de um slot.
 */
export const getEstabelecimentoUserIdBySlot = async (slotId: string): Promise<string | null> => {
  const { data } = await supabase
    .from("slots")
    .select("estabelecimentos:estabelecimento_id(user_id)")
    .eq("id", slotId)
    .single();
  // @ts-ignore - estabelecimentos vem como objeto pelo join
  return data?.estabelecimentos?.user_id ?? null;
};
