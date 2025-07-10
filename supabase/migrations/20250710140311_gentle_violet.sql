/*
  # Add investments table and enhance date filtering support

  1. New Tables
    - `investments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `symbol` (text, stock/crypto symbol)
      - `name` (text, investment name)
      - `type` (text, investment type: stock, bond, crypto, etc.)
      - `quantity` (numeric, number of shares/units)
      - `purchase_price` (numeric, price per unit when purchased)
      - `current_price` (numeric, current market price)
      - `currency` (text, currency code)
      - `exchange_rate` (numeric, conversion rate to default currency)
      - `purchase_date` (date, when investment was purchased)
      - `created_at` (timestamptz, record creation time)
      - `updated_at` (timestamptz, record update time)

  2. Enhanced Transactions
    - Add `transaction_date` column for historical data support
    - Add indexes for date-based queries

  3. Security
    - Enable RLS on `investments` table
    - Add policies for authenticated users to manage their own investments
    - Add policies for CRUD operations

  4. Performance
    - Add indexes for common query patterns
    - Add indexes for date-based filtering
*/

-- Add transaction_date column to transactions table for historical data support
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'transaction_date'
  ) THEN
    ALTER TABLE public.transactions ADD COLUMN transaction_date date DEFAULT CURRENT_DATE;
  END IF;
END $$;

-- Create index for transaction_date
CREATE INDEX IF NOT EXISTS transactions_transaction_date_idx ON public.transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS transactions_user_date_idx ON public.transactions(user_id, transaction_date DESC);

-- Create the investments table
CREATE TABLE IF NOT EXISTS public.investments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  symbol text NOT NULL,
  name text NOT NULL,
  type text CHECK (type IN ('stock', 'bond', 'crypto', 'etf', 'mutual_fund', 'real_estate', 'commodity', 'other')) NOT NULL,
  quantity numeric NOT NULL CHECK (quantity > 0),
  purchase_price numeric NOT NULL CHECK (purchase_price > 0),
  current_price numeric NOT NULL CHECK (current_price > 0),
  currency text NOT NULL DEFAULT 'USD',
  exchange_rate numeric DEFAULT 1.0,
  purchase_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Add foreign key constraint to auth.users for investments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'investments_user_id_fkey'
  ) THEN
    ALTER TABLE public.investments 
    ADD CONSTRAINT investments_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable Row Level Security for investments
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for investments
CREATE POLICY "Users can view their own investments"
  ON public.investments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own investments"
  ON public.investments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own investments"
  ON public.investments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own investments"
  ON public.investments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add trigger to automatically update updated_at timestamp for investments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_investments_updated_at'
  ) THEN
    CREATE TRIGGER update_investments_updated_at
      BEFORE UPDATE ON public.investments
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Add indexes for better query performance on investments
CREATE INDEX IF NOT EXISTS investments_user_id_idx ON public.investments(user_id);
CREATE INDEX IF NOT EXISTS investments_symbol_idx ON public.investments(symbol);
CREATE INDEX IF NOT EXISTS investments_type_idx ON public.investments(type);
CREATE INDEX IF NOT EXISTS investments_purchase_date_idx ON public.investments(purchase_date DESC);
CREATE INDEX IF NOT EXISTS investments_user_date_idx ON public.investments(user_id, purchase_date DESC);
CREATE INDEX IF NOT EXISTS investments_created_at_idx ON public.investments(created_at DESC);