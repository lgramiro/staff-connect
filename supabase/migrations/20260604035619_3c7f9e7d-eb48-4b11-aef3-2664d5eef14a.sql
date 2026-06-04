-- 1. Revoke unnecessary EXECUTE from authenticated on trigger function
REVOKE EXECUTE ON FUNCTION public.update_trust_score() FROM authenticated;

-- 2. Change is_admin to SECURITY INVOKER for better security
-- Since it only checks the current user's role, and the user has SELECT on their own role,
-- SECURITY DEFINER is not needed and poses a risk.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  );
END;
$$;

-- 3. Add input validation to create_notificacao
CREATE OR REPLACE FUNCTION public.create_notificacao(
  p_user_id uuid,
  p_titulo text,
  p_mensagem text DEFAULT NULL,
  p_tipo text DEFAULT NULL,
  p_referencia_id uuid DEFAULT NULL
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
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Input validation
  IF length(p_titulo) > 100 THEN
    RAISE EXCEPTION 'Title too long (max 100 chars)';
  END IF;
  IF p_mensagem IS NOT NULL AND length(p_mensagem) > 1000 THEN
    RAISE EXCEPTION 'Message too long (max 1000 chars)';
  END IF;

  -- Always allow self-notifications
  IF p_user_id = v_caller THEN
    v_allowed := true;
  END IF;

  -- Allow if caller owns an estabelecimento that has a candidatura
  -- from the recipient (recipient is a profissional who applied to caller's slot)
  IF NOT v_allowed THEN
    SELECT EXISTS (
      SELECT 1
      FROM public.candidaturas c
      JOIN public.slots s ON s.id = c.slot_id
      JOIN public.estabelecimentos e ON e.id = s.estabelecimento_id
      JOIN public.profissionais p ON p.id = c.profissional_id
      WHERE e.user_id = v_caller
        AND p.user_id = p_user_id
    ) INTO v_allowed;
  END IF;

  -- Allow if caller is a profissional with a candidatura on a slot whose
  -- estabelecimento is owned by the recipient
  IF NOT v_allowed THEN
    SELECT EXISTS (
      SELECT 1
      FROM public.candidaturas c
      JOIN public.profissionais p ON p.id = c.profissional_id
      JOIN public.slots s ON s.id = c.slot_id
      JOIN public.estabelecimentos e ON e.id = s.estabelecimento_id
      WHERE p.user_id = v_caller
        AND e.user_id = p_user_id
    ) INTO v_allowed;
  END IF;

  -- Admins can always send
  IF NOT v_allowed AND public.has_role(v_caller, 'admin'::app_role) THEN
    v_allowed := true;
  END IF;

  IF NOT v_allowed THEN
    RAISE EXCEPTION 'Not authorized to notify this user';
  END IF;

  INSERT INTO public.notificacoes (user_id, titulo, mensagem, tipo, referencia_id)
  VALUES (p_user_id, p_titulo, p_mensagem, p_tipo, p_referencia_id)
  RETURNING id INTO v_new_id;

  RETURN v_new_id;
END;
$$;

-- 4. Strengthen avaliacoes INSERT policy
-- A user should only evaluate someone they had a job relationship with (via candidatura)
DROP POLICY IF EXISTS "Users can insert avaliacoes" ON public.avaliacoes;

CREATE POLICY "Users can insert avaliacoes if relationship exists"
ON public.avaliacoes
FOR INSERT
TO authenticated
WITH CHECK (
  avaliador_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.candidaturas c
    JOIN public.slots s ON s.id = c.slot_id
    JOIN public.estabelecimentos e ON e.id = s.estabelecimento_id
    JOIN public.profissionais p ON p.id = c.profissional_id
    WHERE (
      -- Caller is professional, evaluating establishment
      (p.user_id = auth.uid() AND e.user_id = avaliado_id) OR
      -- Caller is establishment owner, evaluating professional
      (e.user_id = auth.uid() AND p.user_id = avaliado_id)
    )
    -- Optionally ensure the slot is completed/past
    -- AND s.data <= CURRENT_DATE
  )
);
