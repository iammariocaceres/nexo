-- Migration to add task date ranges and active status
ALTER TABLE public.tasks
  ADD COLUMN start_date date,
  ADD COLUMN end_date date,
  ADD COLUMN is_active boolean DEFAULT true;
