-- Permitir que usuários autenticados criem notificações para outros usuários
DROP POLICY IF EXISTS "Usuários podem receber notificações" ON public.notificacoes;

CREATE POLICY "Usuários autenticados podem criar notificações"
ON public.notificacoes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Habilitar Realtime na tabela notificacoes
ALTER PUBLICATION supabase_realtime ADD TABLE public.notificacoes;
ALTER TABLE public.notificacoes REPLICA IDENTITY FULL;
