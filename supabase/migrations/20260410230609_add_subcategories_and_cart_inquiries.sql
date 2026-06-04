/*
  # Add Sub-categories and Cart Inquiry Support

  ## Overview
  This migration extends the catalogue structure to support the full 18-category hierarchy
  from the product catalogue, adds sub-categories, and adds a cart_inquiries table for
  quote requests.

  ## Changes

  ### New Tables
  - `sub_categories` - Stores sub-categories belonging to a parent category
    - `id` (uuid, primary key)
    - `category_id` (uuid, FK to categories)
    - `name` (text)
    - `sort_order` (int)
    - `created_at` (timestamptz)

  - `cart_inquiries` - Stores quote requests submitted via the e-shop cart
    - `id` (uuid, primary key)
    - `name` (text)
    - `email` (text)
    - `phone` (text, nullable)
    - `company` (text, nullable)
    - `message` (text, nullable)
    - `items` (jsonb) - array of {product_id, product_name, quantity}
    - `created_at` (timestamptz)

  ### Modified Tables
  - `categories` - Added `sort_order` column
  - `products` - Added `sub_category_id` FK to sub_categories

  ## Security
  - RLS enabled on all new tables
  - Public can read sub_categories and insert cart_inquiries
  - cart_inquiries: insert allowed for anonymous users
*/

-- Add sort_order to categories
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'categories' AND column_name = 'sort_order'
  ) THEN
    ALTER TABLE categories ADD COLUMN sort_order integer DEFAULT 0;
  END IF;
END $$;

-- Create sub_categories table
CREATE TABLE IF NOT EXISTS sub_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sub_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read sub_categories"
  ON sub_categories FOR SELECT
  TO anon, authenticated
  USING (true);

-- Add sub_category_id to products
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'sub_category_id'
  ) THEN
    ALTER TABLE products ADD COLUMN sub_category_id uuid REFERENCES sub_categories(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create cart_inquiries table
CREATE TABLE IF NOT EXISTS cart_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  company text,
  message text,
  items jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cart_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit cart inquiries"
  ON cart_inquiries FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
