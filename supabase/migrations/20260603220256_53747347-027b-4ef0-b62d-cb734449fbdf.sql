CREATE OR REPLACE FUNCTION public.setup_user_profile(p_nome text DEFAULT ''::text, p_role app_role DEFAULT 'profissional'::app_role)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
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
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (auth.uid(), p_role)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$function$;
