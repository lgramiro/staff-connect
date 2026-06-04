
-- Replace permissive INSERT policy with a self-only policy
DROP POLICY IF EXISTS "Usuários autenticados podem criar notificações" ON public.notificacoes;

CREATE POLICY "Users can create own notifications"
ON public.notificacoes
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Security-definer RPC to create cross-user notifications, validating the
-- caller has a legitimate candidatura relationship with the recipient.
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

REVOKE ALL ON FUNCTION public.create_notificacao(uuid, text, text, text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_notificacao(uuid, text, text, text, uuid) TO authenticated;
