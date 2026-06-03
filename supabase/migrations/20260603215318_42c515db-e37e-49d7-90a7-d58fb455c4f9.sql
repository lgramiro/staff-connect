
-- 1. Fix privilege escalation: users cannot self-assign admin role
DROP POLICY IF EXISTS "Users can insert own roles" ON public.user_roles;
CREATE POLICY "Users can insert own non-admin roles"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND role IN ('profissional'::app_role, 'estabelecimento'::app_role));

-- 2. Restrict profissionais visibility: only show those who applied to estabelecimento's slots
DROP POLICY IF EXISTS "Estabelecimentos can view profissionais" ON public.profissionais;
CREATE POLICY "Estabelecimentos can view applicants to own slots"
  ON public.profissionais FOR SELECT TO authenticated
  USING (
    id IN (
      SELECT c.profissional_id
      FROM public.candidaturas c
      JOIN public.slots s ON s.id = c.slot_id
      JOIN public.estabelecimentos e ON e.id = s.estabelecimento_id
      WHERE e.user_id = auth.uid()
    )
  );

-- 3. Storage: add DELETE policy for curriculos
CREATE POLICY "Users can delete own curriculo"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'curriculos' AND (storage.foldername(name))[1] = (auth.uid())::text);

-- 4. Storage: restrict fotos INSERT to user's own folder
DROP POLICY IF EXISTS "Authenticated users can upload photos" ON storage.objects;
CREATE POLICY "Users can upload own photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'fotos' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- 5. Restrict public listing: scope SELECT on curriculos to owner; remove broad listing on fotos
DROP POLICY IF EXISTS "Anyone can view curriculos" ON storage.objects;
CREATE POLICY "Users can view own curriculo"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'curriculos' AND (storage.foldername(name))[1] = (auth.uid())::text);

DROP POLICY IF EXISTS "Anyone can view photos" ON storage.objects;
CREATE POLICY "Owners can list own photos"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'fotos' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- 6. Lock down SECURITY DEFINER function execution from anon/public
REVOKE EXECUTE ON FUNCTION public.setup_user_profile(text, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.setup_user_profile(text, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
