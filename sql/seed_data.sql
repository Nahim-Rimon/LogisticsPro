-- Seed data for Supply Chain Logistics

-- 1. Insert Warehouses
INSERT INTO warehouses (name, location, capacity, manager_id) VALUES
('West Coast Hub', 'Los Angeles, CA', 1000, 'user_2k...'),
('East Coast Center', 'Newark, NJ', 800, 'user_2k...'),
('Midwest Distribution', 'Chicago, IL', 1200, 'user_2k...'),
('Southern Gateway', 'Houston, TX', 900, 'user_2k...');

-- 2. Insert Carriers
INSERT INTO carriers (name, email, phone) VALUES
('FastTrack Logistics', 'support@fasttrack.com', '+1-555-0101'),
('HeavyLift Cargo', 'ops@heavylift.com', '+1-555-0102'),
('AirExpress Global', 'info@airexpress.com', '+1-555-0103'),
('Standard Parcel', 'help@standard.com', '+1-555-0104');

-- 3. Insert some Shipments (Requires UUIDs from warehouses and carriers)
-- Note: In a real environment, you'd fetch IDs first. 
-- This script uses subqueries for demonstration.

DO $$
DECLARE
    wh_la UUID;
    wh_nj UUID;
    carrier_ft UUID;
BEGIN
    SELECT id INTO wh_la FROM warehouses WHERE name = 'West Coast Hub' LIMIT 1;
    SELECT id INTO wh_nj FROM warehouses WHERE name = 'East Coast Center' LIMIT 1;
    SELECT id INTO carrier_ft FROM carriers WHERE name = 'FastTrack Logistics' LIMIT 1;

    INSERT INTO shipments (tracking_number, origin_id, destination_id, carrier_id, status, estimated_delivery)
    VALUES ('LOG-12345678', wh_la, wh_nj, carrier_ft, 'In Transit', NOW() + INTERVAL '3 days');
END $$;
