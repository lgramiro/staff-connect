CREATE TABLE IF NOT EXISTS public.avaliacoes_estabelecimentos (
  id uuid primary key default gen_random_uuid(),
  candidatura_id uuid references public.candidaturas(id) ON DELETE CASCADE,
  profissional_id uuid references public.profissionais(id) ON DELETE CASCADE,
  estabelecimento_id uuid references public.estabelecimentos(id) ON DELETE CASCADE,
  nota integer check (nota between 1 and 5),
  comentario text,
  created_at timestamptz default now()
);

-- Habilitar RLS
ALTER TABLE public.avaliacoes_estabelecimentos ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT SELECT, INSERT ON public.avaliacoes_estabelecimentos TO authenticated;
GRANT ALL ON public.avaliacoes_estabelecimentos TO service_role;

-- Políticas de segurança
CREATE POLICY "Profissionais podem inserir avaliações" ON public.avaliacoes_estabelecimentos
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IN (SELECT user_id FROM public.profissionais WHERE id = profissional_id));

CREATE POLICY "Todos autenticados podem ver avaliações" ON public.avaliacoes_estabelecimentos
  FOR SELECT TO authenticated
  USING (true);

-- Impedir múltiplas avaliações para a mesma candidatura
CREATE UNIQUE INDEX IF NOT EXISTS idx_avaliacoes_estabelecimentos_candidatura ON public.avaliacoes_estabelecimentos(candidatura_id);