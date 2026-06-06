CREATE TABLE IF NOT EXISTS public.ocorrencias_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slot_id UUID NOT NULL REFERENCES public.slots(id) ON DELETE CASCADE,
    profissional_id UUID NOT NULL REFERENCES public.profissionais(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL,
    descricao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

GRANT ALL ON public.ocorrencias_slots TO service_role;
GRANT SELECT, INSERT ON public.ocorrencias_slots TO authenticated;

ALTER TABLE public.ocorrencias_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Estabelecimentos podem inserir ocorrências para seus slots" 
ON public.ocorrencias_slots FOR INSERT 
TO authenticated 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.slots s
        JOIN public.estabelecimentos e ON s.estabelecimento_id = e.id
        WHERE s.id = slot_id AND e.user_id = auth.uid()
    )
);

CREATE POLICY "Usuários podem ver ocorrências de seus slots ou perfis"
ON public.ocorrencias_slots FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.slots s
        JOIN public.estabelecimentos e ON s.estabelecimento_id = e.id
        WHERE s.id = slot_id AND e.user_id = auth.uid()
    ) OR 
    EXISTS (
        SELECT 1 FROM public.profissionais p
        WHERE p.id = profissional_id AND p.user_id = auth.uid()
    )
);
