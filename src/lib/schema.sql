-- ============================================================
-- VERDICT — Property Marketplace Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Prerequisites
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ──────────────────────────────────────────────────────────
-- 1. USERS & ROLES
-- ──────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('user', 'broker', 'agency_admin', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  role        user_role DEFAULT 'user',
  full_name   TEXT,
  email       TEXT UNIQUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create a user row on Supabase Auth sign-up
CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_auth_user();


-- ──────────────────────────────────────────────────────────
-- 2. AGENCIES & BROKER PROFILES
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agencies (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  admin_id    UUID REFERENCES users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS broker_profiles (
  id                    UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  agency_id             UUID REFERENCES agencies(id),
  license_number        TEXT,
  performance_score     FLOAT DEFAULT 100.0,
  total_leads_unlocked  INTEGER DEFAULT 0,
  is_active             BOOLEAN DEFAULT TRUE
);


-- ──────────────────────────────────────────────────────────
-- 3. BUYER PROFILES (Qualification Engine output)
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS buyer_profiles (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID REFERENCES users(id),
  budget_min            BIGINT,
  budget_max            BIGINT,
  purpose               TEXT CHECK (purpose IN ('buy', 'rent', 'off-plan')),
  property_type         TEXT,   -- 'residential' | 'commercial'
  sub_type              TEXT,   -- 'apartment', 'villa', 'office', 'warehouse'
  financial_status      TEXT,   -- 'cash' | 'mortgage'
  qualification_score   INTEGER,
  tier                  TEXT,   -- 'Gold', 'Silver', 'Bronze'
  created_at            TIMESTAMPTZ DEFAULT NOW()
);


-- ──────────────────────────────────────────────────────────
-- 4. PROPERTY LISTINGS (named property_listings to avoid
--    conflict with the existing generic cards table)
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS property_listings (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title                 TEXT NOT NULL,
  listing_type          TEXT NOT NULL CHECK (listing_type IN ('buy', 'rent', 'off-plan')),
  category              TEXT NOT NULL CHECK (category IN ('residential', 'commercial')),
  sub_category          TEXT,   -- 'apartment', 'villa', 'office', 'retail', 'warehouse'
  price                 BIGINT NOT NULL,
  price_per_sqft        FLOAT,
  area_name             TEXT,
  developer_name        TEXT,   -- off-plan only
  roi_projection        FLOAT,
  payment_plan_details  JSONB,  -- off-plan only
  is_ready              BOOLEAN DEFAULT TRUE,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_property_listings_type_cat_price
  ON property_listings (listing_type, category, price);
CREATE INDEX IF NOT EXISTS idx_property_listings_area
  ON property_listings (area_name);


-- ──────────────────────────────────────────────────────────
-- 5. LEADS & MONETIZATION
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id        UUID REFERENCES buyer_profiles(id),
  listing_id      UUID REFERENCES property_listings(id),
  price_to_unlock BIGINT DEFAULT 15000,  -- 150 AED in fils (minor units)
  status          TEXT DEFAULT 'available' CHECK (status IN ('available', 'unlocked', 'expired')),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_status ON leads (status);
CREATE INDEX IF NOT EXISTS idx_leads_buyer  ON leads (buyer_id);

CREATE TABLE IF NOT EXISTS lead_assignments (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id       UUID REFERENCES leads(id),
  broker_id     UUID REFERENCES users(id),
  unlocked_at   TIMESTAMPTZ DEFAULT NOW(),
  sla_breached  BOOLEAN DEFAULT FALSE,
  contacted_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_lead_assignments_broker ON lead_assignments (broker_id);
CREATE INDEX IF NOT EXISTS idx_lead_assignments_lead   ON lead_assignments (lead_id);


-- ──────────────────────────────────────────────────────────
-- 6. WALLET SYSTEM
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wallets (
  user_id     UUID PRIMARY KEY REFERENCES users(id),
  balance     BIGINT DEFAULT 0,  -- in fils (1 AED = 100 fils)
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id         UUID REFERENCES wallets(user_id),
  amount            BIGINT NOT NULL,  -- negative for deductions
  description       TEXT,
  transaction_type  TEXT CHECK (transaction_type IN ('deposit', 'unlock')),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallet_txn_wallet ON wallet_transactions (wallet_id);


-- ──────────────────────────────────────────────────────────
-- 7. PORTFOLIO (MyAqar)
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portfolio_properties (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID REFERENCES users(id),
  purchase_price      BIGINT,
  current_valuation   BIGINT,
  annual_rent         BIGINT,
  capital_invested    BIGINT,
  acquisition_date    DATE,
  area_name           TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_user ON portfolio_properties (user_id);


-- ──────────────────────────────────────────────────────────
-- 8. ROW LEVEL SECURITY
-- ──────────────────────────────────────────────────────────
ALTER TABLE users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE broker_profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_listings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads               ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_assignments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets             ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_properties ENABLE ROW LEVEL SECURITY;

-- Users: see only own row; service role sees all
CREATE POLICY "users_own" ON users
  FOR ALL USING (auth.uid() = id);

-- Broker profiles: brokers see own; agency admins see their agency
CREATE POLICY "broker_own" ON broker_profiles
  FOR ALL USING (auth.uid() = id);

-- Buyer profiles: only the buyer (via user_id) and service role
CREATE POLICY "buyer_own" ON buyer_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Property listings: readable by all authenticated users
CREATE POLICY "listings_read_all" ON property_listings
  FOR SELECT USING (auth.role() = 'authenticated');

-- Leads: authenticated brokers see available leads
CREATE POLICY "leads_available" ON leads
  FOR SELECT USING (
    auth.role() = 'authenticated'
    AND status = 'available'
  );

-- After unlock: broker can see their own assigned lead
CREATE POLICY "leads_own_unlocked" ON leads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lead_assignments la
      WHERE la.lead_id = leads.id AND la.broker_id = auth.uid()
    )
  );

-- Lead assignments: brokers see their own
CREATE POLICY "assignments_own" ON lead_assignments
  FOR SELECT USING (auth.uid() = broker_id);

-- Wallets: own only
CREATE POLICY "wallet_own" ON wallets
  FOR ALL USING (auth.uid() = user_id);

-- Wallet transactions: own only
CREATE POLICY "wallet_txn_own" ON wallet_transactions
  FOR SELECT USING (auth.uid() = wallet_id);

-- Portfolio: own only
CREATE POLICY "portfolio_own" ON portfolio_properties
  FOR ALL USING (auth.uid() = user_id);


-- ──────────────────────────────────────────────────────────
-- 9. ATOMIC LEAD UNLOCK FUNCTION
--    Called by /api/leads/unlock via supabase.rpc()
-- ──────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION unlock_lead_v2(
  p_lead_id   UUID,
  p_broker_id UUID,
  p_amount    BIGINT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER  -- runs with DB owner permissions (bypasses RLS for atomicity)
AS $$
DECLARE
  v_balance     BIGINT;
  v_lead_status TEXT;
BEGIN
  -- Lock wallet row to prevent double-spend
  SELECT balance INTO v_balance
  FROM wallets
  WHERE user_id = p_broker_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Wallet not found for broker %', p_broker_id;
  END IF;

  IF v_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance: has %, needs %', v_balance, p_amount;
  END IF;

  -- Lock lead row to prevent race conditions (two brokers unlocking at once)
  SELECT status INTO v_lead_status
  FROM leads
  WHERE id = p_lead_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lead % not found', p_lead_id;
  END IF;

  IF v_lead_status != 'available' THEN
    RAISE EXCEPTION 'Lead is not available (status: %)', v_lead_status;
  END IF;

  -- Deduct wallet
  UPDATE wallets
  SET balance = balance - p_amount, updated_at = NOW()
  WHERE user_id = p_broker_id;

  -- Record transaction
  INSERT INTO wallet_transactions (wallet_id, amount, description, transaction_type)
  VALUES (p_broker_id, -p_amount, 'Lead unlock ' || p_lead_id::TEXT, 'unlock');

  -- Mark lead as unlocked
  UPDATE leads SET status = 'unlocked' WHERE id = p_lead_id;

  -- Create assignment record
  INSERT INTO lead_assignments (lead_id, broker_id)
  VALUES (p_lead_id, p_broker_id);

  -- Update broker performance stats
  UPDATE broker_profiles
  SET total_leads_unlocked = total_leads_unlocked + 1
  WHERE id = p_broker_id;

  RETURN jsonb_build_object('success', true, 'lead_id', p_lead_id);
END;
$$;


-- ──────────────────────────────────────────────────────────
-- 10. SLA BREACH CHECKER (run via Vercel Cron every 10 min)
--     Call: supabase.rpc('mark_sla_breaches')
-- ──────────────────────────────────────────────────────────
-- ──────────────────────────────────────────────────────────
-- 11. SLA TRACKING TABLE
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sla_tracking (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_assignment_id    UUID REFERENCES lead_assignments(id),
  broker_id             UUID REFERENCES users(id),
  lead_id               UUID REFERENCES leads(id),
  sla_deadline          TIMESTAMPTZ NOT NULL,
  breached_at           TIMESTAMPTZ,
  reassigned_to         UUID REFERENCES users(id),
  status                TEXT DEFAULT 'active' CHECK (status IN ('active', 'breached', 'reassigned', 'resolved')),
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE sla_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sla_tracking_own" ON sla_tracking
  FOR SELECT USING (auth.uid() = broker_id);

CREATE INDEX IF NOT EXISTS idx_sla_tracking_broker ON sla_tracking (broker_id);
CREATE INDEX IF NOT EXISTS idx_sla_tracking_lead   ON sla_tracking (lead_id);


-- ──────────────────────────────────────────────────────────
-- 10. CONTACT EVENTS (analytics tracking)
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id  UUID,
  cta_type    TEXT NOT NULL,
  session_id  TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────
-- 11. SLA BREACH CHECKER (updated — now logs + re-assigns)
-- ──────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION mark_sla_breaches()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- 1. Mark SLA breaches in lead_assignments
  UPDATE lead_assignments
  SET sla_breached = TRUE
  WHERE contacted_at IS NULL
    AND unlocked_at < NOW() - INTERVAL '1 hour'
    AND sla_breached = FALSE;

  GET DIAGNOSTICS v_count = ROW_COUNT;

  -- 2. Log newly breached assignments to sla_tracking
  INSERT INTO sla_tracking (lead_assignment_id, broker_id, lead_id, sla_deadline, breached_at, status)
  SELECT la.id, la.broker_id, la.lead_id,
         la.unlocked_at + INTERVAL '1 hour',
         NOW(), 'breached'
  FROM lead_assignments la
  WHERE la.sla_breached = TRUE
    AND la.contacted_at IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM sla_tracking st WHERE st.lead_assignment_id = la.id
    );

  -- 3. Re-assign: return lead to pool so another broker can unlock it
  UPDATE leads l
  SET status = 'available'
  FROM lead_assignments la
  WHERE la.lead_id = l.id
    AND la.sla_breached = TRUE
    AND la.contacted_at IS NULL
    AND l.status = 'unlocked';

  -- 4. Mark sla_tracking entries as reassigned
  UPDATE sla_tracking st
  SET status = 'reassigned'
  FROM lead_assignments la
  WHERE st.lead_assignment_id = la.id
    AND la.sla_breached = TRUE
    AND st.status = 'breached';

  RETURN v_count;
END;
$$;
