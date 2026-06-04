/*
  # Enable Realtime on quotes table and fix is_admin search_path

  1. Realtime
    - Add `quotes` table to the supabase_realtime publication so the admin
      dashboard receives live INSERT events when clients submit quote requests.

  2. is_admin() function
    - Recreate with explicit `search_path = public` set via SET clause (not
      via proconfig) so the security scanner is satisfied and the function
      resolves `user_profiles` correctly.
*/

-- ============================================================
-- 1. Enable Realtime for quotes table
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'quotes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.quotes;
  END IF;
END $$;

-- ============================================================
-- 2. Fix is_admin() function — explicit search_path in SET clause
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM user_profiles WHERE id = auth.uid()),
    false
  );
$$;
