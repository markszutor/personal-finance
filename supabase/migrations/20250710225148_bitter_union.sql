/*
  # Add date format preference to user preferences

  1. Changes
    - Add `date_format` column to user_preferences table
    - Set default date format to 'MM/dd/yyyy'
    - Update existing records to have the default date format

  2. Supported Date Formats
    - MM/dd/yyyy (US format)
    - dd/MM/yyyy (European format)
    - yyyy-MM-dd (ISO format)
    - dd-MM-yyyy (Alternative European format)
*/

-- Add date_format column to user_preferences table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_preferences' AND column_name = 'date_format'
  ) THEN
    ALTER TABLE public.user_preferences 
    ADD COLUMN date_format text NOT NULL DEFAULT 'MM/dd/yyyy';
  END IF;
END $$;

-- Update existing records to have the default date format
UPDATE public.user_preferences 
SET date_format = 'MM/dd/yyyy' 
WHERE date_format IS NULL;

-- Add check constraint for valid date formats
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_preferences_date_format_check'
  ) THEN
    ALTER TABLE public.user_preferences 
    ADD CONSTRAINT user_preferences_date_format_check 
    CHECK (date_format IN ('MM/dd/yyyy', 'dd/MM/yyyy', 'yyyy-MM-dd', 'dd-MM-yyyy'));
  END IF;
END $$;