/*
  # Add SECURITY DEFINER function for admin to fetch all quotes

  ## Problem
  The admin SELECT policy on quotes subqueries user_profiles, which goes through
  RLS itself. While theoretically correct, there are edge cases with Supabase's
  PostgREST layer and nested RLS evaluations that can silently return empty results.

  ## Fix
  Create a SECURITY DEFINER function get_all_quotes_for_admin() that:
  1. Verifies the calling user is an admin (reads user_profiles bypassing RLS)
  2. Returns all quotes with their items if they are an admin
  3. Returns empty if not an admin
  
  This runs as the function owner (postgres) and bypasses all RLS chains entirely.
*/

CREATE OR REPLACE FUNCTION public.get_all_quotes_for_admin()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  name text,
  email text,
  phone text,
  company text,
  message text,
  status text,
  quoted_price text,
  delivery_fee text,
  admin_notes text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_is_admin boolean;
BEGIN
  SELECT COALESCE(up.is_admin, false)
  INTO caller_is_admin
  FROM public.user_profiles up
  WHERE up.id = auth.uid();

  IF NOT COALESCE(caller_is_admin, false) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    q.id, q.user_id, q.name, q.email, q.phone, q.company,
    q.message, q.status, q.quoted_price, q.delivery_fee,
    q.admin_notes, q.created_at, q.updated_at
  FROM public.quotes q
  ORDER BY q.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_all_quotes_for_admin() TO authenticated;
