-- Fix search path and execution permissions for is_admin
ALTER FUNCTION public.is_admin() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM public;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;
