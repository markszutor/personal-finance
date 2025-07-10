/*
  # Fix user signup trigger function

  1. Database Functions
    - Drop and recreate the `create_user_preferences` function with proper error handling
    - Ensure the function correctly creates user preferences on signup

  2. Triggers
    - Ensure the trigger is properly set up to call the function on user creation

  3. Security
    - Function runs with proper security context
    - Handles edge cases and potential errors gracefully
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS create_user_preferences() CASCADE;

-- Create the function to automatically create user preferences
CREATE OR REPLACE FUNCTION create_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert user preferences with default values
  INSERT INTO public.user_preferences (user_id, default_currency)
  VALUES (NEW.id, 'USD')
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE LOG 'Error creating user preferences for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users table (if it doesn't exist)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_preferences();

-- Ensure the function has proper permissions
GRANT EXECUTE ON FUNCTION create_user_preferences() TO service_role;