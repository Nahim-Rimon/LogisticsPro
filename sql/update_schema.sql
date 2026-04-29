-- Run this in your Supabase SQL Editor to add the inventory tracker
ALTER TABLE warehouses ADD COLUMN current_inventory INTEGER DEFAULT 0;

-- Run this to split contact_info into email and phone for Carriers
ALTER TABLE carriers DROP COLUMN IF EXISTS contact_info;
ALTER TABLE carriers ADD COLUMN email TEXT;
ALTER TABLE carriers ADD COLUMN phone TEXT;
