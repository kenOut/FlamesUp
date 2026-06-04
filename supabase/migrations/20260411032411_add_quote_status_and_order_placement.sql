/*
  # Add Quote Status and Order Placement Support

  ## Overview
  This migration enhances the cart_inquiries table to support a quote workflow:
  - Quotes can have statuses: submitted, agreed, rejected
  - Once agreed, the client can place an order directly from the dashboard
  - Adds order_id FK so a quote can be linked to the resulting order

  ## Changes

  ### Modified Tables
  - `cart_inquiries`
    - `quote_status` (text) - workflow state: submitted | agreed | rejected
    - `order_id` (uuid, nullable FK to orders) - links a placed order back to its quote

  ## Security
  - Existing RLS policies continue to apply
  - Users can read their own inquiries (already set)
  - Authenticated users can insert their own orders (already set)
*/

-- Add quote_status to cart_inquiries
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cart_inquiries' AND column_name = 'quote_status'
  ) THEN
    ALTER TABLE cart_inquiries ADD COLUMN quote_status text NOT NULL DEFAULT 'submitted';
  END IF;
END $$;

-- Add order_id FK to cart_inquiries (links quote -> order once placed)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cart_inquiries' AND column_name = 'order_id'
  ) THEN
    ALTER TABLE cart_inquiries ADD COLUMN order_id uuid REFERENCES orders(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Allow users to update their own cart_inquiries (needed to attach order_id after placing order)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'cart_inquiries' AND policyname = 'Users can update own inquiries'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can update own inquiries"
      ON cart_inquiries FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id)';
  END IF;
END $$;
