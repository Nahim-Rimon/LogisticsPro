-- Supabase Schema for Supply Chain Logistics

-- Warehouses
CREATE TABLE warehouses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    capacity INTEGER,
    manager_id TEXT, -- Clerk User ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Carriers
CREATE TABLE carriers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shipments
CREATE TABLE shipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tracking_number TEXT UNIQUE NOT NULL,
    origin_id UUID REFERENCES warehouses(id),
    destination_id UUID REFERENCES warehouses(id),
    carrier_id UUID REFERENCES carriers(id),
    status TEXT NOT NULL DEFAULT 'Pending', -- Pending, In Transit, Delivered, Exceptions
    estimated_delivery TIMESTAMP WITH TIME ZONE,
    customer_id TEXT, -- Clerk User ID
    supplier_id TEXT, -- Clerk User ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shipment Events (Tracking History)
CREATE TABLE shipment_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    location TEXT,
    description TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE carriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_events ENABLE ROW LEVEL SECURITY;
