-- Fix search path and grants for delete_seed_data
ALTER FUNCTION delete_seed_data() SET search_path = public;
GRANT EXECUTE ON FUNCTION delete_seed_data() TO anon, authenticated;

-- Fix search path and grants for insert_seed_data
ALTER FUNCTION insert_seed_data() SET search_path = public;
GRANT EXECUTE ON FUNCTION insert_seed_data() TO anon, authenticated;