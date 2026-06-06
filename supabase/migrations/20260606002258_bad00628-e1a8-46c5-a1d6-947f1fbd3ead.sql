CREATE TABLE IF NOT EXISTS public.favoritos_profissionais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estabelecimento_id UUID NOT NULL REFERENCES public.estabelecimentos(id) ON DELETE CASCADE,
    profissional_id UUID NOT NULL REFERENCES public.profissionais(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(estabelecimento_id, profissional_id)
);

GRANT ALL ON public.favoritos_profissionais TO service_role;
GRANT SELECT, INSERT, DELETE ON public.favoritos_profissionais TO authenticated;

ALTER TABLE public.favoritos_profissionais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Estabelecimentos podem gerenciar seus favoritos"
ON public.favoritos_profissionais FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.estabelecimentos e
        WHERE e.id = estabelecimento_id AND e.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.estabelecimentos e
        WHERE e.id = estabelecimento_id AND e.user_id = auth.uid()
    )
);
