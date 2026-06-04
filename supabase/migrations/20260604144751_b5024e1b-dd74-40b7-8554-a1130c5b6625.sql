-- Corrigindo o problema de segurança nas notificações
DROP POLICY IF EXISTS "Users can create own notifications" ON public.notificacoes;

-- Corrigindo as permissões dos buckets de storage para permitir visualização por usuários autenticados
-- Nota: Usamos o formato padrão de criação de policies do Supabase Storage
CREATE POLICY "Authenticated users can view fotos" 
ON storage.objects FOR SELECT 
TO authenticated 
USING (bucket_id = 'fotos');

CREATE POLICY "Authenticated users can view curriculos" 
ON storage.objects FOR SELECT 
TO authenticated 
USING (bucket_id = 'curriculos');