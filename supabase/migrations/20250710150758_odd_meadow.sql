/*
  # Add recurring support for transactions and investments

  1. New Tables
    - `recurring_transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `title` (text, required)
      - `description` (text, optional)
      - `amount` (numeric, required)
      - `category` (text, required)
      - `type` (text, income or expense)
      - `currency` (text, default USD)
      - `exchange_rate` (numeric, optional)
      - `frequency` (text, daily/weekly/monthly/yearly)
      - `start_date` (date, when to start)
      - `end_date` (date, when to end, optional)
      - `next_occurrence` (date, next scheduled date)
      - `is_active` (boolean, whether recurring is active)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `recurring_investments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `symbol` (text, stock/crypto symbol)
      - `name` (text, investment name)
      - `type` (text, investment type)
      - `amount` (numeric, amount to invest each time)
      - `currency` (text, currency code)
      - `exchange_rate` (numeric, conversion rate)
      - `frequency` (text, daily/weekly/monthly/yearly)
      - `start_date` (date, when to start)
      - `end_date` (date, when to end, optional)
      - `next_occurrence` (date, next scheduled date)
      - `is_active` (boolean, whether recurring is active)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own recurring items

  3. Triggers
    - Add triggers to automatically update `updated_at` timestamps
*/

-- Create the recurring_transactions table
CREATE TABLE IF NOT EXISTS public.recurring_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  amount numeric NOT NULL,
  category text NOT NULL,
  type text CHECK (type IN ('income', 'expense')) NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  exchange_rate numeric,
  frequency text CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')) NOT NULL,
  start_date date NOT NULL,
  end_date date,
  next_occurrence date NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Add foreign key constraint to auth.users for recurring_transactions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'recurring_transactions_user_id_fkey'
  ) THEN
    ALTER TABLE public.recurring_transactions 
    ADD CONSTRAINT recurring_transactions_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable Row Level Security for recurring_transactions
ALTER TABLE public.recurring_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for recurring_transactions
CREATE POLICY "Users can view their own recurring transactions"
  ON public.recurring_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recurring transactions"
  ON public.recurring_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recurring transactions"
  ON public.recurring_transactions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recurring transactions"
  ON public.recurring_transactions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add trigger to automatically update updated_at timestamp for recurring_transactions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_recurring_transactions_updated_at'
  ) THEN
    CREATE TRIGGER update_recurring_transactions_updated_at
      BEFORE UPDATE ON public.recurring_transactions
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Create the recurring_investments table
CREATE TABLE IF NOT EXISTS public.recurring_investments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  symbol text NOT NULL,
  name text NOT NULL,
  type text CHECK (type IN ('stocks', 'crypto', 'p2p_lending', 'other')) NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  currency text NOT NULL DEFAULT 'USD',
  exchange_rate numeric DEFAULT 1.0,
  frequency text CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')) NOT NULL,
  start_date date NOT NULL,
  end_date date,
  next_occurrence date NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Add foreign key constraint to auth.users for recurring_investments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'recurring_investments_user_id_fkey'
  ) THEN
    ALTER TABLE public.recurring_investments 
    ADD CONSTRAINT recurring_investments_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable Row Level Security for recurring_investments
ALTER TABLE public.recurring_investments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for recurring_investments
CREATE POLICY "Users can view their own recurring investments"
  ON public.recurring_investments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recurring investments"
  ON public.recurring_investments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recurring investments"
  ON public.recurring_investments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recurring investments"
  ON public.recurring_investments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add trigger to automatically update updated_at timestamp for recurring_investments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_recurring_investments_updated_at'
  ) THEN
    CREATE TRIGGER update_recurring_investments_updated_at
      BEFORE UPDATE ON public.recurring_investments
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS recurring_transactions_user_id_idx ON public.recurring_transactions(user_id);
CREATE INDEX IF NOT EXISTS recurring_transactions_next_occurrence_idx ON public.recurring_transactions(next_occurrence);
CREATE INDEX IF NOT EXISTS recurring_transactions_is_active_idx ON public.recurring_transactions(is_active);

CREATE INDEX IF NOT EXISTS recurring_investments_user_id_idx ON public.recurring_investments(user_id);
CREATE INDEX IF NOT EXISTS recurring_investments_next_occurrence_idx ON public.recurring_investments(next_occurrence);
CREATE INDEX IF NOT EXISTS recurring_investments_is_active_idx ON public.recurring_investments(is_active);