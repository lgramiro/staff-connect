
-- Replace overly permissive INSERT policy on profiles with a proper one
DROP POLICY IF EXISTS "Trigger can insert profiles" ON public.profiles;
-- The handle_new_user trigger runs as SECURITY DEFINER so it bypasses RLS.
-- No additional INSERT policy needed on profiles.
