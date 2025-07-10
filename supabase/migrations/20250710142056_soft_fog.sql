/*
  # Add investment categories and update constraints

  1. Changes
    - Update investment type constraint to support new categories
    - Add indexes for better performance
    
  2. New Investment Categories
    - stocks: Traditional stock investments
    - crypto: Cryptocurrency holdings  
    - p2p_lending: Peer-to-peer lending investments
    - other: Other investment types (bonds, ETFs, etc.)
*/

-- Update the investment type constraint to include new categories
ALTER TABLE investments DROP CONSTRAINT IF EXISTS investments_type_check;

ALTER TABLE investments ADD CONSTRAINT investments_type_check 
CHECK ((type = ANY (ARRAY['stocks'::text, 'crypto'::text, 'p2p_lending'::text, 'other'::text])));

-- Add index for investment type filtering
CREATE INDEX IF NOT EXISTS investments_type_user_idx ON investments USING btree (user_id, type);