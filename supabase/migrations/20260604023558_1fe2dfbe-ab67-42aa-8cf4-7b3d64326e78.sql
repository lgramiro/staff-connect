-- Remover a política permissiva anterior
DROP POLICY "Sistema pode criar notificações para usuários" ON public.notificacoes;

-- Criar política mais restrita: usuários podem inserir notificações para si mesmos
-- (Geralmente inserções de sistema via service_role ignoram RLS)
CREATE POLICY "Usuários podem receber notificações" 
ON public.notificacoes FOR INSERT 
WITH CHECK (auth.uid() = user_id);
