-- ═══════════════════════════════════════════
-- DIGGIN CAFÉ — Database Schema
-- ═══════════════════════════════════════════

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_number TEXT NOT NULL,
    customer_name TEXT NOT NULL DEFAULT 'Guest',
    items JSONB NOT NULL DEFAULT '[]',
    total NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'paid')),
    eta TEXT,
    timer_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Calls (Waiter) Table
CREATE TABLE IF NOT EXISTS calls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_number TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'waiter' CHECK (type IN ('waiter', 'water', 'bill', 'help')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'dismissed')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Bookings / Reservations Table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    guests TEXT DEFAULT '2',
    outlet TEXT DEFAULT 'Anand Lok',
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Realtime (run in Supabase dashboard → SQL Editor)
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE calls;
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;

-- Enable Row Level Security (public access for anon key)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policies: Allow all operations for anon (demo/prototype mode)
CREATE POLICY "Allow all on orders" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on calls" ON calls FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on bookings" ON bookings FOR ALL USING (true) WITH CHECK (true);

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_orders_modtime
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_calls_status ON calls(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date, time);

-- ═══════════════════════════════════════════
-- MIGRATION v2: Add timer columns to orders
-- Run this if you already have the table set up
-- ═══════════════════════════════════════════
ALTER TABLE orders ADD COLUMN IF NOT EXISTS eta TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS timer_end TIMESTAMPTZ;

