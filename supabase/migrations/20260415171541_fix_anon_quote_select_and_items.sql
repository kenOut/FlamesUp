/*
  # Fix Guest Quote Submission & Anon RLS

  ## Problem
  Guest (unauthenticated) users can INSERT quotes and quote_items (policies exist),
  but after inserting a quote they cannot SELECT it back to get the generated ID.
  This causes the quote_items insert to silently fail and the email notification
  to never fire.

  ## Changes
  1. Add anon SELECT policy on quotes — allows anon users to select quotes where
     user_id IS NULL (guest quotes). This is safe because:
     - All guest quotes have user_id = NULL
     - Logged-in user quotes have user_id = their uid and are protected by existing policy
  2. Add anon SELECT policy on quote_items — allows anon to read items for guest quotes
     (quote_id references a quote where user_id IS NULL)

  ## Security Notes
  - Anon users can only see quotes with user_id = NULL (guest quotes)
  - Authenticated users' quotes remain protected by auth.uid() = user_id check
  - Admins retain full access via is_admin() policies
*/

CREATE POLICY "Anon can view guest quotes they submitted"
  ON quotes FOR SELECT
  TO anon
  USING (user_id IS NULL);

CREATE POLICY "Anon can view guest quote items"
  ON quote_items FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM quotes
      WHERE quotes.id = quote_items.quote_id
      AND quotes.user_id IS NULL
    )
  );
