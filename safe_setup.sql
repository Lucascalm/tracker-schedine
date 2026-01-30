-- =========================================================
-- 🛡️ SAFE SETUP: Esegui questo script per sistemare tutto
-- Gestisce tabelle già esistenti senza dare errori
-- =========================================================

-- 1. CREAZIONE TABELLA BETS (Se non esiste)
CREATE TABLE IF NOT EXISTS public.bets (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone DEFAULT now(),
    user_id uuid DEFAULT auth.uid(),
    stake numeric,
    odds numeric,
    status text,
    category text,
    notes text,
    -- Aggiungi qui altre colonne se necessario
    CONSTRAINT bets_pkey PRIMARY KEY (id)
);

-- 2. CREAZIONE TABELLA WITHDRAWALS (Se non esiste)
CREATE TABLE IF NOT EXISTS public.withdrawals (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone DEFAULT now(),
    user_id uuid DEFAULT auth.uid(),
    amount numeric NOT NULL,
    notes text,
    CONSTRAINT withdrawals_pkey PRIMARY KEY (id)
);

-- 3. CREAZIONE TABELLA TIPSTERS (Se non esiste)
CREATE TABLE IF NOT EXISTS public.tipsters (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone DEFAULT now(),
    user_id uuid DEFAULT auth.uid(),
    name text NOT NULL,
    initial_bankroll numeric DEFAULT 0,
    CONSTRAINT tipsters_pkey PRIMARY KEY (id)
);

-- 4. AGGIUNTA COLONNE MANCANTI (Safe Mode)
DO $$
BEGIN
    -- Aggiungi user_id a bets se manca
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bets' AND column_name='user_id') THEN
        ALTER TABLE public.bets ADD COLUMN user_id uuid DEFAULT auth.uid();
    END IF;
    
    -- Aggiungi user_id a withdrawals se manca
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='withdrawals' AND column_name='user_id') THEN
        ALTER TABLE public.withdrawals ADD COLUMN user_id uuid DEFAULT auth.uid();
    END IF;
END $$;

-- 5. ABILITA SICUREZZA (RLS)
ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipsters ENABLE ROW LEVEL SECURITY;

-- 6. RESET E CREAZIONE POLICY (Cancella vecchie per evitare conflitti)

-- === BETS POLICIES ===
DROP POLICY IF EXISTS "Users can view their own bets" ON public.bets;
CREATE POLICY "Users can view their own bets" ON public.bets FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own bets" ON public.bets;
CREATE POLICY "Users can insert their own bets" ON public.bets FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own bets" ON public.bets;
CREATE POLICY "Users can update their own bets" ON public.bets FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own bets" ON public.bets;
CREATE POLICY "Users can delete their own bets" ON public.bets FOR DELETE USING (auth.uid() = user_id);

-- === WITHDRAWALS POLICIES ===
DROP POLICY IF EXISTS "Users can view own withdrawals" ON public.withdrawals;
CREATE POLICY "Users can view own withdrawals" ON public.withdrawals FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own withdrawals" ON public.withdrawals;
CREATE POLICY "Users can insert own withdrawals" ON public.withdrawals FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own withdrawals" ON public.withdrawals;
CREATE POLICY "Users can update own withdrawals" ON public.withdrawals FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own withdrawals" ON public.withdrawals;
CREATE POLICY "Users can delete own withdrawals" ON public.withdrawals FOR DELETE USING (auth.uid() = user_id);

-- === TIPSTERS POLICIES ===
DROP POLICY IF EXISTS "Users can view own tipsters" ON public.tipsters;
CREATE POLICY "Users can view own tipsters" ON public.tipsters FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own tipsters" ON public.tipsters;
CREATE POLICY "Users can insert own tipsters" ON public.tipsters FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own tipsters" ON public.tipsters;
CREATE POLICY "Users can update own tipsters" ON public.tipsters FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own tipsters" ON public.tipsters;
CREATE POLICY "Users can delete own tipsters" ON public.tipsters FOR DELETE USING (auth.uid() = user_id);

-- 7. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_bets_user_id ON public.bets(user_id);
CREATE INDEX IF NOT EXISTS idx_bets_created_at ON public.bets(created_at DESC);
