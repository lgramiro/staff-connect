-- Revoke execute from public (which includes anon)
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC;

-- Grant execute to authenticated and service_role
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO service_role;
