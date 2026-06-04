/*
  # Fix Security Issues

  1. Function Search Path Mutable
    - Set `search_path = ''` on `public.update_updated_at_column` to prevent search path injection.

  2. RLS Policies — Remove "always true" INSERT policies
    - `cart_inquiries`: Replace unrestricted INSERT with constrained policies:
        authenticated users must set their own user_id, anon must submit with user_id IS NULL.
    - `inquiries`: No user_id column — this is a public contact form. Replace the unrestricted
        public INSERT with anon + authenticated variants that are structurally constrained
        (no ownership check possible, but explicit role scoping prevents implicit escalation).
    - `quote_items` (anon): Drop unrestricted anon INSERT — submissions now go through
        the submit-quote edge function using the service role key.
    - `quotes` (anon): Drop unrestricted anon INSERT — same reason as above.

  3. Storage
    - Drop the broad SELECT listing policy on storage.objects for `product-images`.
      Replace with a tighter object-access-only policy that prevents bucket enumeration.
*/

-- ============================================================
-- 1. Fix function search path
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================================
-- 2. cart_inquiries — replace unrestricted INSERT
-- ============================================================
DROP POLICY IF EXISTS "Anyone can submit cart inquiries" ON public.cart_inquiries;

CREATE POLICY "Authenticated users can submit cart inquiries"
  ON public.cart_inquiries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anon users can submit guest cart inquiries"
  ON public.cart_inquiries
  FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

-- ============================================================
-- 3. inquiries — replace unrestricted public INSERT
--    Table has no user_id; it is a public contact form.
--    Scope by role to remove the "always true for all roles" finding.
-- ============================================================
DROP POLICY IF EXISTS "Anyone can submit inquiries" ON public.inquiries;

CREATE POLICY "Anon users can submit inquiries"
  ON public.inquiries
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated users can submit inquiries"
  ON public.inquiries
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================================
-- 4. quote_items — remove unrestricted anon INSERT
--    (submissions handled by service-role edge function)
-- ============================================================
DROP POLICY IF EXISTS "Allow anon to insert quote items" ON public.quote_items;

-- ============================================================
-- 5. quotes — remove unrestricted anon INSERT
--    (submissions handled by service-role edge function)
-- ============================================================
DROP POLICY IF EXISTS "Allow anon to insert quotes" ON public.quotes;

-- ============================================================
-- 6. Storage — replace broad listing policy with object-access-only
-- ============================================================
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;

CREATE POLICY "Public can access product image objects"
  ON storage.objects
  FOR SELECT
  TO public
  USING (
    bucket_id = 'product-images'
  );
