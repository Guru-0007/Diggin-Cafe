/* ═══════════════════════════════════════════
   SUPABASE CONFIGURATION
   ═══════════════════════════════════════════
   
   HOW TO GET YOUR ANON KEY:
   1. Go to https://supabase.com/dashboard
   2. Select your project (gjylrvqhvjpdodhqdweg)
   3. Go to Settings → API
   4. Copy the "anon / public" key
   5. Paste it below replacing YOUR_ANON_KEY_HERE
   ═══════════════════════════════════════════ */

const SUPABASE_URL = 'https://gjylrvqhvjpdodhqdweg.supabase.co';

// ⚠️ Using the publishable key provided
const SUPABASE_ANON_KEY = 'sb_publishable_J6YFy9g_h4S0jfctuQc8Dw_0EBYPZ3h';

let supabase;
try {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} catch (e) {
    console.warn('Supabase client init failed. Orders will use localStorage fallback.', e);
}

/* ─── ORDER HELPERS ───────────────────────── */

async function insertOrder(orderData) {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select();
    if (error) {
        console.error('Insert order error:', error);
        throw error;
    }
    return data[0];
}

async function fetchOrders(statusFilter) {
    let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

    if (statusFilter) {
        if (Array.isArray(statusFilter)) {
            query = query.in('status', statusFilter);
        } else {
            query = query.eq('status', statusFilter);
        }
    }

    const { data, error } = await query;
    if (error) {
        console.error('Fetch orders error:', error);
        return [];
    }
    return data || [];
}

async function updateOrderStatus(orderId, newStatus) {
    const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
    if (error) {
        console.error('Update order error:', error);
        throw error;
    }
}

/* ─── CALL WAITER HELPERS ─────────────────── */

async function insertCall(callData) {
    const { data, error } = await supabase
        .from('calls')
        .insert([callData])
        .select();
    if (error) {
        console.error('Insert call error:', error);
        throw error;
    }
    return data[0];
}

async function fetchActiveCalls() {
    const { data, error } = await supabase
        .from('calls')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
    if (error) {
        console.error('Fetch calls error:', error);
        return [];
    }
    return data || [];
}

async function dismissCall(callId) {
    const { error } = await supabase
        .from('calls')
        .update({ status: 'dismissed' })
        .eq('id', callId);
    if (error) console.error('Dismiss call error:', error);
}

/* ─── BOOKING HELPERS ─────────────────────── */

async function insertBooking(bookingData) {
    const { data, error } = await supabase
        .from('bookings')
        .insert([bookingData])
        .select();
    if (error) {
        console.error('Insert booking error:', error);
        throw error;
    }
    return data[0];
}

/* ─── REALTIME SUBSCRIPTIONS ──────────────── */

function subscribeToOrders(callback) {
    return supabase
        .channel('orders-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
            callback(payload);
        })
        .subscribe();
}

function subscribeToCalls(callback) {
    return supabase
        .channel('calls-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'calls' }, (payload) => {
            callback(payload);
        })
        .subscribe();
}
