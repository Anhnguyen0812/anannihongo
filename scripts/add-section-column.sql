-- Add 'section' column to lessons table to store folder structure
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS section text;

-- Update RLS policies if needed (usually not needed for adding columns if policy is on table level)
