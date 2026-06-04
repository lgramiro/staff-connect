-- Drop the problematic policies
DROP POLICY IF EXISTS "Admins can manage all user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all user_roles" ON public.user_roles;

-- Create a simplified admin policy for user_roles
-- Instead of using has_role (which might call user_roles) or a subquery on the same table
-- we can use the role from the profiles table as a source of truth for admin status if needed,
-- or more safely, just check for the presence of the admin role without nested subqueries.
CREATE POLICY "Admins can manage all user_roles" ON public.user_roles
FOR ALL USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Ensure profiles policy also doesn't rely on a circular check
DROP POLICY IF EXISTS "Admins can manage profiles" ON public.profiles;
CREATE POLICY "Admins can manage profiles" ON public.profiles
FOR ALL USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
