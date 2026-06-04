-- Grant usage on public schema
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Grant permissions on all existing tables in public schema
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Re-enable RLS on key tables just in case
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Fix recursion in profiles policy
DROP POLICY IF EXISTS "Admins can manage profiles" ON public.profiles;
CREATE POLICY "Admins can manage profiles" ON public.profiles
FOR ALL USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);
-- Wait, the above still has a subquery. Let's use a more efficient way if possible.
-- Actually, the best way to avoid recursion is to use the JWT claim if possible, 
-- or a separate table that doesn't trigger the same policy.
-- Since we have user_roles, let's use that.

DROP POLICY IF EXISTS "Admins can manage profiles" ON public.profiles;
CREATE POLICY "Admins can manage profiles" ON public.profiles
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);

-- Fix user_roles policies
DROP POLICY IF EXISTS "Admins can manage all user_roles" ON public.user_roles;
CREATE POLICY "Admins can manage all user_roles" ON public.user_roles
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'
  )
);
-- Note: PostgreSQL is usually smart enough to handle this "exists" on the same table 
-- if it's a simple lookup, but if it recurses, we might need a function.
-- Let's use a function to check admin role safely.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update policies to use the function
DROP POLICY IF EXISTS "Admins can manage profiles" ON public.profiles;
CREATE POLICY "Admins can manage profiles" ON public.profiles
FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage all user_roles" ON public.user_roles;
CREATE POLICY "Admins can manage all user_roles" ON public.user_roles
FOR ALL TO authenticated USING (public.is_admin());

-- Ensure the user we are testing with is an admin in the profiles table too
UPDATE public.profiles SET role = 'admin' WHERE email = 'lgramirodecampos@gmail.com';
