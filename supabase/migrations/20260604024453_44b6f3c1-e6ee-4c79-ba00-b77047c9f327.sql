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

DROP TRIGGER IF EXISTS trigger_update_trust_score ON public.avaliacoes;

CREATE TRIGGER trigger_update_trust_score
AFTER INSERT OR UPDATE OR DELETE ON public.avaliacoes
FOR EACH ROW
EXECUTE FUNCTION public.update_trust_score();
