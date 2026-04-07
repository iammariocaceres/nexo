-- Create family_groups table (1-to-1 relationship with auth.users)
CREATE TABLE public.family_groups (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  admin_pin text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.family_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own family group" ON public.family_groups
  FOR ALL USING (auth.uid() = id);

-- Create members table
CREATE TABLE public.members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES public.family_groups(id) ON DELETE CASCADE,
  name text NOT NULL,
  display_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'member')),
  avatar_url text,
  color text,
  emoji text,
  points integer DEFAULT 0 NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own members" ON public.members
  FOR ALL USING (auth.uid() = family_id);

-- Create tasks table
CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES public.family_groups(id) ON DELETE CASCADE,
  assigned_to uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  title text NOT NULL,
  emoji text,
  points integer DEFAULT 0 NOT NULL,
  time_slot text NOT NULL CHECK (time_slot IN ('morning', 'afternoon', 'night')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own tasks" ON public.tasks
  FOR ALL USING (auth.uid() = family_id);

-- Create task_completions table (Historial del día)
CREATE TABLE public.task_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES public.family_groups(id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  completed_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  awarded_points integer NOT NULL
);

ALTER TABLE public.task_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own task completions" ON public.task_completions
  FOR ALL USING (auth.uid() = family_id);

-- Create rewards table
CREATE TABLE public.rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES public.family_groups(id) ON DELETE CASCADE,
  title text NOT NULL,
  emoji text,
  description text,
  cost integer DEFAULT 0 NOT NULL,
  category text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own rewards" ON public.rewards
  FOR ALL USING (auth.uid() = family_id);

-- Create reward_redemptions table (Historial de reclamos)
CREATE TABLE public.reward_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES public.family_groups(id) ON DELETE CASCADE,
  reward_id uuid NOT NULL REFERENCES public.rewards(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  redeemed_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  spent_points integer NOT NULL
);

ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own reward redemptions" ON public.reward_redemptions
  FOR ALL USING (auth.uid() = family_id);

-- Create calendar_events table
CREATE TABLE public.calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES public.family_groups(id) ON DELETE CASCADE,
  title text NOT NULL,
  date date NOT NULL,
  emoji text,
  color text,
  text_color text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own calendar events" ON public.calendar_events
  FOR ALL USING (auth.uid() = family_id);
