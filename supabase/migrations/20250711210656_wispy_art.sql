/*
  # Add property addresses for electricity bills

  1. New Tables
    - `property_addresses`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `address_line_1` (text, required)
      - `address_line_2` (text, optional)
      - `city` (text, required)
      - `state_province` (text, optional)
      - `postal_code` (text, optional)
      - `country` (text, required)
      - `nickname` (text, optional friendly name)
      - `is_current` (boolean, whether this is the current address)
      - `move_in_date` (date, when user moved to this address)
      - `move_out_date` (date, when user moved out, optional)
      - `has_day_night_meter` (boolean, whether property has separate day/night meters)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Changes to electricity_bills
    - Add `property_address_id` foreign key to link bills to addresses
    - Update existing bills to use a default address if needed

  3. Security
    - Enable RLS on `property_addresses` table
    - Add policies for authenticated users to manage their own addresses

  4. Functions
    - Function to get current address for a user
    - Enhanced forecasting that considers address changes
*/

-- Create the property_addresses table
CREATE TABLE IF NOT EXISTS public.property_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  address_line_1 text NOT NULL,
  address_line_2 text,
  city text NOT NULL,
  state_province text,
  postal_code text,
  country text NOT NULL DEFAULT 'United States',
  nickname text,
  is_current boolean NOT NULL DEFAULT false,
  move_in_date date NOT NULL DEFAULT CURRENT_DATE,
  move_out_date date,
  has_day_night_meter boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Add foreign key constraint to auth.users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'property_addresses_user_id_fkey'
  ) THEN
    ALTER TABLE public.property_addresses 
    ADD CONSTRAINT property_addresses_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add property_address_id to electricity_bills table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'electricity_bills' AND column_name = 'property_address_id'
  ) THEN
    ALTER TABLE public.electricity_bills ADD COLUMN property_address_id uuid;
  END IF;
END $$;

-- Add foreign key constraint from electricity_bills to property_addresses
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'electricity_bills_property_address_id_fkey'
  ) THEN
    ALTER TABLE public.electricity_bills 
    ADD CONSTRAINT electricity_bills_property_address_id_fkey 
    FOREIGN KEY (property_address_id) REFERENCES public.property_addresses(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Enable Row Level Security for property_addresses
ALTER TABLE public.property_addresses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for property_addresses
CREATE POLICY "Users can view their own property addresses"
  ON public.property_addresses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own property addresses"
  ON public.property_addresses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own property addresses"
  ON public.property_addresses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own property addresses"
  ON public.property_addresses
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add trigger to automatically update updated_at timestamp
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_property_addresses_updated_at'
  ) THEN
    CREATE TRIGGER update_property_addresses_updated_at
      BEFORE UPDATE ON public.property_addresses
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Function to get current address for a user
CREATE OR REPLACE FUNCTION get_current_address(p_user_id uuid)
RETURNS TABLE (
  id uuid,
  address_line_1 text,
  address_line_2 text,
  city text,
  state_province text,
  postal_code text,
  country text,
  nickname text,
  has_day_night_meter boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pa.id,
    pa.address_line_1,
    pa.address_line_2,
    pa.city,
    pa.state_province,
    pa.postal_code,
    pa.country,
    pa.nickname,
    pa.has_day_night_meter
  FROM public.property_addresses pa
  WHERE pa.user_id = p_user_id 
    AND pa.is_current = true
  ORDER BY pa.move_in_date DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced forecasting function that considers address changes
CREATE OR REPLACE FUNCTION forecast_next_electricity_bill_enhanced(p_user_id uuid, p_property_address_id uuid DEFAULT NULL)
RETURNS TABLE (
  forecasted_amount numeric,
  forecasted_usage numeric,
  confidence_level text,
  based_on_bills integer,
  address_specific boolean
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
  target_address_id uuid;
BEGIN
  -- Determine which address to use for forecasting
  IF p_property_address_id IS NULL THEN
    -- Get current address
    SELECT pa.id INTO target_address_id
    FROM public.property_addresses pa
    WHERE pa.user_id = p_user_id AND pa.is_current = true
    ORDER BY pa.move_in_date DESC
    LIMIT 1;
  ELSE
    target_address_id := p_property_address_id;
  END IF;

  -- Count available bills for the specific address
  SELECT COUNT(*) INTO bill_count
  FROM public.electricity_bills eb
  WHERE eb.user_id = p_user_id 
    AND (target_address_id IS NULL OR eb.property_address_id = target_address_id)
    AND eb.total_usage IS NOT NULL 
    AND eb.total_usage > 0;

  -- Return null if insufficient data
  IF bill_count < 2 THEN
    RETURN QUERY SELECT NULL::numeric, NULL::numeric, 'Insufficient data'::text, bill_count, (target_address_id IS NOT NULL);
    RETURN;
  END IF;

  -- Calculate basic averages for the specific address
  SELECT 
    AVG(eb.total_usage),
    AVG(eb.amount_paid)
  INTO avg_usage, avg_amount
  FROM public.electricity_bills eb
  WHERE eb.user_id = p_user_id 
    AND (target_address_id IS NULL OR eb.property_address_id = target_address_id)
    AND eb.total_usage IS NOT NULL 
    AND eb.total_usage > 0;

  -- Get the most recent bill data for the specific address
  SELECT eb.total_usage, eb.amount_paid
  INTO last_usage, last_amount
  FROM public.electricity_bills eb
  WHERE eb.user_id = p_user_id 
    AND (target_address_id IS NULL OR eb.property_address_id = target_address_id)
    AND eb.total_usage IS NOT NULL 
    AND eb.total_usage > 0
  ORDER BY eb.reading_date DESC, eb.created_at DESC
  LIMIT 1;

  -- Calculate trends if we have enough data (4+ bills for address-specific, 6+ for general)
  IF (target_address_id IS NOT NULL AND bill_count >= 4) OR (target_address_id IS NULL AND bill_count >= 6) THEN
    -- Simple linear trend calculation for the specific address
    WITH numbered_bills AS (
      SELECT 
        eb.total_usage,
        eb.amount_paid,
        ROW_NUMBER() OVER (ORDER BY eb.reading_date, eb.created_at) as bill_number
      FROM public.electricity_bills eb
      WHERE eb.user_id = p_user_id 
        AND (target_address_id IS NULL OR eb.property_address_id = target_address_id)
        AND eb.total_usage IS NOT NULL 
        AND eb.total_usage > 0
      ORDER BY eb.reading_date, eb.created_at
    ),
    trend_calc AS (
      SELECT 
        (COUNT(*) * SUM(bill_number * total_usage) - SUM(bill_number) * SUM(total_usage)) / 
        (COUNT(*) * SUM(bill_number * bill_number) - SUM(bill_number) * SUM(bill_number)) as usage_slope,
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

  -- Apply seasonal adjustment
  current_month := EXTRACT(MONTH FROM CURRENT_DATE);
  CASE 
    WHEN current_month IN (12, 1, 2) THEN seasonal_factor := 1.2; -- Winter
    WHEN current_month IN (6, 7, 8) THEN seasonal_factor := 1.1;  -- Summer
    ELSE seasonal_factor := 1.0; -- Spring/Fall
  END CASE;

  -- Calculate forecast based on available data
  IF (target_address_id IS NOT NULL AND bill_count >= 4) OR (target_address_id IS NULL AND bill_count >= 6) THEN
    -- Use trend-based forecast
    forecasted_usage := GREATEST(0, (last_usage + usage_trend) * seasonal_factor);
    forecasted_amount := GREATEST(0, (last_amount + amount_trend) * seasonal_factor);
    confidence_level := CASE 
      WHEN target_address_id IS NOT NULL THEN 'High (Address-specific)'
      ELSE 'High'
    END;
  ELSIF bill_count >= 3 THEN
    -- Use average with seasonal adjustment
    forecasted_usage := avg_usage * seasonal_factor;
    forecasted_amount := avg_amount * seasonal_factor;
    confidence_level := CASE 
      WHEN target_address_id IS NOT NULL THEN 'Medium (Address-specific)'
      ELSE 'Medium'
    END;
  ELSE
    -- Use simple average
    forecasted_usage := avg_usage;
    forecasted_amount := avg_amount;
    confidence_level := CASE 
      WHEN target_address_id IS NOT NULL THEN 'Low (Address-specific)'
      ELSE 'Low'
    END;
  END IF;

  RETURN QUERY SELECT 
    ROUND(forecasted_amount, 2),
    ROUND(forecasted_usage, 2),
    confidence_level,
    bill_count,
    (target_address_id IS NOT NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get electricity consumption history for charts
CREATE OR REPLACE FUNCTION get_electricity_consumption_history(p_user_id uuid, p_months integer DEFAULT 12)
RETURNS TABLE (
  bill_date date,
  reading_date date,
  total_usage numeric,
  day_usage numeric,
  night_usage numeric,
  amount_paid numeric,
  currency text,
  property_nickname text,
  forecasted_amount numeric,
  forecast_accuracy numeric
) AS $$
BEGIN
  RETURN QUERY
  WITH bill_history AS (
    SELECT 
      eb.bill_date,
      eb.reading_date,
      eb.total_usage,
      eb.day_usage,
      eb.night_usage,
      eb.amount_paid,
      eb.currency,
      COALESCE(pa.nickname, CONCAT(pa.address_line_1, ', ', pa.city)) as property_nickname,
      eb.property_address_id,
      ROW_NUMBER() OVER (ORDER BY eb.reading_date) as bill_sequence
    FROM public.electricity_bills eb
    LEFT JOIN public.property_addresses pa ON eb.property_address_id = pa.id
    WHERE eb.user_id = p_user_id 
      AND eb.reading_date >= CURRENT_DATE - INTERVAL '1 month' * p_months
      AND eb.total_usage IS NOT NULL
    ORDER BY eb.reading_date
  ),
  forecasts AS (
    SELECT 
      bh.bill_date,
      bh.reading_date,
      bh.total_usage,
      bh.day_usage,
      bh.night_usage,
      bh.amount_paid,
      bh.currency,
      bh.property_nickname,
      -- Calculate what the forecast would have been for this bill
      -- using data from previous bills only
      CASE 
        WHEN bh.bill_sequence > 2 THEN
          (SELECT AVG(prev.amount_paid) 
           FROM bill_history prev 
           WHERE prev.bill_sequence < bh.bill_sequence 
             AND prev.property_address_id = bh.property_address_id)
        ELSE NULL
      END as forecasted_amount_calc
    FROM bill_history bh
  )
  SELECT 
    f.bill_date,
    f.reading_date,
    f.total_usage,
    f.day_usage,
    f.night_usage,
    f.amount_paid,
    f.currency,
    f.property_nickname,
    f.forecasted_amount_calc,
    -- Calculate forecast accuracy as percentage
    CASE 
      WHEN f.forecasted_amount_calc IS NOT NULL AND f.forecasted_amount_calc > 0 THEN
        ROUND(100 - ABS((f.amount_paid - f.forecasted_amount_calc) / f.forecasted_amount_calc * 100), 2)
      ELSE NULL
    END as forecast_accuracy_calc
  FROM forecasts f
  ORDER BY f.reading_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS property_addresses_user_id_idx ON public.property_addresses(user_id);
CREATE INDEX IF NOT EXISTS property_addresses_current_idx ON public.property_addresses(user_id, is_current);
CREATE INDEX IF NOT EXISTS electricity_bills_property_address_idx ON public.electricity_bills(property_address_id);
CREATE INDEX IF NOT EXISTS electricity_bills_user_property_date_idx ON public.electricity_bills(user_id, property_address_id, reading_date DESC);