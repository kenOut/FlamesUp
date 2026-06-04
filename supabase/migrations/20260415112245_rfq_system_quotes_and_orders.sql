/*
  # RFQ System: Quotes, Quote Items, and Orders

  ## Summary
  Full Request-for-Quote transaction system replacing the old cart_inquiries flow.
  
  ## New Tables

  ### quotes
  - Core quote record created when a user submits items for pricing
  - Tracks status: PENDING → QUOTED → ACCEPTED/REJECTED
  - Stores contact info, notes, admin pricing, delivery fee

  ### quote_items
  - Individual line items for each quote
  - Supports admin-added unit price per line

  ## Modified Tables

  ### orders
  - Added quote_id FK to link accepted quotes to orders
  - Added total_price, delivery_fee columns

  ## Status Flow
  - Quote: pending → quoted → accepted | rejected
  - Order: pending → confirmed → shipped → delivered | cancelled

  ## Security
  - RLS enabled on both new tables
  - Users can only see their own quotes and quote items
  - Admins have full access
*/

-- =============================================
-- QUOTES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  -- Contact info (also stored for guest/non-user quotes)
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  company text,
  message text,
  -- Status tracking
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'quoted', 'accepted', 'rejected')),
  -- Admin pricing fields (filled when admin sends quote)
  quoted_price text,
  delivery_fee text,
  admin_notes text,
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quotes"
  ON quotes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert quotes"
  ON quotes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quote status (accept/reject)"
  ON quotes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins have full quote access select"
  ON quotes FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins have full quote access update"
  ON quotes FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins have full quote access delete"
  ON quotes FOR DELETE
  TO authenticated
  USING (is_admin());

CREATE POLICY "Allow anon to insert quotes"
  ON quotes FOR INSERT
  TO anon
  WITH CHECK (true);

-- =============================================
-- QUOTE ITEMS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS quote_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  product_id text,
  product_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quote items"
  ON quote_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quotes
      WHERE quotes.id = quote_items.quote_id
      AND quotes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert quote items"
  ON quote_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quotes
      WHERE quotes.id = quote_items.quote_id
      AND quotes.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins have full quote_items access select"
  ON quote_items FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins have full quote_items access insert"
  ON quote_items FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins have full quote_items access update"
  ON quote_items FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins have full quote_items access delete"
  ON quote_items FOR DELETE
  TO authenticated
  USING (is_admin());

CREATE POLICY "Allow anon to insert quote items"
  ON quote_items FOR INSERT
  TO anon
  WITH CHECK (true);

-- =============================================
-- UPDATE ORDERS TABLE
-- =============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'quote_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN quote_id uuid REFERENCES quotes(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'total_price'
  ) THEN
    ALTER TABLE orders ADD COLUMN total_price text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'delivery_fee'
  ) THEN
    ALTER TABLE orders ADD COLUMN delivery_fee text;
  END IF;
END $$;

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS quotes_user_id_idx ON quotes(user_id);
CREATE INDEX IF NOT EXISTS quotes_status_idx ON quotes(status);
CREATE INDEX IF NOT EXISTS quote_items_quote_id_idx ON quote_items(quote_id);
CREATE INDEX IF NOT EXISTS orders_quote_id_idx ON orders(quote_id);

-- =============================================
-- AUTO-UPDATE updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS quotes_updated_at ON quotes;
CREATE TRIGGER quotes_updated_at
  BEFORE UPDATE ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
