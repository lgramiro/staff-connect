
-- Planos table
CREATE TABLE public.planos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  slug text NOT NULL UNIQUE,
  preco decimal(10,2) NOT NULL DEFAULT 0,
  limite_slots integer,
  recorrencia boolean NOT NULL DEFAULT false,
  exportar boolean NOT NULL DEFAULT false,
  destaques boolean NOT NULL DEFAULT false,
  relatorios boolean NOT NULL DEFAULT false,
  favoritos boolean NOT NULL DEFAULT false,
  descricao text,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.planos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active plans" ON public.planos FOR SELECT USING (ativo = true);
CREATE POLICY "Admins can manage plans" ON public.planos FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Estabelecimentos table
CREATE TABLE public.estabelecimentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome text NOT NULL DEFAULT '',
  responsavel text NOT NULL DEFAULT '',
  telefone text NOT NULL DEFAULT '',
  endereco text NOT NULL DEFAULT '',
  cidade text NOT NULL DEFAULT '',
  estado text NOT NULL DEFAULT '',
  funcoes_utilizadas text[] DEFAULT '{}',
  logo_url text,
  onboarding_completo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);
ALTER TABLE public.estabelecimentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own estabelecimento" ON public.estabelecimentos FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own estabelecimento" ON public.estabelecimentos FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own estabelecimento" ON public.estabelecimentos FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can manage all estabelecimentos" ON public.estabelecimentos FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Assinaturas table
CREATE TABLE public.assinaturas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estabelecimento_id uuid NOT NULL REFERENCES public.estabelecimentos(id) ON DELETE CASCADE,
  plano_id uuid NOT NULL REFERENCES public.planos(id),
  status text NOT NULL DEFAULT 'ativa',
  inicio timestamptz NOT NULL DEFAULT now(),
  fim timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.assinaturas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Estabelecimento can view own subscription" ON public.assinaturas FOR SELECT TO authenticated USING (
  estabelecimento_id IN (SELECT id FROM public.estabelecimentos WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can manage subscriptions" ON public.assinaturas FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Profissionais table
CREATE TABLE public.profissionais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome text NOT NULL DEFAULT '',
  whatsapp text NOT NULL DEFAULT '',
  cidade text NOT NULL DEFAULT '',
  estado text NOT NULL DEFAULT '',
  funcoes text[] DEFAULT '{}',
  disponibilidade text[] DEFAULT '{}',
  diaria_minima decimal(10,2) DEFAULT 0,
  foto_url text,
  experiencia text,
  idiomas text[] DEFAULT '{}',
  certificacoes text[] DEFAULT '{}',
  curriculo_url text,
  instagram text,
  linkedin text,
  portfolio text,
  youtube text,
  trust_score decimal(3,2) NOT NULL DEFAULT 0,
  total_avaliacoes integer NOT NULL DEFAULT 0,
  onboarding_completo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);
ALTER TABLE public.profissionais ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profissionais can view own profile" ON public.profissionais FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Profissionais can insert own profile" ON public.profissionais FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Profissionais can update own profile" ON public.profissionais FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Estabelecimentos can view profissionais" ON public.profissionais FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'estabelecimento'));
CREATE POLICY "Admins can manage profissionais" ON public.profissionais FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Slots table
CREATE TABLE public.slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estabelecimento_id uuid NOT NULL REFERENCES public.estabelecimentos(id) ON DELETE CASCADE,
  funcao text NOT NULL,
  quantidade integer NOT NULL DEFAULT 1,
  data date NOT NULL,
  horario_inicio time NOT NULL,
  horario_fim time NOT NULL,
  valor decimal(10,2) NOT NULL DEFAULT 0,
  endereco text,
  urgente boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'aberto',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Estabelecimento can manage own slots" ON public.slots FOR ALL TO authenticated USING (
  estabelecimento_id IN (SELECT id FROM public.estabelecimentos WHERE user_id = auth.uid())
);
CREATE POLICY "Profissionais can view open slots" ON public.slots FOR SELECT TO authenticated USING (
  status IN ('aberto', 'reservado')
);
CREATE POLICY "Admins can manage all slots" ON public.slots FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Candidaturas table
CREATE TABLE public.candidaturas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id uuid NOT NULL REFERENCES public.slots(id) ON DELETE CASCADE,
  profissional_id uuid NOT NULL REFERENCES public.profissionais(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'enviada',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(slot_id, profissional_id)
);
ALTER TABLE public.candidaturas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profissional can manage own candidaturas" ON public.candidaturas FOR ALL TO authenticated USING (
  profissional_id IN (SELECT id FROM public.profissionais WHERE user_id = auth.uid())
);
CREATE POLICY "Estabelecimento can view candidaturas for own slots" ON public.candidaturas FOR SELECT TO authenticated USING (
  slot_id IN (SELECT id FROM public.slots WHERE estabelecimento_id IN (SELECT id FROM public.estabelecimentos WHERE user_id = auth.uid()))
);
CREATE POLICY "Estabelecimento can update candidaturas for own slots" ON public.candidaturas FOR UPDATE TO authenticated USING (
  slot_id IN (SELECT id FROM public.slots WHERE estabelecimento_id IN (SELECT id FROM public.estabelecimentos WHERE user_id = auth.uid()))
);
CREATE POLICY "Admins can manage all candidaturas" ON public.candidaturas FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Avaliacoes table
CREATE TABLE public.avaliacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidatura_id uuid NOT NULL REFERENCES public.candidaturas(id) ON DELETE CASCADE,
  avaliador_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  avaliado_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nota integer NOT NULL,
  comentario text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(candidatura_id, avaliador_id)
);
ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own avaliacoes" ON public.avaliacoes FOR SELECT TO authenticated USING (avaliador_id = auth.uid() OR avaliado_id = auth.uid());
CREATE POLICY "Users can insert avaliacoes" ON public.avaliacoes FOR INSERT TO authenticated WITH CHECK (avaliador_id = auth.uid());
CREATE POLICY "Admins can manage avaliacoes" ON public.avaliacoes FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Settings table
CREATE TABLE public.settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chave text NOT NULL UNIQUE,
  valor text,
  descricao text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings" ON public.settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Admin logs table
CREATE TABLE public.admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES auth.users(id),
  acao text NOT NULL,
  detalhes jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view logs" ON public.admin_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert logs" ON public.admin_logs FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Insert default plans
INSERT INTO public.planos (nome, slug, preco, limite_slots, recorrencia, exportar, destaques, relatorios, favoritos, descricao) VALUES
  ('Free', 'free', 0, 10, false, false, false, false, false, 'Ideal para testar a plataforma'),
  ('Moderado', 'moderado', 99.90, 40, true, true, true, true, false, 'Para estabelecimentos em crescimento'),
  ('Completo', 'completo', 199.90, null, true, true, true, true, true, 'Para operações de grande porte');

-- Insert default settings
INSERT INTO public.settings (chave, valor, descricao) VALUES
  ('aviso_legal', 'O Tem Staff cobra somente pelo uso da plataforma. O pagamento do serviço é feito diretamente entre as partes.', 'Aviso legal exibido nas vagas'),
  ('funcoes_disponiveis', 'Garçom,Bartender,Cozinheiro,Auxiliar de Cozinha,Cumim,Chef de Cozinha,Hostess,Barista,Sommelier,Confeiteiro', 'Funções disponíveis separadas por vírgula'),
  ('estados_disponiveis', 'AC,AL,AP,AM,BA,CE,DF,ES,GO,MA,MT,MS,MG,PA,PB,PR,PE,PI,RJ,RN,RS,RO,RR,SC,SP,SE,TO', 'Estados disponíveis');

-- Create storage bucket for curriculos
INSERT INTO storage.buckets (id, name, public) VALUES ('curriculos', 'curriculos', true);

-- Storage RLS for curriculos
CREATE POLICY "Users can upload own curriculo" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'curriculos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can update own curriculo" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'curriculos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Anyone can view curriculos" ON storage.objects FOR SELECT USING (bucket_id = 'curriculos');

-- Add profiles INSERT policy (needed for trigger)
CREATE POLICY "Trigger can insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);
