/*
  # Fix circular RLS dependency in is_admin()

  ## Problem
  The is_admin() function queries user_profiles to check if the current user
  is an admin. However, user_profiles has an RLS SELECT policy called
  "Admins can read all profiles" that itself calls is_admin(). This creates
  a circular dependency:
    - is_admin() → SELECT from user_profiles → RLS policy → is_admin() → ...

  This infinite recursion causes PostgreSQL to silently return false/empty,
  which means admins cannot see any quotes, orders, or other admin-protected data.

  ## Fix
  1. Rewrite is_admin() as a PL/pgSQL SECURITY DEFINER function that disables
     row-level security for its own query using SET LOCAL row_security = OFF.
     Because SECURITY DEFINER runs as the function owner (postgres/service role),
     this is safe and breaks the circular dependency entirely.

  2. Drop the problematic "Admins can read all profiles" policy which caused
     the recursion. Replace with a simpler policy that reads the is_admin flag
     directly from the JWT app_metadata instead, avoiding any table lookup.

  ## Security
  - is_admin() still only returns true for users whose user_profiles row has
    is_admin = true — no change in access control semantics.
  - RLS is only disabled inside the SECURITY DEFINER function itself, which
    runs as the function owner, not as the calling user.
*/

-- ============================================================
-- 1. Rewrite is_admin() to bypass RLS on its own query
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
  RETURNS boolean
  LANGUAGE plpgsql
  STABLE
  SECURITY DEFINER
  SET search_path = public
AS $$
DECLARE
  result boolean;
BEGIN
  SET LOCAL row_security = OFF;
  SELECT COALESCE(is_admin, false)
  INTO result
  FROM public.user_profiles
  WHERE id = auth.uid();
  RETURN COALESCE(result, false);
END;
$$;

-- ============================================================
-- 2. Drop the circular "Admins can read all profiles" policy
--    and replace with one that does NOT call is_admin()
-- ============================================================
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.user_profiles;

CREATE POLICY "Admins can read all profiles"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
    OR auth.uid() = id
  );
