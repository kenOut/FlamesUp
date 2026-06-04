/*
  # Add SECURITY DEFINER function for admin to fetch all quote items

  ## Problem
  The admin needs to fetch all quote_items for all quotes. The RLS policy on
  quote_items for admins uses a subquery into user_profiles, which can have
  the same nested RLS evaluation issues as on the quotes table.

  ## Fix
  Create get_all_quote_items_for_admin() as a SECURITY DEFINER function that
  bypasses RLS and returns all quote items only if the caller is an admin.
*/

CREATE OR REPLACE FUNCTION public.get_all_quote_items_for_admin()
RETURNS TABLE (
  id uuid,
  quote_id uuid,
  product_id uuid,
  product_name text,
  quantity integer,
  unit_price text,
  created_at timestamptz
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
    qi.id, qi.quote_id, qi.product_id, qi.product_name,
    qi.quantity, qi.unit_price, qi.created_at
  FROM public.quote_items qi
  ORDER BY qi.created_at ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_all_quote_items_for_admin() TO authenticated;
