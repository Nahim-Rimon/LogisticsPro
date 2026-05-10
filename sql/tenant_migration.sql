-- LogisticsPro — Multi-Tenant Migration
-- Run this in the Supabase SQL Editor AFTER `supabase_schema.sql`.
-- Idempotent where possible: safe to re-run.

-- =============================================================
-- 2.1  Add org_id to existing business tables
-- =============================================================
ALTER TABLE shipments  ADD COLUMN IF NOT EXISTS org_id TEXT NOT NULL DEFAULT '';
ALTER TABLE warehouses ADD COLUMN IF NOT EXISTS org_id TEXT NOT NULL DEFAULT '';
ALTER TABLE carriers   ADD COLUMN IF NOT EXISTS org_id TEXT NOT NULL DEFAULT '';

-- shipment_events inherits its tenancy from the parent shipment via FK,
-- but we mirror org_id so direct queries can be RLS-filtered too.
ALTER TABLE shipment_events ADD COLUMN IF NOT EXISTS org_id TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_shipments_org_id        ON shipments(org_id);
CREATE INDEX IF NOT EXISTS idx_warehouses_org_id       ON warehouses(org_id);
CREATE INDEX IF NOT EXISTS idx_carriers_org_id         ON carriers(org_id);
CREATE INDEX IF NOT EXISTS idx_shipment_events_org_id  ON shipment_events(org_id);

-- After backfilling existing rows with real org IDs, drop the empty default:
-- ALTER TABLE shipments  ALTER COLUMN org_id DROP DEFAULT;
-- ALTER TABLE warehouses ALTER COLUMN org_id DROP DEFAULT;
-- ALTER TABLE carriers   ALTER COLUMN org_id DROP DEFAULT;
-- ALTER TABLE shipment_events ALTER COLUMN org_id DROP DEFAULT;

-- =============================================================
-- 2.2  profiles — Clerk user ↔ organisation mapping
-- =============================================================
CREATE TABLE IF NOT EXISTS profiles (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_user_id TEXT NOT NULL,
    org_id        TEXT NOT NULL,
    email         TEXT,
    role          TEXT NOT NULL DEFAULT 'org:member',
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (clerk_user_id, org_id)
);

CREATE INDEX IF NOT EXISTS idx_profiles_clerk_user_id ON profiles(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_org_id        ON profiles(org_id);

-- =============================================================
-- 2.3  Org-context helper
-- FastAPI calls this RPC before every query so RLS sees the
-- current org via current_setting('app.current_org_id').
-- The `true` flag scopes the setting to the current transaction.
-- =============================================================
CREATE OR REPLACE FUNCTION set_org_context(org TEXT)
RETURNS void AS $$
BEGIN
    PERFORM set_config('app.current_org_id', org, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================
-- 2.4  Enable RLS + tenant isolation policies
-- These policies act as a DEFENSE-IN-DEPTH backstop.
-- The service-role key used by FastAPI bypasses RLS, so the
-- application layer ALSO filters every query by org_id. If the
-- anon key were ever used by mistake, RLS still enforces isolation.
-- =============================================================
ALTER TABLE shipments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses      ENABLE ROW LEVEL SECURITY;
ALTER TABLE carriers        ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles        ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before recreating (so this script is idempotent)
DROP POLICY IF EXISTS tenant_shipments       ON shipments;
DROP POLICY IF EXISTS tenant_warehouses      ON warehouses;
DROP POLICY IF EXISTS tenant_carriers        ON carriers;
DROP POLICY IF EXISTS tenant_shipment_events ON shipment_events;
DROP POLICY IF EXISTS tenant_profiles        ON profiles;

CREATE POLICY tenant_shipments ON shipments
    FOR ALL
    USING (org_id = current_setting('app.current_org_id', true))
    WITH CHECK (org_id = current_setting('app.current_org_id', true));

CREATE POLICY tenant_warehouses ON warehouses
    FOR ALL
    USING (org_id = current_setting('app.current_org_id', true))
    WITH CHECK (org_id = current_setting('app.current_org_id', true));

CREATE POLICY tenant_carriers ON carriers
    FOR ALL
    USING (org_id = current_setting('app.current_org_id', true))
    WITH CHECK (org_id = current_setting('app.current_org_id', true));

CREATE POLICY tenant_shipment_events ON shipment_events
    FOR ALL
    USING (org_id = current_setting('app.current_org_id', true))
    WITH CHECK (org_id = current_setting('app.current_org_id', true));

CREATE POLICY tenant_profiles ON profiles
    FOR ALL
    USING (org_id = current_setting('app.current_org_id', true))
    WITH CHECK (org_id = current_setting('app.current_org_id', true));
