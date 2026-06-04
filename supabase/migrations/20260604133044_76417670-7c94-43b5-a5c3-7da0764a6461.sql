CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin'::app_role)
$$;

CREATE OR REPLACE FUNCTION public.user_owns_profissional(_profissional_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profissionais p
    WHERE p.id = _profissional_id
      AND p.user_id = _user_id
  )
$$;

CREATE OR REPLACE FUNCTION public.estabelecimento_can_view_profissional(_profissional_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.candidaturas c
    JOIN public.slots s ON s.id = c.slot_id
    JOIN public.estabelecimentos e ON e.id = s.estabelecimento_id
    WHERE c.profissional_id = _profissional_id
      AND e.user_id = _user_id
  )
$$;

DROP POLICY IF EXISTS "Estabelecimentos can view applicants to own slots" ON public.profissionais;
CREATE POLICY "Estabelecimentos can view applicants to own slots"
ON public.profissionais
FOR SELECT
TO authenticated
USING (public.estabelecimento_can_view_profissional(id, auth.uid()));

DROP POLICY IF EXISTS "Profissional can manage own candidaturas" ON public.candidaturas;
CREATE POLICY "Profissional can manage own candidaturas"
ON public.candidaturas
FOR ALL
TO authenticated
USING (public.user_owns_profissional(profissional_id, auth.uid()))
WITH CHECK (public.user_owns_profissional(profissional_id, auth.uid()));