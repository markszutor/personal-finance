/*
  # Create electricity bills system with meter readings and forecasting

  1. New Tables
    - `electricity_bills`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `bill_date` (date, when the bill was issued)
      - `reading_date` (date, when the meter was read)
      - `day_reading` (numeric, day meter reading in kWh)
      - `night_reading` (numeric, night meter reading in kWh)
      - `previous_day_reading` (numeric, previous day reading for calculation)
      - `previous_night_reading` (numeric, previous night reading for calculation)
      - `day_usage` (numeric, calculated day usage)
      - `night_usage` (numeric, calculated night usage)
      - `total_usage` (numeric, total kWh used)
      - `amount_paid` (numeric, total amount paid for the bill)
      - `currency` (text, currency code)
      - `exchange_rate` (numeric, conversion rate to default currency)
      - `day_rate` (numeric, price per kWh for day usage)
      - `night_rate` (numeric, price per kWh for night usage)
      - `standing_charge` (numeric, fixed daily/monthly charge)
      - `notes` (text, optional notes)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `electricity_bills` table
    - Add policies for authenticated users to manage their own bills

  3. Triggers
    - Add trigger to automatically update `updated_at` timestamp
    - Add trigger to calculate usage when readings are updated

  4. Functions
    - Function to calculate usage from readings
    - Function to forecast next bill amount
*/

-- Create the electricity_bills table
CREATE TABLE IF NOT EXISTS public.electricity_bills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  bill_date date NOT NULL,
  reading_date date NOT NULL,
  day_reading numeric NOT NULL CHECK (day_reading >= 0),
  night_reading numeric NOT NULL CHECK (night_reading >= 0),
  previous_day_reading numeric CHECK (previous_day_reading >= 0),
  previous_night_reading numeric CHECK (previous_night_reading >= 0),
  day_usage numeric GENERATED ALWAYS AS (
    CASE 
      WHEN previous_day_reading IS NOT NULL 
      THEN day_reading - previous_day_reading 
      ELSE NULL 
    END
  ) STORED,
  night_usage numeric GENERATED ALWAYS AS (
    CASE 
      WHEN previous_night_reading IS NOT NULL 
      THEN night_reading - previous_night_reading 
      ELSE NULL 
    END
  ) STORED,
  total_usage numeric GENERATED ALWAYS AS (
    COALESCE(
      CASE 
        WHEN previous_day_reading IS NOT NULL AND previous_night_reading IS NOT NULL
        THEN (day_reading - previous_day_reading) + (night_reading - previous_night_reading)
        ELSE NULL 
      END, 0
    )
  ) STORED,
  amount_paid numeric NOT NULL CHECK (amount_paid >= 0),
  currency text NOT NULL DEFAULT 'USD',
  exchange_rate numeric DEFAULT 1.0,
  day_rate numeric CHECK (day_rate >= 0),
  night_rate numeric CHECK (night_rate >= 0),
  standing_charge numeric DEFAULT 0 CHECK (standing_charge >= 0),
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Add foreign key constraint to auth.users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'electricity_bills_user_id_fkey'
  ) THEN
    ALTER TABLE public.electricity_bills 
    ADD CONSTRAINT electricity_bills_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE public.electricity_bills ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own electricity bills"
  ON public.electricity_bills
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own electricity bills"
  ON public.electricity_bills
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own electricity bills"
  ON public.electricity_bills
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own electricity bills"
  ON public.electricity_bills
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add trigger to automatically update updated_at timestamp
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_electricity_bills_updated_at'
  ) THEN
    CREATE TRIGGER update_electricity_bills_updated_at
      BEFORE UPDATE ON public.electricity_bills
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Function to automatically set previous readings from the last bill
CREATE OR REPLACE FUNCTION set_previous_readings()
RETURNS TRIGGER AS $$
DECLARE
  last_bill RECORD;
BEGIN
  -- Get the most recent bill for this user (excluding the current one being inserted)
  SELECT day_reading, night_reading 
  INTO last_bill
  FROM public.electricity_bills 
  WHERE user_id = NEW.user_id 
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
  ORDER BY reading_date DESC, created_at DESC 
  LIMIT 1;

  -- Set previous readings if found and not already set
  IF last_bill IS NOT NULL THEN
    NEW.previous_day_reading := COALESCE(NEW.previous_day_reading, last_bill.day_reading);
    NEW.previous_night_reading := COALESCE(NEW.previous_night_reading, last_bill.night_reading);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set previous readings
CREATE TRIGGER set_previous_readings_trigger
  BEFORE INSERT OR UPDATE ON public.electricity_bills
  FOR EACH ROW
  EXECUTE FUNCTION set_previous_readings();

-- Function to forecast next bill amount using linear regression
CREATE OR REPLACE FUNCTION forecast_next_electricity_bill(p_user_id uuid)
RETURNS TABLE (
  forecasted_amount numeric,
  forecasted_usage numeric,
  confidence_level text,
  based_on_bills integer
) AS $$
DECLARE
  bill_count integer;
  avg_usage numeric;
  avg_amount numeric;
  usage_trend numeric;
  amount_trend numeric;
  last_usage numeric;
  last_amount numeric;
  seasonal_factor numeric := 1.0;
  current_month integer;
BEGIN
  -- Count available bills
  SELECT COUNT(*) INTO bill_count
  FROM public.electricity_bills 
  WHERE user_id = p_user_id 
    AND total_usage IS NOT NULL 
    AND total_usage > 0;

  -- Return null if insufficient data
  IF bill_count < 2 THEN
    RETURN QUERY SELECT NULL::numeric, NULL::numeric, 'Insufficient data'::text, bill_count;
    RETURN;
  END IF;

  -- Calculate basic averages
  SELECT 
    AVG(total_usage),
    AVG(amount_paid)
  INTO avg_usage, avg_amount
  FROM public.electricity_bills 
  WHERE user_id = p_user_id 
    AND total_usage IS NOT NULL 
    AND total_usage > 0;

  -- Get the most recent bill data
  SELECT total_usage, amount_paid
  INTO last_usage, last_amount
  FROM public.electricity_bills 
  WHERE user_id = p_user_id 
    AND total_usage IS NOT NULL 
    AND total_usage > 0
  ORDER BY reading_date DESC, created_at DESC
  LIMIT 1;

  -- Calculate trends if we have enough data (6+ bills for trend analysis)
  IF bill_count >= 6 THEN
    -- Simple linear trend calculation
    WITH numbered_bills AS (
      SELECT 
        total_usage,
        amount_paid,
        ROW_NUMBER() OVER (ORDER BY reading_date, created_at) as bill_number
      FROM public.electricity_bills 
      WHERE user_id = p_user_id 
        AND total_usage IS NOT NULL 
        AND total_usage > 0
      ORDER BY reading_date, created_at
    ),
    trend_calc AS (
      SELECT 
        -- Simple linear regression slope for usage
        (COUNT(*) * SUM(bill_number * total_usage) - SUM(bill_number) * SUM(total_usage)) / 
        (COUNT(*) * SUM(bill_number * bill_number) - SUM(bill_number) * SUM(bill_number)) as usage_slope,
        -- Simple linear regression slope for amount
        (COUNT(*) * SUM(bill_number * amount_paid) - SUM(bill_number) * SUM(amount_paid)) / 
        (COUNT(*) * SUM(bill_number * bill_number) - SUM(bill_number) * SUM(bill_number)) as amount_slope
      FROM numbered_bills
    )
    SELECT usage_slope, amount_slope 
    INTO usage_trend, amount_trend
    FROM trend_calc;
  ELSE
    usage_trend := 0;
    amount_trend := 0;
  END IF;

  -- Apply seasonal adjustment (simple model)
  current_month := EXTRACT(MONTH FROM CURRENT_DATE);
  CASE 
    WHEN current_month IN (12, 1, 2) THEN seasonal_factor := 1.2; -- Winter
    WHEN current_month IN (6, 7, 8) THEN seasonal_factor := 1.1;  -- Summer
    ELSE seasonal_factor := 1.0; -- Spring/Fall
  END CASE;

  -- Calculate forecast
  IF bill_count >= 6 THEN
    -- Use trend-based forecast for sufficient data
    forecasted_usage := GREATEST(0, (last_usage + usage_trend) * seasonal_factor);
    forecasted_amount := GREATEST(0, (last_amount + amount_trend) * seasonal_factor);
    confidence_level := 'High';
  ELSIF bill_count >= 3 THEN
    -- Use average with seasonal adjustment for moderate data
    forecasted_usage := avg_usage * seasonal_factor;
    forecasted_amount := avg_amount * seasonal_factor;
    confidence_level := 'Medium';
  ELSE
    -- Use simple average for limited data
    forecasted_usage := avg_usage;
    forecasted_amount := avg_amount;
    confidence_level := 'Low';
  END IF;

  RETURN QUERY SELECT 
    ROUND(forecasted_amount, 2),
    ROUND(forecasted_usage, 2),
    confidence_level,
    bill_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS electricity_bills_user_id_idx ON public.electricity_bills(user_id);
CREATE INDEX IF NOT EXISTS electricity_bills_reading_date_idx ON public.electricity_bills(reading_date DESC);
CREATE INDEX IF NOT EXISTS electricity_bills_user_date_idx ON public.electricity_bills(user_id, reading_date DESC);
CREATE INDEX IF NOT EXISTS electricity_bills_bill_date_idx ON public.electricity_bills(bill_date DESC);