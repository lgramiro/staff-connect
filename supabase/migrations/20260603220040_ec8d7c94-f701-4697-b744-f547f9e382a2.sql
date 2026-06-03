-- 1. Revoke public execution on handle_new_user (it's a trigger on auth.users and should not be called manually)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;

-- 2. Ensure security definer functions are restricted
REVOKE EXECUTE ON FUNCTION public.setup_user_profile(text, app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.setup_user_profile(text, app_role) FROM anon;
GRANT EXECUTE ON FUNCTION public.setup_user_profile(text, app_role) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;

-- 3. Add administrative policies for profiles and user_roles where they might be missing
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage profiles' AND tablename = 'profiles') THEN
        CREATE POLICY "Admins can manage profiles" ON public.profiles
        FOR ALL TO authenticated
        USING (public.has_role(auth.uid(), 'admin'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage all user_roles' AND tablename = 'user_roles') THEN
        CREATE POLICY "Admins can manage all user_roles" ON public.user_roles
        FOR ALL TO authenticated
        USING (public.has_role(auth.uid(), 'admin'));
    END IF;
END $$;
