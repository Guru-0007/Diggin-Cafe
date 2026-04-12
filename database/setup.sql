-- ═══════════════════════════════════════════
-- THE COFFEE HOUSE — Supabase Database Setup
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── ORDERS TABLE ────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    table_number TEXT NOT NULL,
    customer_name TEXT,
    items JSONB NOT NULL DEFAULT '[]',
    total NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'paid')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── CALLS TABLE ─────────────────────────────
CREATE TABLE IF NOT EXISTS calls (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    table_number TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'waiter',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'dismissed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── BOOKINGS TABLE ──────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    date TEXT,
    time TEXT,
    guests TEXT,
    outlet TEXT,
    notes TEXT,
    status TEXT DEFAULT 'confirmed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ROW LEVEL SECURITY ─────────────────────
-- Enable RLS on all tables
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Allow all operations for anonymous (public) users
-- In production, you'd want more restrictive policies
CREATE POLICY "Allow all access to orders" ON orders
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to calls" ON calls
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to bookings" ON bookings
    FOR ALL USING (true) WITH CHECK (true);

-- ─── ENABLE REALTIME ─────────────────────────
-- Enable realtime for orders and calls tables
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE calls;

-- ─── INDEXES ─────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_table_number ON orders (table_number);
CREATE INDEX IF NOT EXISTS idx_calls_status ON calls (status);
