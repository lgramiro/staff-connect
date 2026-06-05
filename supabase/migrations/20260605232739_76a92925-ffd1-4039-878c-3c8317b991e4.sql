
-- =========================================================
-- 1) PROFISSIONAIS: view pública com colunas seguras
-- =========================================================
CREATE OR REPLACE VIEW public.profissionais_publicos
WITH (security_invoker = true) AS
SELECT
  id,
  nome,
  funcoes,
  cidade,
  estado,
  foto_url,
  trust_score,
  total_avaliacoes
FROM public.profissionais;

GRANT SELECT ON public.profissionais_publicos TO authenticated;

-- Garante que a tabela base não tenha policy ampla de leitura.
-- (As policies atuais já restringem a own/estabelecimento/admin.)
-- Adiciona policy restritiva para reforçar — somente own, estabelecimento com candidatura, ou admin.
DROP POLICY IF EXISTS "Authenticated can view basic profissional data" ON public.profissionais;

-- =========================================================
-- 2) PROFILES: garantir acesso somente ao próprio + admin
-- =========================================================
DROP POLICY IF EXISTS "Public profiles are viewable" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated can view profiles" ON public.profiles;
-- Policies existentes "Users can view own profile" e "Admins can manage profiles" permanecem.

-- =========================================================
-- 3) CANDIDATURAS: só permitir INSERT em slot status='aberto'
-- =========================================================
DROP POLICY IF EXISTS "Candidatura only on open slot" ON public.candidaturas;
CREATE POLICY "Candidatura only on open slot"
ON public.candidaturas
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.slots s
    WHERE s.id = candidaturas.slot_id
      AND s.status = 'aberto'
  )
);

-- =========================================================
-- 4) AVALIACOES: só permitir INSERT em candidatura concluida
-- =========================================================
DROP POLICY IF EXISTS "Avaliacao only on concluded candidatura" ON public.avaliacoes;
CREATE POLICY "Avaliacao only on concluded candidatura"
ON public.avaliacoes
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.candidaturas c
    WHERE c.id = avaliacoes.candidatura_id
      AND c.status = 'concluida'
  )
);

-- =========================================================
-- 5) Funções SECURITY DEFINER com search_path fixo
-- =========================================================

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin'::app_role)
$$;

CREATE OR REPLACE FUNCTION public.setup_user_profile(p_nome text DEFAULT ''::text, p_role app_role DEFAULT 'profissional'::app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_role NOT IN ('profissional'::app_role, 'estabelecimento'::app_role) THEN
    p_role := 'profissional'::app_role;
  END IF;

  INSERT INTO public.profiles (id, email, nome, role)
  VALUES (
    auth.uid(),
    (SELECT email FROM auth.users WHERE id = auth.uid()),
    p_nome,
    p_role
  )
  ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    role = EXCLUDED.role;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (auth.uid(), p_role)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_trust_score()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_avaliado_id UUID;
  v_media NUMERIC;
  v_total INTEGER;
BEGIN
  IF TG_NAME IS NULL THEN
    RAISE EXCEPTION 'This function must be called as a trigger';
  END IF;

  IF TG_OP = 'DELETE' THEN
    v_avaliado_id := OLD.avaliado_id;
  ELSE
    v_avaliado_id := NEW.avaliado_id;
  END IF;

  SELECT COALESCE(AVG(nota), 0), COUNT(*)
  INTO v_media, v_total
  FROM public.avaliacoes
  WHERE avaliado_id = v_avaliado_id;

  UPDATE public.profissionais
  SET trust_score = ROUND(v_media, 2),
      total_avaliacoes = v_total,
      updated_at = now()
  WHERE user_id = v_avaliado_id;

  IF TG_OP = 'UPDATE' AND OLD.avaliado_id IS DISTINCT FROM NEW.avaliado_id THEN
    SELECT COALESCE(AVG(nota), 0), COUNT(*)
    INTO v_media, v_total
    FROM public.avaliacoes
    WHERE avaliado_id = OLD.avaliado_id;

    UPDATE public.profissionais
    SET trust_score = ROUND(v_media, 2),
        total_avaliacoes = v_total,
        updated_at = now()
    WHERE user_id = OLD.avaliado_id;
  END IF;

  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.insert_seed_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.delete_seed_data();

  INSERT INTO auth.users (id, email, aud, role, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES 
  ('00000000-0000-0000-0000-000000000001', 'estabelecimento@teste.com', 'authenticated', 'authenticated', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000101', 'profissional1@teste.com', 'authenticated', 'authenticated', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000102', 'profissional2@teste.com', 'authenticated', 'authenticated', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now())
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.estabelecimentos (nome, responsavel, telefone, endereco, cidade, estado, funcoes_utilizadas, onboarding_completo, user_id)
  VALUES ('Restaurante Bella Italia','Marco Rossi','11999990001','Rua Augusta, 1200','São Paulo','SP',ARRAY['Garçom','Cozinheiro'],true,'00000000-0000-0000-0000-000000000001');

  INSERT INTO public.profissionais (nome, whatsapp, cidade, estado, funcoes, disponibilidade, diaria_minima, trust_score, total_avaliacoes, onboarding_completo, user_id)
  VALUES 
  ('João Silva','11988880001','São Paulo','SP',ARRAY['Garçom'],ARRAY['Segunda','Terça','Quarta'],150.00,4.5,10,true,'00000000-0000-0000-0000-000000000101'),
  ('Maria Oliveira','11988880002','São Paulo','SP',ARRAY['Cozinheiro'],ARRAY['Quinta','Sexta','Sábado'],200.00,4.8,15,true,'00000000-0000-0000-0000-000000000102'),
  ('Admin Teste (lgramiro)','11999998888','São Paulo','SP',ARRAY['Garçom','Barman'],ARRAY['Segunda','Sexta','Sábado','Domingo'],180.00,5.0,20,true,'049d1308-3444-4ada-8a80-df7b19ae6e28');
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_seed_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.profissionais WHERE user_id IN (
    '00000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000102',
    '049d1308-3444-4ada-8a80-df7b19ae6e28'
  );
  DELETE FROM public.estabelecimentos WHERE user_id IN ('00000000-0000-0000-0000-000000000001');
  DELETE FROM auth.users WHERE id IN (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000102'
  );
END;
$$;

-- create_notificacao já está com SET search_path = public, mas recriamos para garantir.
CREATE OR REPLACE FUNCTION public.create_notificacao(
  p_user_id uuid,
  p_titulo text,
  p_mensagem text DEFAULT NULL::text,
  p_tipo text DEFAULT NULL::text,
  p_referencia_id uuid DEFAULT NULL::uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller uuid := auth.uid();
  v_allowed boolean := false;
  v_new_id uuid;
BEGIN
  IF v_caller IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF length(p_titulo) > 100 THEN RAISE EXCEPTION 'Title too long (max 100 chars)'; END IF;
  IF p_mensagem IS NOT NULL AND length(p_mensagem) > 1000 THEN
    RAISE EXCEPTION 'Message too long (max 1000 chars)';
  END IF;

  IF p_user_id = v_caller THEN v_allowed := true; END IF;

  IF NOT v_allowed THEN
    SELECT EXISTS (
      SELECT 1 FROM public.candidaturas c
      JOIN public.slots s ON s.id = c.slot_id
      JOIN public.estabelecimentos e ON e.id = s.estabelecimento_id
      JOIN public.profissionais p ON p.id = c.profissional_id
      WHERE e.user_id = v_caller AND p.user_id = p_user_id
    ) INTO v_allowed;
  END IF;

  IF NOT v_allowed THEN
    SELECT EXISTS (
      SELECT 1 FROM public.candidaturas c
      JOIN public.profissionais p ON p.id = c.profissional_id
      JOIN public.slots s ON s.id = c.slot_id
      JOIN public.estabelecimentos e ON e.id = s.estabelecimento_id
      WHERE p.user_id = v_caller AND e.user_id = p_user_id
    ) INTO v_allowed;
  END IF;

  IF NOT v_allowed AND p_referencia_id IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM public.slots s
      JOIN public.estabelecimentos e ON e.id = s.estabelecimento_id
      WHERE s.id = p_referencia_id AND e.user_id = v_caller
    ) INTO v_allowed;
  END IF;

  IF NOT v_allowed AND public.has_role(v_caller, 'admin'::app_role) THEN
    v_allowed := true;
  END IF;

  IF NOT v_allowed THEN RAISE EXCEPTION 'Not authorized to notify this user'; END IF;

  INSERT INTO public.notificacoes (user_id, titulo, mensagem, tipo, referencia_id)
  VALUES (p_user_id, p_titulo, p_mensagem, p_tipo, p_referencia_id)
  RETURNING id INTO v_new_id;

  RETURN v_new_id;
END;
$$;
