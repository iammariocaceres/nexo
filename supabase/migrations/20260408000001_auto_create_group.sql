-- Create a function to handle new auth user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a default family group using the new user's ID
  -- We provide a placeholder name which the user can change later in settings
  INSERT INTO public.family_groups (id, name, admin_pin)
  VALUES (NEW.id, 'My Family', '0000');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
