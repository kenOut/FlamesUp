/*
  # Fix admin RLS policies for quotes and quote_items

  ## Problem
  The admin SELECT/UPDATE/DELETE policies on quotes and quote_items all call
  is_admin(), which is a SECURITY DEFINER function. While correct in theory,
  there can be edge cases during session establishment. We add an additional
  inline subquery-based policy as a reliable fallback.

  ## Changes
  - Drop and recreate admin SELECT policy on quotes using a direct subquery
    into user_profiles instead of relying solely on the is_admin() function call.
  - Same fix for quote_items admin SELECT policy.
  - This ensures the admin can always see all quotes when logged in.
*/

-- Fix quotes admin select policy
DROP POLICY IF EXISTS "Admins have full quote access select" ON public.quotes;
CREATE POLICY "Admins have full quote access select"
  ON public.quotes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.is_admin = true
    )
  );

-- Fix quotes admin update policy
DROP POLICY IF EXISTS "Admins have full quote access update" ON public.quotes;
CREATE POLICY "Admins have full quote access update"
  ON public.quotes
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.is_admin = true
    )
  );

-- Fix quotes admin delete policy
DROP POLICY IF EXISTS "Admins have full quote access delete" ON public.quotes;
CREATE POLICY "Admins have full quote access delete"
  ON public.quotes
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.is_admin = true
    )
  );

-- Fix quote_items admin select policy
DROP POLICY IF EXISTS "Admins have full quote_items access select" ON public.quote_items;
CREATE POLICY "Admins have full quote_items access select"
  ON public.quote_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.is_admin = true
    )
  );

-- Fix quote_items admin update policy
DROP POLICY IF EXISTS "Admins have full quote_items access update" ON public.quote_items;
CREATE POLICY "Admins have full quote_items access update"
  ON public.quote_items
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.is_admin = true
    )
  );

-- Fix quote_items admin delete policy
DROP POLICY IF EXISTS "Admins have full quote_items access delete" ON public.quote_items;
CREATE POLICY "Admins have full quote_items access delete"
  ON public.quote_items
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.is_admin = true
    )
  );

-- Fix quote_items admin insert policy
DROP POLICY IF EXISTS "Admins have full quote_items access insert" ON public.quote_items;
CREATE POLICY "Admins have full quote_items access insert"
  ON public.quote_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.is_admin = true
    )
  );
