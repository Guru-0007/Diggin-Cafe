/* ═══════════════════════════════════════════
   DIGGIN CAFÉ — Premium Script Engine
   Cart, Menu, Checkout, Intro, QR, Tracking,
   Sound Design, Dark Mode, Recommendations
   ═══════════════════════════════════════════ */

document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initIntro();
    initMobileMenu();
    initQRAutofill();
    injectOrderTray();
    injectCartDrawer();
    injectCheckoutModal();
    injectCallWaiterBtn();
    injectOrderTracker();
    updateCartCount();
    initNavbarScroll();
    initImageFallbacks();

    if (document.getElementById("menu-container")) {
        fetchMenuData();
    }

    initScrollAnimations();
    initTypewriter();
});

// ─── STATE ───────────────────────────────────
let cart = JSON.parse(localStorage.getItem("cafe_cart")) || [];
let activeOrderId = sessionStorage.getItem("active_order_id") || null;
let _audioCtx = null; // Reusable AudioContext
let _pollInterval = null; // Track polling interval

function getAudioCtx() {
    if (!_audioCtx || _audioCtx.state === 'closed') {
        try { _audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
        catch(e) { return null; }
    }
    if (_audioCtx.state === 'suspended') _audioCtx.resume();
    return _audioCtx;
}

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

        // Keep tray visible if actively tracking an order
        const isTracking = activeOrderId && document.getElementById("tray-order-section") && !document.getElementById("tray-order-section").classList.contains("hidden");

        if (total > 0 || isTracking) {
            tray.classList.remove("translate-y-full", "opacity-0", "pointer-events-none");
            tray.classList.add("translate-y-0", "opacity-100");
        } else {
            tray.classList.add("translate-y-full", "opacity-0", "pointer-events-none");
            tray.classList.remove("translate-y-0", "opacity-100");
        }
    }
}

// ─── DARK/LIGHT MODE ─────────────────────────
function initTheme() {
    const saved = localStorage.getItem("diggin_theme");
    if (saved === "light") {
        document.documentElement.classList.add("light");
    }
    // Sync all toggle icons on load
    const isLight = document.documentElement.classList.contains("light");
    document.querySelectorAll(".theme-toggle-icon").forEach(icon => {
        icon.textContent = isLight ? "☀️" : "🌙";
    });
    document.querySelectorAll(".theme-toggle").forEach(toggle => {
        toggle.addEventListener("click", () => {
            document.documentElement.classList.toggle("light");
            const nowLight = document.documentElement.classList.contains("light");
            localStorage.setItem("diggin_theme", nowLight ? "light" : "dark");
            document.querySelectorAll(".theme-toggle-icon").forEach(icon => {
                icon.textContent = nowLight ? "☀️" : "🌙";
            });
        });
    });
}

// ─── QR TABLE AUTOFILL ───────────────────────
function initQRAutofill() {
    const params = new URLSearchParams(window.location.search);
    const table = params.get("table");
    if (table) {
        sessionStorage.setItem("qr_table", table);
    }
}

function getQRTable() {
    return sessionStorage.getItem("qr_table") || "";
}

// ─── TYPEWRITER EFFECT ───────────────────────
function initTypewriter() {
    const el = document.getElementById("typewriter-text");
    if (!el) return;
    const text = el.dataset.text || el.textContent;
    el.textContent = "";
    el.classList.add("typewriter");
    let i = 0;
    const speed = 45;
    function type() {
        if (i < text.length) {
            el.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        } else {
            setTimeout(() => { el.style.borderRight = "none"; }, 1500);
        }
    }
    setTimeout(type, 800);
}

// ─── INTRO EXPERIENCE ────────────────────────
function initIntro() {
    const enterBtn = document.getElementById("enter-btn");
    const introScreen = document.getElementById("intro-screen");
    const mainContent = document.getElementById("main-content");

    if (!introScreen) {
        if (mainContent) mainContent.style.opacity = "1";
        return;
    }

    if (sessionStorage.getItem("intro_seen")) {
        introScreen.style.display = "none";
        if (mainContent) mainContent.style.opacity = "1";
        return;
    }

    document.body.style.overflow = "hidden";

    if (enterBtn) {
        enterBtn.addEventListener("click", () => {
            sessionStorage.setItem("intro_seen", "true");
            introScreen.style.transition = "opacity 1s ease-out, filter 1s ease-out";
            introScreen.style.opacity = "0";
            introScreen.style.filter = "blur(20px)";

            if (mainContent) {
                mainContent.style.transition = "opacity 1.2s ease-in";
                mainContent.style.opacity = "1";
            }

            setTimeout(() => {
                introScreen.style.display = "none";
                document.body.style.overflow = "";
            }, 1000);
        });
    }
}

// ─── MOBILE MENU ─────────────────────────────
function initMobileMenu() {
    const toggle = document.getElementById("mobile-menu-toggle");
    const menu = document.getElementById("mobile-menu");
    if (!toggle || !menu) return;
    toggle.addEventListener("click", () => {
        menu.classList.toggle("hidden");
        // Animate hamburger
        const isOpen = !menu.classList.contains("hidden");
        toggle.setAttribute("aria-expanded", isOpen);
    });
    // Close on link click
    menu.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => menu.classList.add("hidden"));
    });
}

// ─── SCROLL ANIMATIONS ──────────────────────
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                requestAnimationFrame(() => {
                    entry.target.classList.add("scroll-visible");
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    document.querySelectorAll(".scroll-reveal:not(.scroll-visible)").forEach(el => observer.observe(el));
}

// ─── NAVBAR SCROLL EFFECT ───────────────────
function initNavbarScroll() {
    const nav = document.getElementById("main-nav");
    if (!nav) return;
    let ticking = false;
    window.addEventListener("scroll", () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                if (window.scrollY > 60) {
                    nav.classList.add("scrolled");
                } else {
                    nav.classList.remove("scrolled");
                }
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

// ─── IMAGE FALLBACK SYSTEM ──────────────────
function initImageFallbacks() {
    document.addEventListener("error", (e) => {
        if (e.target.tagName === "IMG" && !e.target.dataset.fallbackApplied) {
            e.target.dataset.fallbackApplied = "true";
            const parent = e.target.parentElement;
            const h = e.target.style.height || e.target.getAttribute("height") || "100%";
            const emoji = getEmojiForAlt(e.target.alt);
            const fallback = document.createElement("div");
            fallback.className = "img-fallback w-full h-full";
            fallback.style.height = h;
            fallback.textContent = emoji;
            if (parent) {
                parent.replaceChild(fallback, e.target);
            }
        }
    }, true);
}

function getEmojiForAlt(alt) {
    if (!alt) return "🍽️";
    const a = alt.toLowerCase();
    if (a.includes("coffee") || a.includes("brew") || a.includes("latte") || a.includes("espresso") || a.includes("cappuccino")) return "☕";
    if (a.includes("pizza")) return "🍕";
    if (a.includes("pasta") || a.includes("penne") || a.includes("spaghetti") || a.includes("ravioli")) return "🍝";
    if (a.includes("cake") || a.includes("dessert") || a.includes("tiramisu") || a.includes("crumble") || a.includes("cheesecake")) return "🍰";
    if (a.includes("tea") || a.includes("cooler") || a.includes("smoothie") || a.includes("shake") || a.includes("matcha") || a.includes("soda")) return "🧊";
    if (a.includes("fries") || a.includes("bruschetta") || a.includes("starter") || a.includes("popper") || a.includes("bread")) return "🥗";
    if (a.includes("interior") || a.includes("dining") || a.includes("café") || a.includes("outlet")) return "🏡";
    return "🍽️";
}

// ─── SOUND DESIGN ────────────────────────────
function playSound(type) {
    const ctx = getAudioCtx();
    if (!ctx) return;
    try {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        if (type === "order") {
            oscillator.type = "sine";
            oscillator.frequency.setValueAtTime(830, ctx.currentTime);
            oscillator.frequency.setValueAtTime(1060, ctx.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(830, ctx.currentTime + 0.2);
            gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.5);
        } else if (type === "urgent") {
            oscillator.type = "sine";
            oscillator.frequency.setValueAtTime(1200, ctx.currentTime);
            oscillator.frequency.setValueAtTime(800, ctx.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(1200, ctx.currentTime + 0.2);
            oscillator.frequency.setValueAtTime(800, ctx.currentTime + 0.3);
            gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.6);
        } else {
            oscillator.type = "sine";
            oscillator.frequency.setValueAtTime(523, ctx.currentTime);
            oscillator.frequency.setValueAtTime(659, ctx.currentTime + 0.15);
            oscillator.frequency.setValueAtTime(784, ctx.currentTime + 0.3);
            gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.6);
        }
    } catch(e) {}
}

// ─── MENU DATA ───────────────────────────────
const categoryIcons = {
    signatures: "☕",
    coolers: "🧊",
    pasta: "🍝",
    pizza: "🍕",
    starters: "🥗",
    desserts: "🍰",
    coffee: "☕",
    snacks: "🥪",
    beverages: "🧊"
};

const categoryLabels = {
    signatures: "Signature Brews",
    coolers: "Ice Cold Coolers",
    pasta: "Handcrafted Pasta",
    pizza: "Stone-Baked Pizza",
    starters: "Small Plates",
    desserts: "Sweet Endings"
};

// Fallback menu with Diggin branding
const fallbackMenu = {
    signatures: [
        { id: "sig1", name: "Velvet Cold Brew", price: 295, description: "Slow-steeped 18-hour cold brew, silky smooth with a hint of dark chocolate.", image: "images/img_b535fa02.jpg", tag: "Chef's Pick" },
        { id: "sig2", name: "Caramel Whisper Latte", price: 345, description: "House-pulled espresso swirled with handmade caramel and steamed milk.", image: "images/img_df98358e.jpg", tag: "Trending" },
        { id: "sig3", name: "Midnight Espresso", price: 225, description: "Double-shot single-origin espresso — bold, unapologetic, unforgettable.", image: "images/img_bfecd83a.jpg" },
        { id: "sig4", name: "Hazelnut Dream Cappuccino", price: 325, description: "Velvety foam kissed with roasted hazelnut and a dusting of cocoa.", image: "images/img_49e4bd24.jpg", tag: "Instagram Favorite" }
    ],
    coolers: [
        { id: "cool1", name: "Sunset Citrus Iced Tea", price: 245, description: "Blood orange and passion fruit iced tea that tastes like golden hour.", image: "images/img_dc1a67d7.jpg", tag: "Instagram Favorite" },
        { id: "cool2", name: "Berry Blush Smoothie", price: 295, description: "Mixed berries blended thick with Greek yogurt and a honey drizzle.", image: "images/img_fd4405fb.jpg", tag: "Trending" }
    ],
    pasta: [
        { id: "p1", name: "Spaghetti Carbonara", price: 475, description: "Creamy egg-based sauce with crispy pancetta — the Roman original.", image: "images/img_753245ea.jpg", tag: "Chef's Pick" },
        { id: "p2", name: "Garden Herb Penne", price: 425, description: "Fresh basil, thyme, and roasted garlic tossed in olive oil and parmesan.", image: "images/img_2d443949.jpg", tag: "Instagram Favorite" }
    ],
    desserts: [
        { id: "d1", name: "Lotus Biscoff Cheesecake", price: 345, description: "Creamy cheesecake on a Biscoff crust, drizzled with caramelized cookie butter.", image: "images/biscoff.png", tag: "Trending" },
        { id: "d2", name: "Tiramisu Royale", price: 385, description: "Layers of espresso-soaked ladyfingers and mascarpone — Italian heaven.", image: "images/img_366b5c0f.jpg", tag: "Chef's Pick" }
    ]
};

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

    if (loading) loading.classList.add("hidden");
    if (error) error.classList.add("hidden");
    if (container) container.classList.remove("hidden");
    renderMenu(data, container);
}

function renderMenu(data, container) {
    // Peak time indicator
    const pendingCount = parseInt(sessionStorage.getItem("pending_orders") || "0");
    if (pendingCount > 5) {
        const peakBadge = document.createElement("div");
        peakBadge.className = "flex justify-center mb-10 scroll-reveal";
        peakBadge.innerHTML = `<span class="peak-badge">🔥 High demand right now — orders may take a bit longer</span>`;
        container.appendChild(peakBadge);
    }

    // Search bar
    const searchWrap = document.createElement("div");
    searchWrap.className = "mb-8 scroll-reveal";
    searchWrap.innerHTML = `
        <div class="relative max-w-md">
            <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cafe-muted/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input type="text" id="menu-search" placeholder="Search the menu..." class="w-full bg-cafe-card border border-white/[0.06] rounded-xl pl-12 pr-5 py-3.5 text-cafe-text text-sm focus:outline-none focus:border-cafe-accent/60 transition-colors placeholder-cafe-muted/40">
        </div>
    `;
    container.appendChild(searchWrap);

    // Category filter tabs
    const filterWrap = document.createElement("div");
    filterWrap.className = "flex flex-wrap items-center gap-2 sm:gap-3 mb-14 scroll-reveal";
    const categories = Object.keys(data);
    filterWrap.innerHTML = `
        <button class="category-filter active px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-[0.1em] transition-all duration-300 bg-cafe-accent text-white" data-cat="all">All</button>
        ${categories.map(cat => `
            <button class="category-filter px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-[0.1em] transition-all duration-300 bg-white/[0.04] text-cafe-muted hover:bg-cafe-accent/20 hover:text-cafe-accent border border-white/[0.06]" data-cat="${cat}">
                ${categoryIcons[cat] || "🍽️"} ${categoryLabels[cat] || cat}
            </button>
        `).join("")}
    `;
    container.appendChild(filterWrap);

    // Search functionality with debounce
    const searchInput = document.getElementById("menu-search");
    let searchTimer;
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            clearTimeout(searchTimer);
            searchTimer = setTimeout(() => {
                const query = e.target.value.toLowerCase().trim();
                container.querySelectorAll(".menu-item-card").forEach(card => {
                    const name = card.dataset.name || "";
                    const desc = card.dataset.desc || "";
                    const match = !query || name.includes(query) || desc.includes(query);
                    card.style.display = match ? "" : "none";
                });
                // Show/hide category sections that have no visible items
                container.querySelectorAll(".menu-category-section").forEach(sec => {
                    const visibleCards = sec.querySelectorAll('.menu-item-card:not([style*="display: none"])');
                    sec.style.display = (query && visibleCards.length === 0) ? "none" : "";
                });
            }, 200);
        });
    }

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
            // Clear search when changing category
            if (searchInput) searchInput.value = "";
        });
    });

    for (const [category, items] of Object.entries(data)) {
        const section = document.createElement("section");
        section.className = "menu-category-section scroll-reveal";
        section.dataset.category = category;

        const header = document.createElement("div");
        header.className = "flex items-center gap-4 mb-10";
        header.innerHTML = `
            <span class="text-3xl">${categoryIcons[category] || "🍽️"}</span>
            <h2 class="text-2xl sm:text-3xl md:text-4xl font-serif italic text-cafe-text capitalize">${categoryLabels[category] || category}</h2>
            <div class="flex-grow h-px bg-white/[0.06] ml-4"></div>
        `;
        section.appendChild(header);

        const grid = document.createElement("div");
        grid.className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 stagger-children";

        items.forEach(item => {
            grid.appendChild(createMenuCard(item));
        });

        section.appendChild(grid);
        container.appendChild(section);
    }

    // Smart Recommendations section
    if (cart.length > 0) {
        renderRecommendations(data, container);
    }

    // Re-init scroll animations for new elements
    initScrollAnimations();
}

function createMenuCard(item) {
    const card = document.createElement("div");
    card.className = "menu-item-card bg-cafe-bg rounded-2xl overflow-hidden border border-white/[0.04] flex flex-col group transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)] hover:border-cafe-accent/20 img-zoom scroll-reveal";
    card.dataset.name = item.name.toLowerCase();
    card.dataset.desc = (item.description || "").toLowerCase();

    const tagColors = {
        "Chef's Pick": "bg-cafe-accent/90",
        "Trending": "bg-rose-500/90",
        "Instagram Favorite": "bg-violet-500/90",
        "Popular": "bg-cafe-accent/90",
        "Best Seller": "bg-red-500/90"
    };
    const tagClass = item.tag ? (tagColors[item.tag] || "bg-emerald-500/90") : "";
    const badgeHTML = item.tag
        ? `<span class="absolute top-4 left-4 ${tagClass} text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest backdrop-blur-sm shadow-lg z-10">${item.tag}</span>`
        : "";

    // Sanitize item name for onclick
    const safeName = item.name.replace(/'/g, "\\'").replace(/"/g, "&quot;");

    // Optimize image URL with width param
    let imgSrc = item.image;
    if (imgSrc && imgSrc.includes('unsplash.com') && !imgSrc.includes('&w=')) {
        imgSrc += '&w=600';
    }

    card.innerHTML = `
        <div class="relative h-48 sm:h-52 md:h-56 w-full overflow-hidden">
            ${badgeHTML}
            <img src="${imgSrc}" alt="${item.name}" loading="lazy" class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" onerror="this.parentElement.innerHTML='<div class=\\'img-fallback w-full h-full absolute inset-0\\'>🍽️</div>'">
            <div class="absolute inset-0 bg-gradient-to-t from-cafe-bg via-cafe-bg/20 to-transparent"></div>
        </div>
        <div class="p-5 sm:p-6 md:p-7 flex-grow flex flex-col">
            <div class="flex justify-between items-start mb-3">
                <h3 class="text-base sm:text-lg font-bold text-cafe-text tracking-tight leading-snug pr-3">${item.name}</h3>
                <span class="text-lg sm:text-xl font-bold text-cafe-accent whitespace-nowrap">₹${item.price}</span>
            </div>
            <p class="text-cafe-muted text-sm font-light leading-relaxed mb-5 sm:mb-6 flex-grow">${item.description}</p>
            <button onclick="addToCart('${item.id}', '${safeName}', ${item.price}, this)" class="btn-press w-full py-3 sm:py-3.5 bg-white/[0.04] hover:bg-cafe-accent text-center text-[12px] sm:text-[13px] font-bold tracking-[0.12em] uppercase rounded-xl transition-all duration-300 border border-white/[0.06] hover:border-transparent text-cafe-text hover:text-white mt-auto flex items-center justify-center gap-2 shadow-sm hover:shadow-[0_4px_20px_rgba(200,135,58,0.25)]">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                Add to Order
            </button>
        </div>
    `;
    return card;
}

// ─── SMART RECOMMENDATIONS ───────────────────
function renderRecommendations(menuData, container) {
    const cartIds = cart.map(c => c.id);
    const allItems = [];
    for (const items of Object.values(menuData)) {
        items.forEach(item => {
            if (!cartIds.includes(item.id)) {
                allItems.push(item);
            }
        });
    }

    const shuffled = allItems.sort(() => 0.5 - Math.random()).slice(0, 3);
    if (shuffled.length === 0) return;

    const recoSection = document.createElement("div");
    recoSection.className = "mt-16 scroll-reveal";
    recoSection.innerHTML = `
        <div class="flex items-center gap-3 mb-6">
            <span class="text-xl">✨</span>
            <h3 class="text-xl font-serif italic text-cafe-text">People also ordered</h3>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            ${shuffled.map(item => {
                const safeName = item.name.replace(/'/g, "\\'").replace(/"/g, "&quot;");
                return `
                <div class="reco-card" onclick="addToCart('${item.id}', '${safeName}', ${item.price})">
                    <img src="${item.image}" alt="${item.name}" class="w-14 h-14 rounded-xl object-cover flex-shrink-0" loading="lazy">
                    <div class="flex-grow min-w-0">
                        <div class="text-cafe-text font-bold text-sm truncate">${item.name}</div>
                        <div class="text-cafe-accent font-bold text-sm">₹${item.price}</div>
                    </div>
                    <svg class="w-5 h-5 text-cafe-accent flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                </div>
            `}).join("")}
        </div>
    `;
    container.appendChild(recoSection);
}

// ─── CART LOGIC ──────────────────────────────
window.addToCart = function (id, name, price, btnEl) {
    const existing = cart.find(c => c.id === id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ id, name, price, quantity: 1 });
    }
    saveCart();

    // Fly-to-cart animation
    if (btnEl) {
        const ghost = document.createElement("div");
        ghost.className = "fly-to-cart";
        ghost.textContent = "+" + (existing ? existing.quantity : 1);
        ghost.style.cssText = `
            font-size: 14px; font-weight: 700; color: white;
            background: var(--accent, #c8873a); padding: 8px 16px;
            border-radius: 999px; box-shadow: 0 4px 12px rgba(200,135,58,0.4);
        `;
        const rect = btnEl.getBoundingClientRect();
        ghost.style.left = rect.left + rect.width / 2 - 20 + "px";
        ghost.style.top = rect.top + "px";
        document.body.appendChild(ghost);
        setTimeout(() => ghost.remove(), 700);
    }

    // Pulse tray
    const tray = document.getElementById("order-tray");
    if (tray) {
        tray.classList.remove("tray-pulse");
        void tray.offsetWidth;
        tray.classList.add("tray-pulse");
    }

    playSound("order");
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
        toast.className = "fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] bg-cafe-card border border-cafe-accent/30 text-cafe-text px-6 py-3 rounded-xl shadow-2xl text-sm font-semibold transition-all duration-500 opacity-0 translate-y-4 pointer-events-none backdrop-blur-xl";
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.remove("opacity-0", "translate-y-4");
    toast.classList.add("opacity-100", "translate-y-0");
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
        toast.classList.add("opacity-0", "translate-y-4");
        toast.classList.remove("opacity-100", "translate-y-0");
    }, 2500);
}

// Show notification toast (top-right, for chef/cashier)
window.showNotificationToast = function(msg, urgent) {
    const toast = document.createElement("div");
    toast.className = `notification-toast ${urgent ? "urgent" : ""}`;
    toast.innerHTML = `
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${urgent ? "bg-red-500/20 text-red-400" : "bg-cafe-accent/20 text-cafe-accent"}">
                ${urgent ? "🔔" : "📦"}
            </div>
            <div>
                <div class="text-cafe-text font-bold text-sm">${msg}</div>
                <div class="text-cafe-muted text-xs mt-0.5">Just now</div>
            </div>
        </div>
    `;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("show"));
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 600);
    }, 5000);
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
                <p class="text-cafe-muted/50 text-sm mt-2">Add items from the menu to get started</p>
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
            row.className = "flex justify-between items-center mb-4 p-4 bg-cafe-card rounded-xl border border-white/[0.04] transition-all duration-300 hover:border-cafe-accent/10";
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
    tray.className = "fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] bg-cafe-card/95 backdrop-blur-xl border border-cafe-accent/30 rounded-2xl px-4 sm:px-5 py-3 shadow-[0_8px_40px_rgba(0,0,0,0.5)] flex items-center gap-3 sm:gap-4 transition-all duration-500 translate-y-full opacity-0 pointer-events-none hover:border-cafe-accent/60 hover:shadow-[0_12px_50px_rgba(200,135,58,0.15)]";
    tray.innerHTML = `
        <div id="tray-cart-section" class="flex items-center gap-3 cursor-pointer" id="tray-cart-click">
            <div class="w-9 h-9 bg-cafe-accent/15 rounded-xl flex items-center justify-center border border-cafe-accent/20 flex-shrink-0">
                <svg class="w-4 h-4 text-cafe-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3C7.03 3 3 5.69 3 9h18c0-3.31-4.03-6-9-6z"/><path stroke-linecap="round" stroke-linejoin="round" d="M3 9v1a1 1 0 001 1h16a1 1 0 001-1V9"/><path stroke-linecap="round" stroke-linejoin="round" d="M5 11v6a2 2 0 002 2h10a2 2 0 002-2v-6"/></svg>
            </div>
            <div>
                <div class="text-cafe-text font-bold text-sm"><span id="tray-count">0</span> items</div>
                <div class="text-cafe-accent font-bold text-base" id="tray-total">₹0</div>
            </div>
        </div>

        <!-- Live order progress section (hidden until order placed) -->
        <div id="tray-order-section" class="hidden items-center gap-3 border-l border-white/[0.08] pl-3">
            <div class="flex flex-col gap-1">
                <div class="flex items-center gap-2">
                    <span class="text-[10px] font-bold text-cafe-accent uppercase tracking-widest">Live Order</span>
                    <span id="tray-order-status" class="text-[10px] font-bold text-cafe-muted">⏳ Pending</span>
                </div>
                <div class="tray-tracker">
                    <div class="mini-progress">
                        <div class="mini-progress-fill" id="tray-mini-progress" style="width: 10%"></div>
                    </div>
                </div>
            </div>
            <div id="tray-timer-wrap" class="hidden flex-col items-center">
                <span class="text-[9px] text-cafe-muted uppercase font-bold">Chef</span>
                <span id="tray-timer" class="tray-timer">--:--</span>
            </div>
        </div>

        <div class="w-px h-8 bg-white/[0.08] flex-shrink-0"></div>
        <div class="text-cafe-text text-[10px] font-bold uppercase tracking-[0.15em] flex items-center gap-1.5 cursor-pointer flex-shrink-0" id="tray-view-btn">
            View
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
        </div>
    `;
    document.body.appendChild(tray);

    // Cart section opens cart drawer
    tray.addEventListener("click", (e) => {
        const orderSection = document.getElementById("tray-order-section");
        const isTracking = orderSection && !orderSection.classList.contains("hidden");
        
        if (isTracking) {
            // Open tracking screen
            const ss = document.getElementById("success-screen");
            if (ss) ss.classList.add("open");
        } else {
            renderCartItems();
            document.getElementById("cart-slider")?.classList.add("open");
            document.getElementById("cart-backdrop")?.classList.add("open");
        }
    });
}

// ─── CART DRAWER ────────────────────────────
function injectCartDrawer() {
    const toggles = document.querySelectorAll("#cart-toggle");

    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
        <div id="cart-backdrop" class="cart-backdrop fixed inset-0 z-40 bg-black/70 backdrop-blur-sm cursor-pointer"></div>
        <div id="cart-slider" class="cart-slider fixed top-0 right-0 h-full w-full sm:w-[420px] bg-cafe-bg z-50 shadow-2xl flex flex-col border-l border-white/[0.06]">
            <div class="px-6 sm:px-7 py-5 sm:py-6 border-b border-white/[0.04] flex justify-between items-center bg-cafe-bg">
                <h2 class="text-xl sm:text-2xl font-serif italic text-cafe-text">Your Order</h2>
                <button id="close-cart" class="p-2 text-cafe-muted hover:text-cafe-text bg-white/[0.04] hover:bg-white/[0.08] rounded-full transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
            <div class="px-6 sm:px-7 py-5 sm:py-6 flex-grow overflow-y-auto" id="cart-items-container"></div>
            <div class="px-6 sm:px-7 py-5 sm:py-6 border-t border-white/[0.04] bg-cafe-card">
                <div class="flex justify-between items-center mb-5 sm:mb-6">
                    <span class="text-cafe-muted text-xs font-bold uppercase tracking-[0.2em]">Estimated Total</span>
                    <span id="cart-total" class="text-2xl sm:text-3xl font-bold text-cafe-accent tracking-tight">₹0</span>
                </div>
                <button id="checkout-btn" class="btn-press w-full py-3.5 sm:py-4 bg-cafe-accent hover:bg-cafe-accentHover text-white font-bold uppercase tracking-[0.12em] rounded-xl transition-all shadow-lg hover:shadow-[0_8px_30px_rgba(200,135,58,0.25)] flex justify-center items-center gap-2.5 text-sm">
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
    const qrTable = getQRTable();
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
        <div id="checkout-overlay" class="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div class="absolute inset-0 bg-black/85 backdrop-blur-md" id="checkout-bg"></div>
            <div class="relative bg-cafe-bg border border-white/[0.08] rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-10 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
                <button id="close-checkout" class="absolute top-4 sm:top-6 right-4 sm:right-6 p-2 text-cafe-muted hover:text-cafe-text bg-white/[0.04] hover:bg-white/[0.08] rounded-full transition-colors z-10">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                <div class="flex items-center gap-3 mb-2">
                    <div class="w-8 h-px bg-cafe-accent"></div>
                    <span class="text-cafe-accent text-xs font-bold uppercase tracking-[0.3em]">Checkout</span>
                </div>
                <h2 class="text-2xl sm:text-3xl font-serif italic text-cafe-text mb-2">Almost There</h2>
                <p class="text-cafe-muted text-sm font-light mb-6 sm:mb-8">Just your name and table number.</p>
                <div id="checkout-summary" class="mb-6 p-4 bg-cafe-card rounded-xl border border-white/[0.04] max-h-32 overflow-y-auto"></div>
                <form id="checkout-form" class="space-y-5 sm:space-y-6">
                    <div>
                        <label class="block text-[11px] font-bold text-cafe-muted uppercase tracking-[0.2em] mb-2.5">Your Name</label>
                        <input type="text" id="cust-name" required class="w-full bg-cafe-card border border-white/[0.06] rounded-xl px-5 py-3.5 sm:py-4 text-cafe-text text-base focus:outline-none focus:border-cafe-accent/60 transition-colors placeholder-cafe-muted/40" placeholder="e.g. Riya">
                    </div>
                    <div>
                        <label class="block text-[11px] font-bold text-cafe-muted uppercase tracking-[0.2em] mb-2.5">Table Number ${qrTable ? '<span class="text-cafe-accent normal-case">(auto-filled via QR)</span>' : ''}</label>
                        <input type="number" id="table-number" min="1" max="99" required value="${qrTable}" class="w-full bg-cafe-card border border-white/[0.06] rounded-xl px-5 py-3.5 sm:py-4 text-cafe-text text-base focus:outline-none focus:border-cafe-accent/60 transition-colors placeholder-cafe-muted/40" placeholder="e.g. 5">
                    </div>
                    <div class="flex justify-between items-center p-4 bg-cafe-accent/10 rounded-xl border border-cafe-accent/20">
                        <span class="text-cafe-muted text-sm font-bold uppercase tracking-wider">Total</span>
                        <span id="checkout-total" class="text-xl sm:text-2xl font-bold text-cafe-accent">₹0</span>
                    </div>
                    <button type="submit" id="submit-order-btn" class="btn-press w-full py-3.5 sm:py-4 mt-2 bg-cafe-accent hover:bg-cafe-accentHover text-white font-bold uppercase tracking-[0.12em] rounded-xl transition-all shadow-lg hover:shadow-[0_8px_30px_rgba(200,135,58,0.25)] text-sm flex items-center justify-center gap-2">
                        Confirm Order
                    </button>
                </form>
            </div>
        </div>

        <!-- Success Screen -->
        <div id="success-screen" class="modal-overlay fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
            <div class="absolute inset-0 bg-black/90 backdrop-blur-lg"></div>
            <div class="relative bg-cafe-bg border border-white/[0.08] rounded-[1.5rem] sm:rounded-[2rem] p-8 sm:p-10 w-full max-w-sm shadow-2xl text-center">
                <div class="success-check w-20 h-20 mx-auto bg-green-500/15 rounded-full flex items-center justify-center mb-6 border-2 border-green-500/30">
                    <svg class="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h2 class="text-2xl font-serif italic text-cafe-text mb-3">Order Placed!</h2>
                <p class="text-cafe-muted text-sm font-light mb-8">Your food is being prepared with love. Sit back and relax.</p>
                <div id="success-tracker" class="mb-8"></div>
                <button id="close-success" class="w-full py-3.5 bg-white/[0.04] border border-white/[0.06] text-cafe-text font-bold uppercase tracking-[0.12em] rounded-xl transition-all hover:bg-cafe-accent hover:text-white hover:border-transparent text-sm">
                    Back to Menu
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(wrapper);

    const overlay = document.getElementById("checkout-overlay");
    const successScreen = document.getElementById("success-screen");
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
            // Autofill table from QR
            const tableInput = document.getElementById("table-number");
            const qr = getQRTable();
            if (qr && !tableInput.value) tableInput.value = qr;
        }
    });
    observer.observe(overlay, { attributes: true, attributeFilter: ["class"] });

    document.getElementById("close-checkout").addEventListener("click", closeOverlay);
    document.getElementById("checkout-bg").addEventListener("click", closeOverlay);

    document.getElementById("close-success")?.addEventListener("click", () => {
        successScreen.classList.remove("open");
        // Clean up polling
        if (_pollInterval) { clearInterval(_pollInterval); _pollInterval = null; }
    });

    document.getElementById("checkout-form").addEventListener("submit", async (e) => {
        e.preventDefault();

        const btn = document.getElementById("submit-order-btn");
        const custName = document.getElementById("cust-name").value.trim();
        const tableNum = document.getElementById("table-number").value.trim();

        if (!custName || !tableNum) {
            showMiniToast("Please fill in all fields");
            return;
        }

        const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

        btn.disabled = true;
        btn.innerHTML = `<span class="spinner"></span> Placing Order...`;

        const orderData = {
            table_number: tableNum,
            customer_name: custName,
            items: cart.map(i => ({ name: i.name, price: i.price, quantity: i.quantity })),
            total: total,
            status: "pending"
        };

        try {
            if (typeof insertOrder === "function") {
                const result = await insertOrder(orderData);
                if (result && result.id) {
                    activeOrderId = result.id;
                    sessionStorage.setItem("active_order_id", result.id);
                }
            } else {
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

            cart = [];
            saveCart();
            closeOverlay();

            playSound("success");

            // Show success screen with animated progress tracker
            const tracker = document.getElementById("success-tracker");
            if (tracker) {
                tracker.innerHTML = `
                    <div class="progress-tracker">
                        <div class="progress-bar-track">
                            <div class="progress-bar-fill" id="progress-fill" style="width: 0%"></div>
                        </div>
                        <div class="status-tracker">
                            <div class="status-tracker-step active">
                                <span class="status-tracker-dot">📦</span>
                                <span class="status-tracker-label">Placed</span>
                            </div>
                            <div class="status-tracker-step">
                                <span class="status-tracker-dot">👨‍🍳</span>
                                <span class="status-tracker-label">Preparing</span>
                            </div>
                            <div class="status-tracker-step">
                                <span class="status-tracker-dot">✅</span>
                                <span class="status-tracker-label">Ready</span>
                            </div>
                            <div class="status-tracker-step">
                                <span class="status-tracker-dot">🚀</span>
                                <span class="status-tracker-label">Arriving</span>
                            </div>
                        </div>
                    </div>
                `;
                // Animate initial state
                setTimeout(() => {
                    const fill = document.getElementById("progress-fill");
                    if (fill) fill.style.width = "10%";
                }, 300);
            }
            successScreen.classList.add("open");

            // Start real-time tracking (prefer Supabase subscription, fall back to polling)
            if (_pollInterval) clearInterval(_pollInterval);
            if (_orderSubscription) {
                try { supabase?.removeChannel(_orderSubscription); } catch(e) {}
                _orderSubscription = null;
            }
            if (activeOrderId) {
                startOrderTracking(activeOrderId);
            }

        } catch (err) {
            console.error("Order failed:", err);
            showMiniToast("Failed to place order. Please try again.");
        } finally {
            btn.disabled = false;
            btn.innerHTML = `Confirm Order`;
            e.target.reset();
            // Restore QR table value
            const qr = getQRTable();
            if (qr) document.getElementById("table-number").value = qr;
        }
    });
}

// ─── ORDER TRACKING (Real-time + Fallback Polling) ────
let _orderSubscription = null;

function updateTrackerUI(status, eta = null, timerEnd = null) {
    const progressMap = {
        pending:   { active: 0, fill: "10%",  label: "⏳ Pending...",      trayLabel: "⏳ Pending" },
        preparing: { active: 1, fill: "40%",  label: "👨‍🍳 Preparing...",  trayLabel: "👨‍🍳 Preparing" },
        ready:     { active: 2, fill: "72%",  label: "✅ Ready!",           trayLabel: "✅ Ready!" },
        paid:      { active: 3, fill: "100%", label: "🍽️ Delivered!",      trayLabel: "🍽️ Delivered" }
    };
    const state = progressMap[status] || progressMap.pending;

    // Update success screen tracker if visible
    const tracker = document.getElementById("success-tracker");
    if (tracker) {
        const steps = tracker.querySelectorAll(".status-tracker-step");
        const fill = document.getElementById("progress-fill");
        if (steps.length >= 4) {
            steps.forEach(s => s.classList.remove("active", "completed"));
            for (let i = 0; i < state.active; i++) steps[i].classList.add("completed");
            steps[state.active]?.classList.add("active");
            if (fill) fill.style.width = state.fill;
        }
    }

    // Update floating tray order section
    const trayOrderSection = document.getElementById("tray-order-section");
    const trayStatus = document.getElementById("tray-order-status");
    const trayProgress = document.getElementById("tray-mini-progress");
    const trayTimerWrap = document.getElementById("tray-timer-wrap");
    const trayTimer = document.getElementById("tray-timer");
    const tray = document.getElementById("order-tray");

    if (trayOrderSection && status !== 'paid') {
        // Show order tracking section in tray
        trayOrderSection.classList.remove("hidden");
        trayOrderSection.classList.add("flex");
        if (trayStatus) trayStatus.textContent = state.trayLabel;
        if (trayProgress) trayProgress.style.width = state.fill;
        
        // Show/start chef timer countdown
        if (timerEnd && status === 'preparing') {
            if (trayTimerWrap) { trayTimerWrap.classList.remove("hidden"); trayTimerWrap.classList.add("flex"); }
            // Start countdown for tray
            if (window._trayTimerInterval) clearInterval(window._trayTimerInterval);
            const updateTrayTimer = () => {
                const now = Date.now();
                const end = new Date(timerEnd).getTime();
                const diff = end - now;
                if (!document.getElementById('tray-timer')) { clearInterval(window._trayTimerInterval); return; }
                if (diff <= 0) {
                    if (trayTimer) { trayTimer.textContent = 'DONE'; trayTimer.style.color = '#22c55e'; }
                    clearInterval(window._trayTimerInterval);
                    return;
                }
                const mins = Math.floor(diff / 60000);
                const secs = Math.floor((diff % 60000) / 1000);
                if (trayTimer) trayTimer.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
            };
            updateTrayTimer();
            window._trayTimerInterval = setInterval(updateTrayTimer, 1000);
        } else {
            if (trayTimerWrap) { trayTimerWrap.classList.add("hidden"); trayTimerWrap.classList.remove("flex"); }
            if (window._trayTimerInterval) { clearInterval(window._trayTimerInterval); window._trayTimerInterval = null; }
        }

        // Keep tray visible when tracking
        if (tray) {
            tray.classList.remove("translate-y-full", "opacity-0", "pointer-events-none");
            tray.classList.add("translate-y-0", "opacity-100");
        }
    } else if (trayOrderSection && status === 'paid') {
        // Order paid — hide tracker, allow normal cart tray behavior
        setTimeout(() => {
            trayOrderSection.classList.add("hidden");
            trayOrderSection.classList.remove("flex");
            sessionStorage.removeItem("active_order_id");
            activeOrderId = null;
        }, 5000); // Linger for 5s then disappear
    }

    // Update floating tracker widget (old one)
    const floatingStatus = document.getElementById("floating-status");
    if (floatingStatus) floatingStatus.textContent = state.label;
    const floatingProgress = document.getElementById("floating-progress");
    if (floatingProgress) floatingProgress.style.width = state.fill;

    // Sound + toast on ready/paid
    if (status === "ready") {
        playSound("success");
        showMiniToast("Your order is ready! 🎉");
    }
    if (status === "paid") {
        clearInterval(_pollInterval); _pollInterval = null;
    }
}

function startOrderTracking(orderId) {
    if (!orderId) return;

    // Try Supabase real-time subscription first
    if (typeof subscribeToOrders === "function") {
        _orderSubscription = subscribeToOrders((payload) => {
            if (payload.new && payload.new.id === orderId) {
                const o = payload.new;
                updateTrackerUI(o.status, o.eta, o.timer_end);
                if (o.status === "ready" || o.status === "paid") {
                    setTimeout(() => {
                        try { supabase?.removeChannel(_orderSubscription); } catch(e) {}
                        _orderSubscription = null;
                    }, 60000);
                }
            }
        });
    }

    // Immediate fetch to get current state (in case order was updated while page was closed)
    if (typeof fetchOrderById === "function") {
        fetchOrderById(orderId).then(order => {
            if (order) updateTrackerUI(order.status, order.eta, order.timer_end);
        }).catch(() => {});
    }

    // Poll as fallback (slower since we have realtime)
    _pollInterval = setInterval(async () => {
        try {
            if (typeof fetchOrderById === "function") {
                const order = await fetchOrderById(orderId);
                if (!order) { clearInterval(_pollInterval); _pollInterval = null; return; }
                updateTrackerUI(order.status, order.eta, order.timer_end);
                if (order.status === "paid") { clearInterval(_pollInterval); _pollInterval = null; }
            }
        } catch (e) {}
    }, 8000);
}

// ─── ORDER TRACKER WIDGET ────────────────────
function injectOrderTracker() {
    if (!activeOrderId) return;
    
    // Show the persistent tray tracking section
    const trayOrderSection = document.getElementById("tray-order-section");
    const tray = document.getElementById("order-tray");
    if (trayOrderSection) {
        trayOrderSection.classList.remove("hidden");
        trayOrderSection.classList.add("flex");
    }
    if (tray) {
        tray.classList.remove("translate-y-full", "opacity-0", "pointer-events-none");
        tray.classList.add("translate-y-0", "opacity-100");
    }

    // Start tracking
    startOrderTracking(activeOrderId);
}

// ─── CALL WAITER ─────────────────────────────
function injectCallWaiterBtn() {
    const btn = document.createElement("button");
    btn.id = "call-waiter-btn";
    btn.className = "fixed bottom-6 right-6 z-[80] w-12 h-12 sm:w-14 sm:h-14 bg-cafe-accent hover:bg-cafe-accentHover text-white rounded-full shadow-[0_8px_30px_rgba(200,135,58,0.3)] flex items-center justify-center transition-all duration-300 hover:scale-110 group";
    btn.title = "Call Waiter";
    btn.setAttribute("aria-label", "Call waiter");
    btn.innerHTML = `<svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>`;
    document.body.appendChild(btn);

    const modal = document.createElement("div");
    modal.id = "call-waiter-modal";
    modal.className = "modal-overlay fixed inset-0 z-[95] flex items-center justify-center p-4 sm:p-6";
    const qrTable = getQRTable();
    modal.innerHTML = `
        <div class="absolute inset-0 bg-black/85 backdrop-blur-md call-waiter-bg"></div>
        <div class="relative bg-cafe-bg border border-white/[0.08] rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-10 w-full max-w-sm shadow-2xl text-center">
            <div class="w-14 h-14 sm:w-16 sm:h-16 mx-auto bg-cafe-accent/10 text-cafe-accent rounded-2xl flex items-center justify-center mb-5 sm:mb-6 border border-cafe-accent/15">
                <svg class="w-7 h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            </div>
            <h3 class="text-xl sm:text-2xl font-serif italic text-cafe-text mb-2">Need Assistance?</h3>
            <p class="text-cafe-muted text-sm font-light mb-5 sm:mb-6">We'll send someone to your table right away.</p>
            <form id="call-waiter-form" class="space-y-4">
                <input type="number" id="call-table" min="1" max="99" required value="${qrTable}" class="w-full bg-cafe-card border border-white/[0.06] rounded-xl px-5 py-3.5 sm:py-4 text-cafe-text text-center text-lg focus:outline-none focus:border-cafe-accent/60 transition-colors placeholder-cafe-muted/40" placeholder="Table #">
                <select id="call-type" class="w-full bg-cafe-card border border-white/[0.06] rounded-xl px-5 py-3.5 sm:py-4 text-cafe-text text-base focus:outline-none focus:border-cafe-accent/60 transition-colors">
                    <option value="waiter">Call Waiter</option>
                    <option value="water">Need Water</option>
                    <option value="bill">Request Bill</option>
                    <option value="help">Need Help</option>
                </select>
                <button type="submit" id="call-submit-btn" class="btn-press w-full py-3.5 sm:py-4 bg-cafe-accent hover:bg-cafe-accentHover text-white font-bold uppercase tracking-[0.12em] rounded-xl transition-all shadow-lg text-sm flex items-center justify-center gap-2">
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
        const tableInput = document.getElementById("call-table");
        const table = tableInput.value.trim();
        const type = document.getElementById("call-type").value;
        const submitBtn = document.getElementById("call-submit-btn");

        if (!table) {
            showMiniToast("Please enter your table number");
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="spinner"></span> Sending...`;

        try {
            if (typeof insertCall === "function") {
                await insertCall({
                    table_number: table,
                    type: type,
                    status: "active"
                });
            }
            modal.classList.remove("open");
            playSound("urgent");
            showMiniToast("Staff has been notified! 🔔");
        } catch (err) {
            showMiniToast("Failed to send request. Try again.");
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `Send Request`;
            // Only reset the select, keep the table number
            document.getElementById("call-type").value = "waiter";
        }
    });
}
