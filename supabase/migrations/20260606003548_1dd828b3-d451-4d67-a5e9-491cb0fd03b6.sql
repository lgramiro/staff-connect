CREATE TABLE public.documentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo TEXT NOT NULL, -- 'CONVITE' ou 'RECIBO'
  slot_id UUID REFERENCES public.slots(id),
  estabelecimento_id UUID REFERENCES public.estabelecimentos(id),
  profissional_id UUID REFERENCES public.profissionais(id),
  pdf_url TEXT NOT NULL,
  aceite_profissional_at TIMESTAMP WITH TIME ZONE,
  aceite_estabelecimento_at TIMESTAMP WITH TIME ZONE,
  gerado_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.documentos TO authenticated;
GRANT ALL ON public.documentos TO service_role;

ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver seus próprios documentos" ON public.documentos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.estabelecimentos e WHERE e.id = documentos.estabelecimento_id AND e.user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM public.profissionais p WHERE p.id = documentos.profissional_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Estabelecimentos podem inserir documentos" ON public.documentos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.estabelecimentos e WHERE e.id = documentos.estabelecimento_id AND e.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem atualizar seus documentos" ON public.documentos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.estabelecimentos e WHERE e.id = documentos.estabelecimento_id AND e.user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM public.profissionais p WHERE p.id = documentos.profissional_id AND p.user_id = auth.uid()
    )
  );
