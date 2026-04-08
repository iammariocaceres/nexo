ALTER TABLE public.tasks ADD COLUMN days_of_week text[] DEFAULT array['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
