CREATE TABLE public.notificacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  mensagem TEXT,
  tipo TEXT CHECK (tipo IN ('candidatura', 'aprovacao', 'confirmacao', 'avaliacao')),
  lida BOOLEAN DEFAULT false,
  referencia_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

-- Permissões de acesso
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notificacoes TO authenticated;
GRANT ALL ON public.notificacoes TO service_role;

-- Políticas de RLS
CREATE POLICY "Usuários podem ver suas próprias notificações" 
ON public.notificacoes FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem marcar suas notificações como lidas" 
ON public.notificacoes FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Sistema pode criar notificações para usuários" 
ON public.notificacoes FOR INSERT 
WITH CHECK (true);

-- Índices para performance
CREATE INDEX idx_notificacoes_user_id ON public.notificacoes(user_id);
CREATE INDEX idx_notificacoes_lida ON public.notificacoes(user_id) WHERE lida = false;
