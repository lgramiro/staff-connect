DROP POLICY IF EXISTS "Estabelecimentos podem inserir documentos" ON public.documentos;

CREATE POLICY "Usuários podem inserir seus documentos" ON public.documentos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.estabelecimentos e WHERE e.id = documentos.estabelecimento_id AND e.user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM public.profissionais p WHERE p.id = documentos.profissional_id AND p.user_id = auth.uid()
    )
  );
