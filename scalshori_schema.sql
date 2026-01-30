-- Scalshori System Database Updates
-- Run this in Supabase SQL Editor

-- 1. Add new fields to tipsters table
ALTER TABLE tipsters ADD COLUMN IF NOT EXISTS playing_base DECIMAL DEFAULT NULL;
ALTER TABLE tipsters ADD COLUMN IF NOT EXISTS use_scalshori_method BOOLEAN DEFAULT FALSE;
ALTER TABLE tipsters ADD COLUMN IF NOT EXISTS last_scalshori_update TIMESTAMP DEFAULT NULL;

-- 2. Add is_scalshori flag to withdrawals table
ALTER TABLE withdrawals ADD COLUMN IF NOT EXISTS is_scalshori BOOLEAN DEFAULT FALSE;

-- 3. Create scalshori_operations table for undo capability
CREATE TABLE IF NOT EXISTS scalshori_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipster_id UUID REFERENCES tipsters(id) ON DELETE CASCADE,
    user_id UUID,
    margin_before DECIMAL NOT NULL,
    withdrawal_amount DECIMAL NOT NULL,
    base_increase DECIMAL NOT NULL,
    bankroll_before DECIMAL NOT NULL,
    base_gioco_before DECIMAL NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    cancelled BOOLEAN DEFAULT FALSE
);

-- 4. Enable RLS on scalshori_operations
ALTER TABLE scalshori_operations ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies
CREATE POLICY "Users can view their own scalshori operations"
    ON scalshori_operations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scalshori operations"
    ON scalshori_operations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scalshori operations"
    ON scalshori_operations FOR UPDATE
    USING (auth.uid() = user_id);
