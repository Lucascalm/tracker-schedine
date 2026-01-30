-- ==========================================
-- 🛡️ SECURITY PATCH: PROTEZIONE DATI UTENTE
-- ==========================================

-- 1. Abilita Row Level Security (RLS) sulla tabella bets
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;

-- 2. Crea policy per permettere agli utenti di vedere SOLO le proprie schedine
CREATE POLICY "Users can view their own bets" 
ON bets FOR SELECT 
USING (auth.uid() = user_id);

-- 3. Crea policy per permettere inserimento solo a proprio nome
CREATE POLICY "Users can insert their own bets" 
ON bets FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 4. Crea policy per modifica solo delle proprie schedine
CREATE POLICY "Users can update their own bets" 
ON bets FOR UPDATE 
USING (auth.uid() = user_id);

-- 5. Crea policy per cancellazione solo delle proprie schedine
CREATE POLICY "Users can delete their own bets" 
ON bets FOR DELETE 
USING (auth.uid() = user_id);

-- ==========================================
-- 🚀 PERFORMANCE PATCH: INDICI
-- ==========================================

-- Indice per velocizzare il filtro per utente (fondamentale con RLS)
CREATE INDEX IF NOT EXISTS idx_bets_user_id ON bets(user_id);

-- Indice per ordinare velocemente per data (usato nella dashboard)
CREATE INDEX IF NOT EXISTS idx_bets_created_at ON bets(created_at DESC);
