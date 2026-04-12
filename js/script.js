/* ═══════════════════════════════════════════
   THE COFFEE HOUSE — Main Script
   Cart, Menu Rendering, Checkout, Intro
   ═══════════════════════════════════════════ */

document.addEventListener("DOMContentLoaded", () => {
    initIntro();
    initMobileMenu();
    injectCartUI();
    injectCheckoutModal();
    updateCartCount();

    // If on menu page, load items
    if (document.getElementById("menu-container")) {
        fetchMenuData();
    }
});

// ─── STATE ───────────────────────────────────
let cart = JSON.parse(localStorage.getItem("cafe_cart")) || [];

function saveCart() {
    localStorage.setItem("cafe_cart", JSON.stringify(cart));
    updateCartCount();
    renderCartItems();
}

function updateCartCount() {
    document.querySelectorAll("#cart-count").forEach(el => {
        const total = cart.reduce((sum, i) => sum + i.quantity, 0);
        el.textContent = total;
        // Pulse animation
        el.classList.remove("badge-pulse");
        void el.offsetWidth; // reflow trigger
        if (total > 0) el.classList.add("badge-pulse");
    });
}

// ─── INTRO EXPERIENCE ────────────────────────
function initIntro() {
    const enterBtn = document.getElementById("enter-btn");
    const introScreen = document.getElementById("intro-screen");
    if (!enterBtn || !introScreen) return;

    enterBtn.addEventListener("click", () => {
        introScreen.style.transition = "opacity 0.8s ease-out";
        introScreen.style.opacity = "0";
        setTimeout(() => {
            introScreen.style.display = "none";
            document.body.style.overflow = "";
        }, 800);
    });

    // Block scroll behind intro
    document.body.style.overflow = "hidden";
}

// ─── MOBILE MENU ─────────────────────────────
function initMobileMenu() {
    const toggle = document.getElementById("mobile-menu-toggle");
    const menu = document.getElementById("mobile-menu");
    if (!toggle || !menu) return;
    toggle.addEventListener("click", () => {
        menu.classList.toggle("hidden");
    });
}

// ─── FALLBACK MENU (always works even if fetch fails) ──
const fallbackMenu = {
    coffee: [
        { id: "c1", name: "Cappuccino", price: 150, description: "Espresso with steamed milk and foam.", image: "https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&q=80", tag: "Popular" },
        { id: "c2", name: "Latte", price: 180, description: "Smooth espresso blended with velvety steamed milk.", image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&q=80" },
        { id: "c3", name: "Espresso", price: 120, description: "A single shot of intense, rich espresso.", image: "https://images.unsplash.com/photo-1551030173-122aabc4489c?auto=format&fit=crop&q=80" }
    ],
    snacks: [
        { id: "s1", name: "Grilled Sandwich", price: 140, description: "Freshly toasted sourdough with hearty fillings.", image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80" },
        { id: "s2", name: "Cheese Croissant", price: 160, description: "Buttery, flaky pastry filled with melted cheese.", image: "https://images.unsplash.com/photo-1555507036-ab1f40ce88f4?auto=format&fit=crop&q=80", tag: "Best Seller" }
    ],
    desserts: [
        { id: "d1", name: "Chocolate Cake", price: 220, description: "Rich double chocolate cake slice with a smooth glaze.", image: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&q=80" },
        { id: "d2", name: "Brownie", price: 180, description: "Fudgy warm brownie with dark chocolate chunks.", image: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&q=80" }
    ],
    beverages: [
        { id: "b1", name: "Cold Coffee", price: 200, description: "Thick, blended chilled coffee with a hint of vanilla.", image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba1?auto=format&fit=crop&q=80" },
        { id: "b2", name: "Iced Latte", price: 210, description: "Chilled espresso poured over creamy milk and ice.", image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80" }
    ]
};

// ─── MENU FETCHING & RENDERING ───────────────
async function fetchMenuData() {
    const loading = document.getElementById("loading-state");
    const error = document.getElementById("error-state");
    const container = document.getElementById("menu-container");

    let data;
    try {
        const res = await fetch("data/menu.json");
        if (!res.ok) throw new Error("Failed");
        data = await res.json();
    } catch (e) {
        console.warn("Fetch failed, using fallback menu:", e);
        data = fallbackMenu;
    }

    loading.classList.add("hidden");
    if (error) error.classList.add("hidden");
    container.classList.remove("hidden");
    renderMenu(data, container);
}

function renderMenu(data, container) {
    const categoryIcons = {
        coffee: "☕",
        snacks: "🥪",
        desserts: "🍰",
        beverages: "🧊"
    };

    for (const [category, items] of Object.entries(data)) {
        const section = document.createElement("section");

        // Category header
        const header = document.createElement("div");
        header.className = "flex items-center gap-4 mb-10";
        header.innerHTML = `
            <span class="text-3xl">${categoryIcons[category] || "🍽️"}</span>
            <h2 class="text-3xl md:text-4xl font-serif italic text-cafe-text capitalize">${category}</h2>
            <div class="flex-grow h-px bg-white/[0.06] ml-4"></div>
        `;
        section.appendChild(header);

        // Grid
        const grid = document.createElement("div");
        grid.className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8";

        items.forEach(item => {
            grid.appendChild(createMenuCard(item));
        });

        section.appendChild(grid);
        container.appendChild(section);
    }
}

function createMenuCard(item) {
    const card = document.createElement("div");
    card.className = "bg-cafe-bg rounded-2xl overflow-hidden border border-white/[0.04] flex flex-col group transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)] hover:border-cafe-accent/20 img-zoom";

    const tagColors = {
        "Popular": "bg-cafe-accent/90",
        "Best Seller": "bg-red-500/90"
    };
    const tagClass = item.tag ? (tagColors[item.tag] || "bg-cafe-accent/90") : "";
    const badgeHTML = item.tag
        ? `<span class="absolute top-4 left-4 ${tagClass} text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest backdrop-blur-sm shadow-lg z-10">${item.tag}</span>`
        : "";

    card.innerHTML = `
        <div class="relative h-52 sm:h-56 w-full overflow-hidden">
            ${badgeHTML}
            <img src="${item.image}" alt="${item.name}" loading="lazy" class="absolute inset-0 w-full h-full object-cover">
            <div class="absolute inset-0 bg-gradient-to-t from-cafe-bg via-cafe-bg/20 to-transparent"></div>
        </div>
        <div class="p-6 sm:p-7 flex-grow flex flex-col">
            <div class="flex justify-between items-start mb-3">
                <h3 class="text-lg font-bold text-cafe-text tracking-tight leading-snug pr-3">${item.name}</h3>
                <span class="text-xl font-bold text-cafe-accent whitespace-nowrap">₹${item.price}</span>
            </div>
            <p class="text-cafe-muted text-sm font-light leading-relaxed mb-6 flex-grow">${item.description}</p>
            <button onclick="addToCart('${item.id}', '${item.name.replace(/'/g, "\\'")}', ${item.price})" class="btn-press w-full py-3.5 bg-white/[0.04] hover:bg-cafe-accent text-center text-[13px] font-bold tracking-[0.12em] uppercase rounded-xl transition-all duration-300 border border-white/[0.06] hover:border-transparent text-cafe-text hover:text-white mt-auto flex items-center justify-center gap-2.5 shadow-sm hover:shadow-[0_4px_20px_rgba(200,135,58,0.25)]">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                Add to Order
            </button>
        </div>
    `;
    return card;
}

// ─── CART LOGIC ──────────────────────────────
window.addToCart = function (id, name, price) {
    const existing = cart.find(c => c.id === id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ id, name, price, quantity: 1 });
    }
    saveCart();

    // Open cart drawer
    document.getElementById("cart-slider")?.classList.add("open");
    document.getElementById("cart-backdrop")?.classList.add("open");
};

window.updateQuantity = function (id, change) {
    const item = cart.find(c => c.id === id);
    if (!item) return;
    item.quantity += change;
    if (item.quantity <= 0) {
        cart = cart.filter(c => c.id !== id);
    }
    saveCart();
};

function renderCartItems() {
    const container = document.getElementById("cart-items-container");
    const totalEl = document.getElementById("cart-total");
    const btn = document.getElementById("checkout-btn");
    if (!container) return;

    container.innerHTML = "";
    let total = 0;

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="text-center py-16">
                <div class="text-5xl mb-4 opacity-30">☕</div>
                <p class="text-cafe-muted font-light text-lg">Your order is empty</p>
                <p class="text-cafe-muted/50 text-sm mt-2">Add items from the menu</p>
            </div>
        `;
        if (btn) {
            btn.disabled = true;
            btn.classList.add("opacity-30", "cursor-not-allowed");
        }
    } else {
        if (btn) {
            btn.disabled = false;
            btn.classList.remove("opacity-30", "cursor-not-allowed");
        }

        cart.forEach(item => {
            total += item.price * item.quantity;
            const row = document.createElement("div");
            row.className = "flex justify-between items-center mb-4 p-4 bg-cafe-card rounded-xl border border-white/[0.04]";
            row.innerHTML = `
                <div class="flex-grow mr-4">
                    <h4 class="text-cafe-text font-bold text-[15px] mb-0.5">${item.name}</h4>
                    <span class="text-cafe-accent text-sm font-semibold">₹${item.price} × ${item.quantity}</span>
                </div>
                <div class="flex items-center gap-1 bg-cafe-bg rounded-lg border border-white/[0.04] p-1">
                    <button onclick="updateQuantity('${item.id}', -1)" class="w-8 h-8 flex items-center justify-center text-cafe-muted hover:text-cafe-text hover:bg-white/5 rounded-md transition-colors font-bold text-lg">−</button>
                    <span class="text-cafe-text font-bold w-7 text-center text-sm">${item.quantity}</span>
                    <button onclick="updateQuantity('${item.id}', 1)" class="w-8 h-8 flex items-center justify-center text-cafe-muted hover:text-cafe-text hover:bg-white/5 rounded-md transition-colors font-bold text-lg">+</button>
                </div>
            `;
            container.appendChild(row);
        });
    }
    if (totalEl) totalEl.textContent = `₹${total}`;
}

// ─── CART UI INJECTION ───────────────────────
function injectCartUI() {
    const toggles = document.querySelectorAll("#cart-toggle");

    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
        <!-- Backdrop -->
        <div id="cart-backdrop" class="cart-backdrop fixed inset-0 z-40 bg-black/70 backdrop-blur-sm cursor-pointer"></div>

        <!-- Cart Drawer -->
        <div id="cart-slider" class="cart-slider fixed top-0 right-0 h-full w-full sm:w-[420px] bg-cafe-bg z-50 shadow-2xl flex flex-col border-l border-white/[0.06]">
            <!-- Header -->
            <div class="px-7 py-6 border-b border-white/[0.04] flex justify-between items-center bg-cafe-bg">
                <h2 class="text-2xl font-serif italic text-cafe-text">Your Order</h2>
                <button id="close-cart" class="p-2 text-cafe-muted hover:text-cafe-text bg-white/[0.04] hover:bg-white/[0.08] rounded-full transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>

            <!-- Items -->
            <div class="px-7 py-6 flex-grow overflow-y-auto" id="cart-items-container"></div>

            <!-- Footer -->
            <div class="px-7 py-6 border-t border-white/[0.04] bg-cafe-card">
                <div class="flex justify-between items-center mb-6">
                    <span class="text-cafe-muted text-xs font-bold uppercase tracking-[0.2em]">Estimated Total</span>
                    <span id="cart-total" class="text-3xl font-bold text-cafe-accent tracking-tight">₹0</span>
                </div>
                <button id="checkout-btn" class="btn-press w-full py-4 bg-cafe-accent hover:bg-cafe-accentHover text-white font-bold uppercase tracking-[0.12em] rounded-xl transition-all shadow-lg hover:shadow-[0_8px_30px_rgba(200,135,58,0.25)] flex justify-center items-center gap-2.5 text-sm">
                    Place Order
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(wrapper);

    const slider = document.getElementById("cart-slider");
    const backdrop = document.getElementById("cart-backdrop");

    const closeCart = () => {
        slider.classList.remove("open");
        backdrop.classList.remove("open");
    };

    toggles.forEach(t => t.addEventListener("click", () => {
        renderCartItems();
        slider.classList.add("open");
        backdrop.classList.add("open");
    }));

    document.getElementById("close-cart").addEventListener("click", closeCart);
    backdrop.addEventListener("click", closeCart);

    document.getElementById("checkout-btn").addEventListener("click", () => {
        if (cart.length === 0) return;
        closeCart();
        document.getElementById("checkout-overlay")?.classList.add("open");
    });
}

// ─── CHECKOUT MODAL ──────────────────────────
function injectCheckoutModal() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
        <!-- Modal Overlay -->
        <div id="checkout-overlay" class="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-6">
            <div class="absolute inset-0 bg-black/85 backdrop-blur-md" id="checkout-bg"></div>
            <div class="relative bg-cafe-bg border border-white/[0.08] rounded-[2rem] p-8 sm:p-10 w-full max-w-md shadow-2xl">
                <!-- Close -->
                <button id="close-checkout" class="absolute top-6 right-6 p-2 text-cafe-muted hover:text-cafe-text bg-white/[0.04] hover:bg-white/[0.08] rounded-full transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>

                <!-- Header -->
                <div class="flex items-center gap-3 mb-2">
                    <div class="w-8 h-px bg-cafe-accent"></div>
                    <span class="text-cafe-accent text-xs font-bold uppercase tracking-[0.3em]">Checkout</span>
                </div>
                <h2 class="text-3xl font-serif italic text-cafe-text mb-2">Almost There</h2>
                <p class="text-cafe-muted text-sm font-light mb-8">Just your name and table number.</p>

                <!-- Form -->
                <form id="checkout-form" class="space-y-6">
                    <div>
                        <label class="block text-[11px] font-bold text-cafe-muted uppercase tracking-[0.2em] mb-2.5">Your Name</label>
                        <input type="text" id="cust-name" required class="w-full bg-cafe-card border border-white/[0.06] rounded-xl px-5 py-4 text-cafe-text text-base focus:outline-none focus:border-cafe-accent/60 transition-colors placeholder-cafe-muted/40" placeholder="e.g. Jane">
                    </div>
                    <div>
                        <label class="block text-[11px] font-bold text-cafe-muted uppercase tracking-[0.2em] mb-2.5">Table Number</label>
                        <input type="number" id="table-number" min="1" max="99" required class="w-full bg-cafe-card border border-white/[0.06] rounded-xl px-5 py-4 text-cafe-text text-base focus:outline-none focus:border-cafe-accent/60 transition-colors placeholder-cafe-muted/40" placeholder="e.g. 5">
                    </div>

                    <button type="submit" class="btn-press w-full py-4 mt-2 bg-cafe-accent hover:bg-cafe-accentHover text-white font-bold uppercase tracking-[0.12em] rounded-xl transition-all shadow-lg hover:shadow-[0_8px_30px_rgba(200,135,58,0.25)] text-sm">
                        Confirm Order
                    </button>
                </form>
            </div>
        </div>

        <!-- Success Toast -->
        <div id="success-toast" class="toast fixed top-8 left-1/2 -translate-x-1/2 z-[100] bg-cafe-bg border border-cafe-accent/40 text-cafe-text px-7 py-4 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] flex items-center gap-4">
            <div class="bg-green-500 p-1.5 rounded-full flex-shrink-0">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <span class="font-semibold text-sm">Order placed successfully! <span class="text-cafe-muted font-light">(demo)</span></span>
        </div>
    `;
    document.body.appendChild(wrapper);

    const overlay = document.getElementById("checkout-overlay");
    const closeOverlay = () => overlay.classList.remove("open");

    document.getElementById("close-checkout").addEventListener("click", closeOverlay);
    document.getElementById("checkout-bg").addEventListener("click", closeOverlay);

    document.getElementById("checkout-form").addEventListener("submit", (e) => {
        e.preventDefault();

        const custName = document.getElementById("cust-name").value.trim();
        const tableNum = document.getElementById("table-number").value.trim();
        const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

        // Save order to localStorage for chef dashboard
        const order = {
            id: Date.now().toString(),
            customer: custName,
            table: tableNum,
            items: cart.map(i => ({ name: i.name, price: i.price, quantity: i.quantity })),
            total: total,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            status: "pending"
        };

        const orders = JSON.parse(localStorage.getItem("cafe_orders")) || [];
        orders.push(order);
        localStorage.setItem("cafe_orders", JSON.stringify(orders));

        // Clear cart
        cart = [];
        saveCart();
        closeOverlay();

        // Show toast
        const toast = document.getElementById("success-toast");
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 4000);

        e.target.reset();
    });
}
