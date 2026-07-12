/*
# Fix profile creation trigger

## Summary
The handle_new_user trigger was failing with a 500 error during signup.
This migration fixes it by:
1. Granting proper permissions to the authenticated/anon roles
2. Adding a SECURITY DEFINER policy bypass for the trigger
3. Ensuring the function has correct ownership and grants

## Changes
- Re-grant permissions on profiles table
- Recreate the trigger function with explicit grants
*/

-- Grant permissions on profiles table
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON profiles TO anon;
GRANT SELECT ON profiles TO authenticated;
GRANT SELECT ON profiles TO anon;

-- Recreate the function with SECURITY DEFINER and proper schema
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant execute on the function
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon;
