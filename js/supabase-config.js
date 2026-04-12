/* ═══════════════════════════════════════════
   DIGGIN CAFÉ — Supabase Configuration
   ═══════════════════════════════════════════ */

const SUPABASE_URL = 'https://gjylrvqhvjpdodhqdweg.supabase.co';
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
    if (!supabase) return [];
    let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: true }); // Oldest first for chef

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

async function fetchOrdersDesc(statusFilter) {
    if (!supabase) return [];
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
    if (!supabase) throw new Error('Supabase not configured');
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
    if (!supabase) throw new Error('Supabase not configured');
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
    if (!supabase) return [];
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
    if (!supabase) return;
    const { error } = await supabase
        .from('calls')
        .update({ status: 'dismissed' })
        .eq('id', callId);
    if (error) console.error('Dismiss call error:', error);
}

/* ─── BOOKING / RESERVATION HELPERS ──────── */

async function insertBooking(bookingData) {
    if (!supabase) throw new Error('Supabase not configured');
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

async function fetchBookings() {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) {
        console.error('Fetch bookings error:', error);
        return [];
    }
    return data || [];
}

async function updateBookingStatus(bookingId, newStatus) {
    if (!supabase) return;
    const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);
    if (error) console.error('Update booking error:', error);
}

/* ─── ANALYTICS HELPERS ──────────────────── */

async function fetchAnalytics() {
    if (!supabase) return { orders: [], revenue: 0, topItems: [] };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data: todayOrders, error } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error('Fetch analytics error:', error);
        return { orders: [], revenue: 0, topItems: [] };
    }

    const orders = todayOrders || [];
    const paidOrders = orders.filter(o => o.status === 'paid');
    const revenue = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    
    // Top items
    const itemCounts = {};
    orders.forEach(order => {
        (order.items || []).forEach(item => {
            if (!itemCounts[item.name]) itemCounts[item.name] = { count: 0, revenue: 0 };
            itemCounts[item.name].count += item.quantity;
            itemCounts[item.name].revenue += item.price * item.quantity;
        });
    });
    const topItems = Object.entries(itemCounts)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    return { orders, revenue, topItems };
}

async function fetchWeeklyRevenue() {
    if (!supabase) return [];
    
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const { data, error } = await supabase
        .from('orders')
        .select('total, created_at, status')
        .eq('status', 'paid')
        .gte('created_at', weekAgo.toISOString())
        .order('created_at', { ascending: true });
    
    if (error) return [];
    return data || [];
}

/* ─── REALTIME SUBSCRIPTIONS ──────────────── */

function subscribeToOrders(callback) {
    if (!supabase) return null;
    return supabase
        .channel('orders-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
            callback(payload);
        })
        .subscribe();
}

function subscribeToCalls(callback) {
    if (!supabase) return null;
    return supabase
        .channel('calls-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'calls' }, (payload) => {
            callback(payload);
        })
        .subscribe();
}
