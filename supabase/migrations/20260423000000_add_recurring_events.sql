-- Migration to add recurring event fields to calendar_events
ALTER TABLE public.calendar_events 
  RENAME COLUMN date TO start_date;

ALTER TABLE public.calendar_events 
  ADD COLUMN end_date date,
  ADD COLUMN days_of_week text[] DEFAULT array[]::text[],
  ADD COLUMN is_recurring boolean DEFAULT false;

-- Update existing records to ensure they have an end_date if we wanted to make it NOT NULL later, 
-- but for single events it can be NULL.
