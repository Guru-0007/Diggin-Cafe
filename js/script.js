/* ═══════════════════════════════════════════
   THE COFFEE HOUSE — Main Script
   Cart, Menu Rendering, Checkout, Intro
   Supabase Integration
   ═══════════════════════════════════════════ */

document.addEventListener("DOMContentLoaded", () => {
    initIntro();
    initMobileMenu();
    injectOrderTray();
    injectCartDrawer();
    injectCheckoutModal();
    injectCallWaiterBtn();
    updateCartCount();

    // If on menu page, load items
    if (document.getElementById("menu-container")) {
        fetchMenuData();
    }

    // Smooth scroll reveal
    initScrollAnimations();
});

// ─── STATE ───────────────────────────────────
let cart = JSON.parse(localStorage.getItem("cafe_cart")) || [];

function saveCart() {
    localStorage.setItem("cafe_cart", JSON.stringify(cart));
    updateCartCount();
    renderCartItems();
}

function updateCartCount() {
    document.querySelectorAll(".cart-count-badge").forEach(el => {
        const total = cart.reduce((sum, i) => sum + i.quantity, 0);
        el.textContent = total;
        el.classList.remove("badge-pulse");
        void el.offsetWidth;
        if (total > 0) el.classList.add("badge-pulse");
    });
    // Update floating tray
    const tray = document.getElementById("order-tray");
    if (tray) {
        const total = cart.reduce((sum, i) => sum + i.quantity, 0);
        const trayCount = document.getElementById("tray-count");
        const trayTotal = document.getElementById("tray-total");
        if (trayCount) trayCount.textContent = total;
        if (trayTotal) {
            const price = cart.reduce((s, i) => s + i.price * i.quantity, 0);
            trayTotal.textContent = `₹${price}`;
        }
        if (total > 0) {
            tray.classList.remove("translate-y-full", "opacity-0");
            tray.classList.add("translate-y-0", "opacity-100");
        } else {
            tray.classList.add("translate-y-full", "opacity-0");
            tray.classList.remove("translate-y-0", "opacity-100");
        }
    }
}

// ─── INTRO EXPERIENCE ────────────────────────
function initIntro() {
    const enterBtn = document.getElementById("enter-btn");
    const introScreen = document.getElementById("intro-screen");
    const mainContent = document.getElementById("main-content");

    // If no intro (e.g. menu.html), show content immediately
    if (!introScreen) {
        if (mainContent) mainContent.style.opacity = "1";
        return;
    }

    // Session-based: show only on first load
    if (sessionStorage.getItem("intro_seen")) {
        introScreen.style.display = "none";
        if (mainContent) mainContent.style.opacity = "1";
        return;
    }

    // Block scroll while intro is visible
    document.body.style.overflow = "hidden";

    enterBtn.addEventListener("click", () => {
        sessionStorage.setItem("intro_seen", "true");
        introScreen.style.transition = "opacity 0.8s ease-out";
        introScreen.style.opacity = "0";

        if (mainContent) {
            mainContent.style.opacity = "1";
        }

        setTimeout(() => {
            introScreen.style.display = "none";
            document.body.style.overflow = "";
        }, 800);
    });
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

// ─── SCROLL ANIMATIONS ──────────────────────
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("scroll-visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    document.querySelectorAll(".scroll-reveal").forEach(el => observer.observe(el));
}

// ─── FALLBACK MENU ──────────────────────────
const fallbackMenu = {
    coffee: [
        { id: "c1", name: "Cappuccino", price: 150, description: "Espresso with steamed milk and velvety foam.", image: "https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&q=80", tag: "Popular" },
        { id: "c2", name: "Latte", price: 180, description: "Smooth espresso blended with velvety steamed milk.", image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&q=80" },
        { id: "c3", name: "Espresso", price: 120, description: "A single shot of intense, rich espresso.", image: "https://images.unsplash.com/photo-1551030173-122aabc4489c?auto=format&fit=crop&q=80" },
        { id: "c4", name: "Americano", price: 140, description: "Bold espresso with hot water for a clean, strong taste.", image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefda?auto=format&fit=crop&q=80" },
        { id: "c5", name: "Mocha", price: 200, description: "Espresso with chocolate and steamed milk.", image: "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?auto=format&fit=crop&q=80", tag: "Best Seller" },
        { id: "c6", name: "Flat White", price: 170, description: "Velvety micro-foam espresso drink from Australia.", image: "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?auto=format&fit=crop&q=80" }
    ],
    snacks: [
        { id: "s1", name: "Grilled Sandwich", price: 140, description: "Freshly toasted sourdough with hearty fillings.", image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80" },
        { id: "s2", name: "Cheese Croissant", price: 160, description: "Buttery, flaky pastry filled with melted cheese.", image: "https://images.unsplash.com/photo-1555507036-ab1f40ce88f4?auto=format&fit=crop&q=80", tag: "Best Seller" },
        { id: "s3", name: "Avocado Toast", price: 190, description: "Smashed avocado on artisan bread with chili flakes.", image: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&q=80", tag: "Popular", time: "breakfast" },
        { id: "s4", name: "Club Sandwich", price: 220, description: "Triple-decker with chicken, bacon, and fresh veggies.", image: "https://images.unsplash.com/photo-1567234669003-dce7a7a88821?auto=format&fit=crop&q=80", time: "lunch" },
        { id: "s5", name: "Panini", price: 180, description: "Italian pressed sandwich with mozzarella and pesto.", image: "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&q=80" }
    ],
    desserts: [
        { id: "d1", name: "Chocolate Cake", price: 220, description: "Rich double chocolate cake slice with a smooth glaze.", image: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&q=80", tag: "Popular" },
        { id: "d2", name: "Brownie", price: 180, description: "Fudgy warm brownie with dark chocolate chunks.", image: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&q=80" },
        { id: "d3", name: "Tiramisu", price: 280, description: "Classic Italian dessert with mascarpone and espresso.", image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&q=80", tag: "Best Seller" },
        { id: "d4", name: "Cheesecake", price: 250, description: "New York-style creamy cheesecake with berry compote.", image: "https://images.unsplash.com/photo-1524351199432-f330e91a4dab?auto=format&fit=crop&q=80" }
    ],
    beverages: [
        { id: "b1", name: "Cold Coffee", price: 200, description: "Thick, blended chilled coffee with a hint of vanilla.", image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba1?auto=format&fit=crop&q=80" },
        { id: "b2", name: "Iced Latte", price: 210, description: "Chilled espresso poured over creamy milk and ice.", image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80" },
        { id: "b3", name: "Matcha Latte", price: 230, description: "Premium Japanese matcha whisked with steamed milk.", image: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&q=80", tag: "Popular" },
        { id: "b4", name: "Fresh Juice", price: 160, description: "Seasonal fruits cold-pressed to perfection.", image: "https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?auto=format&fit=crop&q=80" },
        { id: "b5", name: "Smoothie Bowl", price: 250, description: "Açaí blended thick with granola and fresh berries.", image: "https://images.unsplash.com/photo-1511690743698-d9d18f7e20f1?auto=format&fit=crop&q=80", time: "breakfast" }
    ]
};

// ─── TIME-BASED FILTERING ────────────────────
function getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour < 11) return "breakfast";
    if (hour < 16) return "lunch";
    return "evening";
}

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

    const timeOfDay = getTimeOfDay();

    // Category filter tabs
    const filterWrap = document.createElement("div");
    filterWrap.className = "flex flex-wrap items-center gap-3 mb-14 scroll-reveal";
    const categories = Object.keys(data);
    filterWrap.innerHTML = `
        <button class="category-filter active px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-[0.1em] transition-all duration-300 bg-cafe-accent text-white" data-cat="all">All</button>
        ${categories.map(cat => `
            <button class="category-filter px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-[0.1em] transition-all duration-300 bg-white/[0.04] text-cafe-muted hover:bg-cafe-accent/20 hover:text-cafe-accent border border-white/[0.06]" data-cat="${cat}">
                ${categoryIcons[cat] || "🍽️"} ${cat}
            </button>
        `).join("")}
        <div class="ml-auto flex items-center gap-2 text-cafe-muted/60 text-xs">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span>${timeOfDay === 'breakfast' ? 'Breakfast menu active' : timeOfDay === 'lunch' ? 'Lunch specials active' : 'Evening picks'}</span>
        </div>
    `;
    container.appendChild(filterWrap);

    // Category filter logic
    filterWrap.querySelectorAll(".category-filter").forEach(btn => {
        btn.addEventListener("click", () => {
            filterWrap.querySelectorAll(".category-filter").forEach(b => {
                b.classList.remove("bg-cafe-accent", "text-white", "active");
                b.classList.add("bg-white/[0.04]", "text-cafe-muted");
            });
            btn.classList.add("bg-cafe-accent", "text-white", "active");
            btn.classList.remove("bg-white/[0.04]", "text-cafe-muted");

            const cat = btn.dataset.cat;
            container.querySelectorAll(".menu-category-section").forEach(sec => {
                if (cat === "all" || sec.dataset.category === cat) {
                    sec.classList.remove("hidden");
                } else {
                    sec.classList.add("hidden");
                }
            });
        });
    });

    for (const [category, items] of Object.entries(data)) {
        const section = document.createElement("section");
        section.className = "menu-category-section scroll-reveal";
        section.dataset.category = category;

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
            // Time-based: highlight relevant items
            if (item.time && item.time === timeOfDay) {
                item.tag = item.tag || "⏰ " + timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1);
            }
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
    const tagClass = item.tag ? (tagColors[item.tag] || "bg-emerald-500/90") : "";
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

    // Show add-to-cart toast
    showMiniToast(`${name} added to order`);
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

function showMiniToast(msg) {
    let toast = document.getElementById("mini-toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "mini-toast";
        toast.className = "fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] bg-cafe-card border border-cafe-accent/30 text-cafe-text px-6 py-3 rounded-xl shadow-2xl text-sm font-semibold transition-all duration-500 opacity-0 translate-y-4 pointer-events-none";
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.remove("opacity-0", "translate-y-4");
    toast.classList.add("opacity-100", "translate-y-0");
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
        toast.classList.add("opacity-0", "translate-y-4");
        toast.classList.remove("opacity-100", "translate-y-0");
    }, 2000);
}

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

// ─── FLOATING ORDER TRAY ────────────────────
function injectOrderTray() {
    const tray = document.createElement("div");
    tray.id = "order-tray";
    tray.className = "fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] bg-cafe-card/95 backdrop-blur-xl border border-cafe-accent/30 rounded-2xl px-6 py-4 shadow-[0_8px_40px_rgba(0,0,0,0.5)] flex items-center gap-5 transition-all duration-500 translate-y-full opacity-0 cursor-pointer hover:border-cafe-accent/60 hover:shadow-[0_12px_50px_rgba(200,135,58,0.15)]";
    tray.innerHTML = `
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-cafe-accent/15 rounded-xl flex items-center justify-center border border-cafe-accent/20">
                <svg class="w-5 h-5 text-cafe-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            </div>
            <div>
                <div class="text-cafe-text font-bold text-sm"><span id="tray-count">0</span> items</div>
                <div class="text-cafe-accent font-bold text-lg" id="tray-total">₹0</div>
            </div>
        </div>
        <div class="w-px h-10 bg-white/[0.08]"></div>
        <div class="text-cafe-text text-xs font-bold uppercase tracking-[0.15em] flex items-center gap-2">
            View Order
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
        </div>
    `;
    document.body.appendChild(tray);

    tray.addEventListener("click", () => {
        renderCartItems();
        document.getElementById("cart-slider")?.classList.add("open");
        document.getElementById("cart-backdrop")?.classList.add("open");
    });
}

// ─── CART DRAWER UI ─────────────────────────
function injectCartDrawer() {
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

                <!-- Order Summary -->
                <div id="checkout-summary" class="mb-6 p-4 bg-cafe-card rounded-xl border border-white/[0.04] max-h-32 overflow-y-auto"></div>

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

                    <div class="flex justify-between items-center p-4 bg-cafe-accent/10 rounded-xl border border-cafe-accent/20">
                        <span class="text-cafe-muted text-sm font-bold uppercase tracking-wider">Total</span>
                        <span id="checkout-total" class="text-2xl font-bold text-cafe-accent">₹0</span>
                    </div>

                    <button type="submit" id="submit-order-btn" class="btn-press w-full py-4 mt-2 bg-cafe-accent hover:bg-cafe-accentHover text-white font-bold uppercase tracking-[0.12em] rounded-xl transition-all shadow-lg hover:shadow-[0_8px_30px_rgba(200,135,58,0.25)] text-sm">
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
            <span class="font-semibold text-sm">Order placed! Your food is being prepared 🎉</span>
        </div>
    `;
    document.body.appendChild(wrapper);

    const overlay = document.getElementById("checkout-overlay");
    const closeOverlay = () => overlay.classList.remove("open");

    // Populate summary when opened
    const observer = new MutationObserver(() => {
        if (overlay.classList.contains("open")) {
            const summary = document.getElementById("checkout-summary");
            const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
            summary.innerHTML = cart.map(i => `
                <div class="flex justify-between items-center py-1.5 text-sm">
                    <span class="text-cafe-text"><span class="text-cafe-accent font-bold">${i.quantity}×</span> ${i.name}</span>
                    <span class="text-cafe-muted">₹${i.price * i.quantity}</span>
                </div>
            `).join("");
            document.getElementById("checkout-total").textContent = `₹${total}`;
        }
    });
    observer.observe(overlay, { attributes: true, attributeFilter: ["class"] });

    document.getElementById("close-checkout").addEventListener("click", closeOverlay);
    document.getElementById("checkout-bg").addEventListener("click", closeOverlay);

    document.getElementById("checkout-form").addEventListener("submit", async (e) => {
        e.preventDefault();

        const btn = document.getElementById("submit-order-btn");
        const custName = document.getElementById("cust-name").value.trim();
        const tableNum = document.getElementById("table-number").value.trim();
        const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

        btn.disabled = true;
        btn.textContent = "Placing Order...";

        const orderData = {
            table_number: tableNum,
            customer_name: custName,
            items: cart.map(i => ({ name: i.name, price: i.price, quantity: i.quantity })),
            total: total,
            status: "pending"
        };

        try {
            // Insert into Supabase
            if (typeof insertOrder === "function") {
                await insertOrder(orderData);
            } else {
                // Fallback: localStorage
                const order = {
                    id: Date.now().toString(),
                    customer: custName,
                    table: tableNum,
                    items: orderData.items,
                    total: total,
                    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                    status: "pending"
                };
                const orders = JSON.parse(localStorage.getItem("cafe_orders")) || [];
                orders.push(order);
                localStorage.setItem("cafe_orders", JSON.stringify(orders));
            }

            // Clear cart
            cart = [];
            saveCart();
            closeOverlay();

            // Show toast
            const toast = document.getElementById("success-toast");
            toast.classList.add("show");
            setTimeout(() => toast.classList.remove("show"), 4000);
        } catch (err) {
            console.error("Order failed:", err);
            showMiniToast("Failed to place order. Please try again.");
        } finally {
            btn.disabled = false;
            btn.textContent = "Confirm Order";
            e.target.reset();
        }
    });
}

// ─── CALL WAITER BUTTON ─────────────────────
function injectCallWaiterBtn() {
    const btn = document.createElement("button");
    btn.id = "call-waiter-btn";
    btn.className = "fixed bottom-6 right-6 z-[80] w-14 h-14 bg-cafe-accent hover:bg-cafe-accentHover text-white rounded-full shadow-[0_8px_30px_rgba(200,135,58,0.3)] flex items-center justify-center transition-all duration-300 hover:scale-110 group";
    btn.title = "Call Waiter";
    btn.innerHTML = `
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
    `;
    document.body.appendChild(btn);

    // Call waiter modal
    const modal = document.createElement("div");
    modal.id = "call-waiter-modal";
    modal.className = "modal-overlay fixed inset-0 z-[95] flex items-center justify-center p-6";
    modal.innerHTML = `
        <div class="absolute inset-0 bg-black/85 backdrop-blur-md call-waiter-bg"></div>
        <div class="relative bg-cafe-bg border border-white/[0.08] rounded-[2rem] p-8 sm:p-10 w-full max-w-sm shadow-2xl text-center">
            <div class="w-16 h-16 mx-auto bg-cafe-accent/10 text-cafe-accent rounded-2xl flex items-center justify-center mb-6 border border-cafe-accent/15">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            </div>
            <h3 class="text-2xl font-serif italic text-cafe-text mb-2">Call Waiter</h3>
            <p class="text-cafe-muted text-sm font-light mb-6">Enter your table number and we'll send someone over.</p>
            <form id="call-waiter-form" class="space-y-4">
                <input type="number" id="call-table" min="1" max="99" required class="w-full bg-cafe-card border border-white/[0.06] rounded-xl px-5 py-4 text-cafe-text text-center text-lg focus:outline-none focus:border-cafe-accent/60 transition-colors placeholder-cafe-muted/40" placeholder="Table #">
                <select id="call-type" class="w-full bg-cafe-card border border-white/[0.06] rounded-xl px-5 py-4 text-cafe-text text-base focus:outline-none focus:border-cafe-accent/60 transition-colors">
                    <option value="waiter">Call Waiter</option>
                    <option value="water">Need Water</option>
                    <option value="bill">Request Bill</option>
                    <option value="help">Need Help</option>
                </select>
                <button type="submit" id="call-submit-btn" class="btn-press w-full py-4 bg-cafe-accent hover:bg-cafe-accentHover text-white font-bold uppercase tracking-[0.12em] rounded-xl transition-all shadow-lg text-sm">
                    Send Request
                </button>
            </form>
            <button class="call-waiter-close mt-4 text-cafe-muted text-sm hover:text-cafe-text transition-colors">Cancel</button>
        </div>
    `;
    document.body.appendChild(modal);

    btn.addEventListener("click", () => modal.classList.add("open"));
    modal.querySelector(".call-waiter-bg").addEventListener("click", () => modal.classList.remove("open"));
    modal.querySelector(".call-waiter-close").addEventListener("click", () => modal.classList.remove("open"));

    document.getElementById("call-waiter-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const table = document.getElementById("call-table").value.trim();
        const type = document.getElementById("call-type").value;
        const submitBtn = document.getElementById("call-submit-btn");

        submitBtn.disabled = true;
        submitBtn.textContent = "Sending...";

        try {
            if (typeof insertCall === "function") {
                await insertCall({
                    table_number: table,
                    type: type,
                    status: "active"
                });
            }
            modal.classList.remove("open");
            showMiniToast("Waiter has been notified! 🔔");
        } catch (err) {
            showMiniToast("Failed to send request. Try again.");
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = "Send Request";
            e.target.reset();
        }
    });
}
