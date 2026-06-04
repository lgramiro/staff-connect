-- Fix SECURITY DEFINER function exposures and search_path hijacking risks

-- 1. handle_new_user (auth trigger)
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role, postgres;

-- 2. update_trust_score (trigger on public.avaliacoes)
REVOKE ALL ON FUNCTION public.update_trust_score() FROM PUBLIC, anon;
ALTER FUNCTION public.update_trust_score() SET search_path = public;
GRANT EXECUTE ON FUNCTION public.update_trust_score() TO authenticated, service_role, postgres;

-- 3. is_admin (used in RLS policies)
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;
ALTER FUNCTION public.is_admin() SET search_path = public;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role, postgres;

-- 4. create_notificacao (RPC for notifications)
-- Re-asserting the restricted access and setting search_path
REVOKE ALL ON FUNCTION public.create_notificacao(uuid, text, text, text, uuid) FROM PUBLIC, anon;
ALTER FUNCTION public.create_notificacao(uuid, text, text, text, uuid) SET search_path = public;
GRANT EXECUTE ON FUNCTION public.create_notificacao(uuid, text, text, text, uuid) TO authenticated, service_role, postgres;

-- Security hardening: add trigger check for update_trust_score
CREATE OR REPLACE FUNCTION public.update_trust_score()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_avaliado_id UUID;
  v_media NUMERIC;
  v_total INTEGER;
BEGIN
  -- Security check: only allow execution as a trigger
  IF TG_NAME IS NULL THEN
    RAISE EXCEPTION 'This function must be called as a trigger';
  END IF;

  -- Determina qual avaliado_id afetar (no DELETE usa OLD, caso contrário NEW)
  IF TG_OP = 'DELETE' THEN
    v_avaliado_id := OLD.avaliado_id;
  ELSE
    v_avaliado_id := NEW.avaliado_id;
  END IF;

  -- Calcula média e total de avaliações
  SELECT COALESCE(AVG(nota), 0), COUNT(*)
  INTO v_media, v_total
  FROM public.avaliacoes
  WHERE avaliado_id = v_avaliado_id;

  -- Atualiza profissional (avaliado_id corresponde ao user_id do profissional)
  UPDATE public.profissionais
  SET trust_score = ROUND(v_media, 2),
      total_avaliacoes = v_total,
      updated_at = now()
  WHERE user_id = v_avaliado_id;

  -- Em UPDATE, se o avaliado_id mudou, recalcula também o antigo
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

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;
