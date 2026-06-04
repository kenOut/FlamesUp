/*
  # Admin Role, Product Availability, and Quote Pricing

  ## Overview
  This migration sets up the admin infrastructure:
  - Adds `is_admin` boolean flag to user_profiles
  - Adds `availability` status to products (available / sold_out)
  - Adds `quoted_price` and `admin_notes` to cart_inquiries so admin can send price back
  - Adds RLS policies allowing admins full read/write access to all business tables

  ## New Columns

  ### user_profiles
  - `is_admin` (boolean, default false) - marks admin accounts

  ### products
  - `availability` (text, default 'available') - 'available' or 'sold_out'

  ### cart_inquiries
  - `quoted_price` (text, nullable) - price admin sends back to client
  - `admin_notes` (text, nullable) - internal notes from admin

  ### orders
  - `admin_notes` (text, nullable) - notes admin can add to orders

  ## Security
  - Admin policies use a helper function to check is_admin flag
  - All admin policies are separate from user policies
*/

-- Add is_admin to user_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN is_admin boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- Add availability to products
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'availability'
  ) THEN
    ALTER TABLE products ADD COLUMN availability text NOT NULL DEFAULT 'available';
  END IF;
END $$;

-- Add quoted_price and admin_notes to cart_inquiries
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cart_inquiries' AND column_name = 'quoted_price'
  ) THEN
    ALTER TABLE cart_inquiries ADD COLUMN quoted_price text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cart_inquiries' AND column_name = 'admin_notes'
  ) THEN
    ALTER TABLE cart_inquiries ADD COLUMN admin_notes text;
  END IF;
END $$;

-- Add admin_notes to orders
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'admin_notes'
  ) THEN
    ALTER TABLE orders ADD COLUMN admin_notes text;
  END IF;
END $$;

-- Helper function: check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM user_profiles WHERE id = auth.uid()),
    false
  );
$$;

-- Admin policy: read all cart_inquiries
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'cart_inquiries' AND policyname = 'Admins can read all inquiries'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can read all inquiries"
      ON cart_inquiries FOR SELECT
      TO authenticated
      USING (public.is_admin())';
  END IF;
END $$;

-- Admin policy: update cart_inquiries (to set quote_status, quoted_price, admin_notes)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'cart_inquiries' AND policyname = 'Admins can update all inquiries'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can update all inquiries"
      ON cart_inquiries FOR UPDATE
      TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin())';
  END IF;
END $$;

-- Admin policy: delete cart_inquiries
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'cart_inquiries' AND policyname = 'Admins can delete all inquiries'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can delete all inquiries"
      ON cart_inquiries FOR DELETE
      TO authenticated
      USING (public.is_admin())';
  END IF;
END $$;

-- Admin policy: read all orders
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'orders' AND policyname = 'Admins can read all orders'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can read all orders"
      ON orders FOR SELECT
      TO authenticated
      USING (public.is_admin())';
  END IF;
END $$;

-- Admin policy: update orders (to change status)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'orders' AND policyname = 'Admins can update all orders'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can update all orders"
      ON orders FOR UPDATE
      TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin())';
  END IF;
END $$;

-- Admin policy: read all user_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'user_profiles' AND policyname = 'Admins can read all profiles'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can read all profiles"
      ON user_profiles FOR SELECT
      TO authenticated
      USING (public.is_admin())';
  END IF;
END $$;

-- Admin policies for products (update availability, edit, delete)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'products' AND policyname = 'Admins can update products'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can update products"
      ON products FOR UPDATE
      TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin())';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'products' AND policyname = 'Admins can delete products'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can delete products"
      ON products FOR DELETE
      TO authenticated
      USING (public.is_admin())';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'products' AND policyname = 'Admins can insert products'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can insert products"
      ON products FOR INSERT
      TO authenticated
      WITH CHECK (public.is_admin())';
  END IF;
END $$;
