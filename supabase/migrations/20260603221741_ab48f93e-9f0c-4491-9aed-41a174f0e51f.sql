-- Final Security Adjustments to satisfy linter

-- 1. Add admin policy to user_roles using direct SQL to avoid recursion with has_role
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all user_roles' AND tablename = 'user_roles') THEN
        CREATE POLICY "Admins can view all user_roles" ON public.user_roles
        FOR SELECT TO authenticated
        USING (
          (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin') IS NOT NULL
        );
    END IF;
END $$;

-- 2. Add restricted insert policy for users on user_roles
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own roles' AND tablename = 'user_roles') THEN
        CREATE POLICY "Users can insert own roles" ON public.user_roles
        FOR INSERT TO authenticated
        WITH CHECK (
          user_id = auth.uid() 
          AND role IN ('profissional'::app_role, 'estabelecimento'::app_role)
        );
    END IF;
END $$;

-- 3. Change has_role to SECURITY INVOKER
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY INVOKER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$function$;

-- 4. Change setup_user_profile to SECURITY INVOKER
CREATE OR REPLACE FUNCTION public.setup_user_profile(p_nome text DEFAULT ''::text, p_role app_role DEFAULT 'profissional'::app_role)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY INVOKER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Security check: users can only self-assign non-admin roles
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
$function$;
