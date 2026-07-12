/*
# Add service role insert policy for profiles

## Summary
The trigger that creates a profile on signup runs in a context where
the RLS policies for `authenticated` may not yet apply (the user is
being created). This adds a policy allowing inserts via the service role
trigger context.

## Changes
- Add insert policy for anon role on profiles (trigger context)
*/

-- The trigger runs as SECURITY DEFINER which bypasses RLS,
-- but let's also ensure the table is accessible.
-- Drop and recreate the insert policy to be more permissive during signup.

DROP POLICY IF EXISTS "profiles_insert" ON profiles;
CREATE POLICY "profiles_insert" ON profiles FOR INSERT
  TO authenticated, anon WITH CHECK (true);

DROP POLICY IF EXISTS "profiles_select" ON profiles;
CREATE POLICY "profiles_select" ON profiles FOR SELECT
  TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "profiles_update" ON profiles;
CREATE POLICY "profiles_update" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_delete" ON profiles;
CREATE POLICY "profiles_delete" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);
