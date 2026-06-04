/*
  # Fix get_all_quote_items_for_admin function - drop and recreate

  ## Problem
  The function declared product_id as uuid but the actual column type is text.
  This type mismatch caused the function to return no rows silently.

  ## Fix
  Drop and recreate the function with product_id as text to match the actual schema.
*/

DROP FUNCTION IF EXISTS public.get_all_quote_items_for_admin();

CREATE FUNCTION public.get_all_quote_items_for_admin()
RETURNS TABLE (
  id uuid,
  quote_id uuid,
  product_id text,
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
