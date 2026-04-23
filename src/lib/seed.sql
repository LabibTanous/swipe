-- ============================================================
-- VERDICT — Seed Data
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- Requires: schema.sql already applied
-- ============================================================

-- ──────────────────────────────────────────────────────────
-- TEST USERS (insert into auth.users first, then public.users)
-- These are dev-only accounts — change passwords before any real use
-- ──────────────────────────────────────────────────────────
INSERT INTO auth.users (
  id, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, aud, role
) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@verdict.test',
   crypt('AdminTest123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000002', 'broker1@verdict.test',
   crypt('BrokerTest123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000003', 'broker2@verdict.test',
   crypt('BrokerTest123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000004', 'buyer1@verdict.test',
   crypt('BuyerTest123!', gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, role, full_name, email) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin',  'Verdict Admin',    'admin@verdict.test'),
  ('00000000-0000-0000-0000-000000000002', 'broker', 'Ahmed Al Rashid','broker1@verdict.test'),
  ('00000000-0000-0000-0000-000000000003', 'broker', 'Sara Khalil',    'broker2@verdict.test'),
  ('00000000-0000-0000-0000-000000000004', 'user',   'Test Buyer',     'buyer1@verdict.test')
ON CONFLICT (id) DO NOTHING;

-- Wallets: 500 AED = 50000 fils each broker
INSERT INTO wallets (user_id, balance) VALUES
  ('00000000-0000-0000-0000-000000000002', 50000),
  ('00000000-0000-0000-0000-000000000003', 50000)
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO broker_profiles (id, license_number, is_active) VALUES
  ('00000000-0000-0000-0000-000000000002', 'RERA-BRK-20241001', TRUE),
  ('00000000-0000-0000-0000-000000000003', 'RERA-BRK-20241002', TRUE)
ON CONFLICT (id) DO NOTHING;

-- One test buyer profile
INSERT INTO buyer_profiles (user_id, budget_min, budget_max, purpose, property_type, sub_type, financial_status, tier, qualification_score) VALUES
  ('00000000-0000-0000-0000-000000000004', 800000, 1500000, 'buy', 'residential', 'apartment', 'mortgage', 'Gold', 88)
ON CONFLICT DO NOTHING;


-- ──────────────────────────────────────────────────────────
-- PROPERTY LISTINGS — 55 UAE-accurate entries
-- price stored in AED (full unit, not fils)
-- ──────────────────────────────────────────────────────────

-- ── RENT / RESIDENTIAL ────────────────────────────────────
INSERT INTO property_listings (title, listing_type, category, sub_category, price, price_per_sqft, area_name, roi_projection, is_ready) VALUES
  ('Cozy Studio — JVC',                       'rent','residential','apartment',  45000,  125, 'JVC',            NULL, TRUE),
  ('Modern 1BR — JVC',                        'rent','residential','apartment',  65000,  145, 'JVC',            NULL, TRUE),
  ('Spacious 2BR — JVC',                      'rent','residential','apartment',  85000,  155, 'JVC',            NULL, TRUE),
  ('High-Floor Studio — Business Bay',        'rent','residential','apartment',  70000,  210, 'Business Bay',   NULL, TRUE),
  ('Executive 1BR — Business Bay',            'rent','residential','apartment',  95000,  240, 'Business Bay',   NULL, TRUE),
  ('Luxury 2BR Canal View — Business Bay',    'rent','residential','apartment', 135000,  280, 'Business Bay',   NULL, TRUE),
  ('Marina View 1BR — Dubai Marina',          'rent','residential','apartment',  90000,  250, 'Dubai Marina',   NULL, TRUE),
  ('Marina 2BR Full Sea View',                'rent','residential','apartment', 145000,  295, 'Dubai Marina',   NULL, TRUE),
  ('Marina 3BR Penthouse',                    'rent','residential','apartment', 200000,  340, 'Dubai Marina',   NULL, TRUE),
  ('Burj View 1BR — Downtown Dubai',          'rent','residential','apartment', 110000,  270, 'Downtown Dubai', NULL, TRUE),
  ('Fountain View 2BR — Downtown',            'rent','residential','apartment', 165000,  310, 'Downtown Dubai', NULL, TRUE),
  ('Affordable Studio — Arjan',               'rent','residential','apartment',  38000,  110, 'Arjan',          NULL, TRUE),
  ('Budget 1BR — Al Barsha',                  'rent','residential','apartment',  60000,  130, 'Al Barsha',      NULL, TRUE),
  ('Family 2BR — Dubai Hills',                'rent','residential','apartment', 120000,  265, 'Dubai Hills',    NULL, TRUE),
  ('Townhouse 3BR — Dubai Hills',             'rent','residential','villa',     180000,  220, 'Dubai Hills',    NULL, TRUE),
  ('Villa 4BR — Mirdif',                      'rent','residential','villa',     140000,  195, 'Mirdif',         NULL, TRUE),
  ('Villa 3BR — Arabian Ranches',             'rent','residential','villa',     160000,  210, 'Arabian Ranches',NULL, TRUE),
  ('Palm Signature 2BR',                      'rent','residential','apartment', 250000,  430, 'Palm Jumeirah',  NULL, TRUE),
  ('Affordable Studio — Dubai South',         'rent','residential','apartment',  35000,  100, 'Dubai South',    NULL, TRUE),
  ('1BR — Jumeirah Lake Towers',              'rent','residential','apartment',  75000,  180, 'JLT',            NULL, TRUE),

-- ── RENT / COMMERCIAL ─────────────────────────────────────
  ('Grade A Office 1,000 sqft — Business Bay','rent','commercial','office',    120000,  120, 'Business Bay',   NULL, TRUE),
  ('Premium Office 2,000 sqft — Business Bay','rent','commercial','office',    220000,  110, 'Business Bay',   NULL, TRUE),
  ('DIFC Class A Office 1,500 sqft',          'rent','commercial','office',    250000,  167, 'DIFC',           NULL, TRUE),
  ('JLT Office Fitted 800 sqft',              'rent','commercial','office',     85000,  106, 'JLT',            NULL, TRUE),
  ('Warehouse 5,000 sqft — Dubai South',      'rent','commercial','warehouse', 150000,   30, 'Dubai South',    NULL, TRUE),
  ('Warehouse 10,000 sqft — Al Quoz',         'rent','commercial','warehouse', 200000,   20, 'Al Quoz',        NULL, TRUE),

-- ── BUY / RESIDENTIAL ─────────────────────────────────────
  ('Studio for Sale — JVC',                   'buy','residential','apartment',  550000,  950, 'JVC',           0.07, TRUE),
  ('1BR for Sale — JVC',                      'buy','residential','apartment',  800000,  960, 'JVC',           0.07, TRUE),
  ('2BR for Sale — JVC',                      'buy','residential','apartment', 1100000,  970, 'JVC',           0.07, TRUE),
  ('Studio for Sale — Business Bay',          'buy','residential','apartment',  900000, 1750, 'Business Bay',  0.06, TRUE),
  ('1BR for Sale — Business Bay',             'buy','residential','apartment', 1300000, 1800, 'Business Bay',  0.06, TRUE),
  ('2BR Canal View — Business Bay',           'buy','residential','apartment', 1850000, 1900, 'Business Bay',  0.06, TRUE),
  ('1BR for Sale — Dubai Marina',             'buy','residential','apartment', 1100000, 1900, 'Dubai Marina',  0.06, TRUE),
  ('2BR Full Marina View',                    'buy','residential','apartment', 1800000, 2000, 'Dubai Marina',  0.06, TRUE),
  ('Palm Frond 2BR Apartment',                'buy','residential','apartment', 3500000, 3200, 'Palm Jumeirah', 0.05, TRUE),
  ('Palm 3BR + Maid Villa',                   'buy','residential','villa',     6200000, 3500, 'Palm Jumeirah', 0.05, TRUE),
  ('2BR — Dubai Hills Estate',                'buy','residential','apartment', 1900000, 1600, 'Dubai Hills',   0.06, TRUE),
  ('4BR Villa — Dubai Hills',                 'buy','residential','villa',     5500000, 1550, 'Dubai Hills',   0.05, TRUE),
  ('3BR Villa — Arabian Ranches',             'buy','residential','villa',     3200000, 1450, 'Arabian Ranches',0.05,TRUE),
  ('1BR — Downtown Dubai',                    'buy','residential','apartment', 1500000, 2100, 'Downtown Dubai',0.05, TRUE),
  ('2BR Burj View — Downtown',                'buy','residential','apartment', 2400000, 2200, 'Downtown Dubai',0.05, TRUE),

-- ── OFF-PLAN / RESIDENTIAL ────────────────────────────────
  ('JVC Studio Off-Plan — Ellington',         'off-plan','residential','apartment',  490000, 1050, 'JVC',          0.15,FALSE),
  ('JVC 1BR Off-Plan — Ellington',            'off-plan','residential','apartment',  720000, 1080, 'JVC',          0.15,FALSE),
  ('JVC 2BR Off-Plan — Ellington',            'off-plan','residential','apartment',  980000, 1100, 'JVC',          0.14,FALSE),
  ('Business Bay 1BR Off-Plan — Damac',       'off-plan','residential','apartment', 1050000, 2100, 'Business Bay', 0.12,FALSE),
  ('Business Bay 2BR Off-Plan — Damac',       'off-plan','residential','apartment', 1550000, 2200, 'Business Bay', 0.12,FALSE),
  ('Dubai South Studio Off-Plan — Emaar South','off-plan','residential','apartment', 390000,  820, 'Dubai South',  0.25,FALSE),
  ('Dubai South 1BR Off-Plan — Emaar South',  'off-plan','residential','apartment',  565000,  840, 'Dubai South',  0.25,FALSE),
  ('Dubai South 2BR Off-Plan — Emaar South',  'off-plan','residential','apartment',  770000,  860, 'Dubai South',  0.24,FALSE),
  ('Arjan Studio Off-Plan — Reportage',       'off-plan','residential','apartment',  440000,  960, 'Arjan',        0.18,FALSE),
  ('Arjan 1BR Off-Plan — Reportage',          'off-plan','residential','apartment',  640000,  980, 'Arjan',        0.18,FALSE),
  ('Dubai Hills 1BR Off-Plan — Emaar',        'off-plan','residential','apartment', 1180000, 1850, 'Dubai Hills',  0.14,FALSE),
  ('Dubai Hills 2BR Off-Plan — Emaar',        'off-plan','residential','apartment', 1680000, 1900, 'Dubai Hills',  0.14,FALSE),
  ('Creek Harbour 1BR Off-Plan — Emaar',      'off-plan','residential','apartment', 1380000, 1450, 'Creek Harbour',0.16,FALSE),
  ('Creek Harbour 2BR Off-Plan — Emaar',      'off-plan','residential','apartment', 2150000, 1500, 'Creek Harbour',0.15,FALSE),
  ('Emaar South Studio Off-Plan',             'off-plan','residential','apartment',  370000,  820, 'Emaar South',  0.22,FALSE)
ON CONFLICT DO NOTHING;


-- ──────────────────────────────────────────────────────────
-- SAMPLE LEADS (links buyer to listings)
-- ──────────────────────────────────────────────────────────
DO $$
DECLARE
  v_buyer_id UUID;
  v_listing_id UUID;
BEGIN
  SELECT id INTO v_buyer_id FROM buyer_profiles WHERE user_id = '00000000-0000-0000-0000-000000000004' LIMIT 1;
  SELECT id INTO v_listing_id FROM property_listings WHERE listing_type = 'buy' AND area_name = 'JVC' LIMIT 1;

  IF v_buyer_id IS NOT NULL AND v_listing_id IS NOT NULL THEN
    INSERT INTO leads (buyer_id, listing_id, status)
    VALUES (v_buyer_id, v_listing_id, 'available')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
