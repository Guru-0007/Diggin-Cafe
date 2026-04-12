document.addEventListener("DOMContentLoaded", () => {
    // Intro Video Experience Logic
    const enterBtn = document.getElementById("enter-btn");
    const introScreen = document.getElementById("intro-screen");
    
    if (enterBtn && introScreen) {
        enterBtn.addEventListener("click", () => {
            introScreen.style.opacity = '0';
            setTimeout(() => {
                introScreen.style.display = 'none';
            }, 1000);
        });
    }

    // Inject UI elements
    injectCartUI();
    injectCheckoutModal();

    // Init Cart
    updateCartCount();

    // Menu logic
    if (document.getElementById("menu-container")) {
        fetchMenuData();
    }
});

// --- STATE ---
let cart = JSON.parse(localStorage.getItem("cafe_cart")) || [];

function saveCart() {
    localStorage.setItem("cafe_cart", JSON.stringify(cart));
    updateCartCount();
    renderCartItems();
}

function updateCartCount() {
    const counts = document.querySelectorAll("#cart-count");
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    counts.forEach(el => el.textContent = total);
}

// --- MENU FETCHING ---
async function fetchMenuData() {
    const loadingState = document.getElementById("loading-state");
    const errorState = document.getElementById("error-state");
    const menuContainer = document.getElementById("menu-container");

    try {
        const response = await fetch('data/menu.json');
        if (!response.ok) throw new Error("Failed");
        const data = await response.json();
        
        loadingState.classList.add('hidden');
        menuContainer.classList.remove('hidden');
        renderMenu(data, menuContainer);
    } catch (error) {
        loadingState.classList.add('hidden');
        errorState.classList.remove('hidden');
    }
}

function renderMenu(data, container) {
    for (const [category, items] of Object.entries(data)) {
        const section = document.createElement('section');

        const title = document.createElement('h2');
        title.className = 'text-4xl md:text-5xl font-bold mb-10 text-white capitalize tracking-wide font-serif italic';
        title.textContent = category;
        section.appendChild(title);

        const grid = document.createElement('div');
        grid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10';

        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'bg-cafe-bg rounded-[2rem] overflow-hidden shadow-2xl border border-white/5 flex flex-col transform transition duration-500 hover:-translate-y-3 hover:shadow-[0_20px_50px_rgba(217,119,6,0.15)] hover:border-cafe-accent/30 group';
            
            const badgeHTML = item.tag ? `<div class="absolute top-6 right-6 bg-cafe-accent text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-xl z-20">${item.tag}</div>` : '';
            
            card.innerHTML = `
                <div class="relative h-64 w-full overflow-hidden hover-zoom">
                    ${badgeHTML}
                    <img src="${item.image}" alt="${item.name}" loading="lazy" class="absolute inset-0 w-full h-full object-cover">
                    <div class="absolute inset-0 bg-gradient-to-t from-cafe-bg via-transparent to-transparent opacity-90"></div>
                </div>
                <div class="p-8 flex-grow flex flex-col relative">
                    <div class="flex justify-between items-start mb-4">
                        <h3 class="text-2xl font-bold text-white tracking-tight">${item.name}</h3>
                        <span class="text-2xl font-bold text-cafe-accent ml-4 mt-0.5">₹${item.price}</span>
                    </div>
                    <p class="text-cafe-muted text-base flex-grow mb-8 font-light leading-relaxed">${item.description}</p>
                    <button onclick="addToCart('${item.id}', '${item.name}', ${item.price})" class="w-full py-4 bg-cafe-card hover:bg-cafe-accent text-center text-sm font-bold tracking-widest uppercase rounded-2xl transition-all duration-300 border border-white/10 hover:border-transparent text-white mt-auto shadow-md flex items-center justify-center gap-3">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                        Add to Order
                    </button>
                </div>
            `;
            grid.appendChild(card);
        });
        section.appendChild(grid);
        container.appendChild(section);
    }
}

// --- CART LOGIC ---
window.addToCart = function(id, name, price) {
    const existing = cart.find(c => c.id === id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ id, name, price, quantity: 1 });
    }
    saveCart();
    
    // Smoothly open cart
    document.getElementById('cart-slider').classList.add('open');
    document.getElementById('cart-backdrop').classList.add('open');
};

window.updateQuantity = function(id, change) {
    const item = cart.find(c => c.id === id);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            cart = cart.filter(c => c.id !== id);
        }
        saveCart();
    }
};

function renderCartItems() {
    const container = document.getElementById("cart-items-container");
    const totalEl = document.getElementById("cart-total");
    const btn = document.getElementById("checkout-btn");
    
    if (!container) return;
    
    container.innerHTML = "";
    let total = 0;
    
    if (cart.length === 0) {
        container.innerHTML = `<div class="text-center text-cafe-muted mt-20 text-lg font-light">Your basket feels light.</div>`;
        btn.disabled = true;
        btn.classList.add("opacity-30", "cursor-not-allowed");
    } else {
        btn.disabled = false;
        btn.classList.remove("opacity-30", "cursor-not-allowed");
        
        cart.forEach(item => {
            total += item.price * item.quantity;
            const row = document.createElement("div");
            row.className = "flex justify-between items-center mb-6 p-5 bg-cafe-card rounded-2xl border border-white/5 shadow-sm";
            row.innerHTML = `
                <div class="flex-grow">
                    <h4 class="text-white font-bold text-lg mb-1">${item.name}</h4>
                    <span class="text-cafe-accent text-sm font-bold tracking-widest">₹${item.price}</span>
                </div>
                <div class="flex items-center space-x-3 bg-cafe-bg rounded-xl border border-white/5 p-1.5 shadow-inner">
                    <button onclick="updateQuantity('${item.id}', -1)" class="w-8 h-8 flex items-center justify-center text-white hover:bg-white/10 rounded-lg transition-colors font-bold">-</button>
                    <span class="text-white font-bold w-6 text-center">${item.quantity}</span>
                    <button onclick="updateQuantity('${item.id}', 1)" class="w-8 h-8 flex items-center justify-center text-white hover:bg-white/10 rounded-lg transition-colors font-bold">+</button>
                </div>
            `;
            container.appendChild(row);
        });
    }
    totalEl.textContent = `₹${total}`;
}

// --- UI INJECTION & MODALS ---
function injectCartUI() {
    const toggles = document.querySelectorAll("#cart-toggle");
    
    const ui = document.createElement("div");
    ui.innerHTML = `
        <div id="cart-backdrop" class="cart-backdrop fixed inset-0 z-40 bg-black/80 backdrop-blur-sm cursor-pointer border-none"></div>
        <div id="cart-slider" class="cart-slider fixed top-0 right-0 h-full w-full sm:w-[450px] bg-cafe-bg z-50 shadow-2xl flex flex-col border-l border-white/10">
            <div class="p-8 border-b border-white/5 flex justify-between items-center">
                <h2 class="text-3xl font-bold text-white tracking-tight font-serif italic">Your Order</h2>
                <button id="close-cart" class="p-2 text-cafe-muted hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
            <div class="p-8 flex-grow overflow-y-auto" id="cart-items-container"></div>
            <div class="p-8 border-t border-white/5 bg-cafe-card">
                <div class="flex justify-between items-center mb-8">
                    <span class="text-cafe-muted font-bold uppercase tracking-widest text-sm">Estimated Total</span>
                    <span id="cart-total" class="text-4xl font-bold text-cafe-accent tracking-tighter">₹0</span>
                </div>
                <button id="checkout-btn" class="w-full py-5 bg-cafe-accent hover:bg-cafe-accentHover text-white font-bold uppercase tracking-widest rounded-2xl transition-all shadow-xl hover:scale-[1.02] flex justify-center items-center gap-3">
                    Proceed to Checkout
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(ui);

    const ds = document.getElementById("cart-slider");
    const db = document.getElementById("cart-backdrop");
    
    const close = () => { ds.classList.remove('open'); db.classList.remove('open'); };
    
    toggles.forEach(t => t.addEventListener("click", () => {
        renderCartItems();
        ds.classList.add('open');
        db.classList.add('open');
    }));
    
    document.getElementById("close-cart").addEventListener("click", close);
    db.addEventListener("click", close);
    
    document.getElementById("checkout-btn").addEventListener("click", () => {
        if(cart.length === 0) return;
        close();
        document.getElementById("checkout-modal").classList.add("open");
    });
}

function injectCheckoutModal() {
    const ui = document.createElement("div");
    ui.innerHTML = `
        <div id="checkout-modal" class="modal fixed inset-0 z-50 flex items-center justify-center p-6">
            <div class="absolute inset-0 bg-black/90 backdrop-blur-md" id="checkout-backdrop"></div>
            <div class="relative bg-cafe-bg border border-white/10 rounded-[2.5rem] p-10 w-full max-w-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] transform">
                <button id="close-checkout" class="absolute top-8 right-8 p-2 text-cafe-muted hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                
                <h2 class="text-4xl font-bold text-white mb-2 font-serif italic tracking-tight">Checkout</h2>
                <p class="text-cafe-muted mb-10 font-light text-lg">Just a few details to get this to your table.</p>
                
                <form id="checkout-form" class="space-y-8">
                    <div>
                        <label class="block text-xs font-bold text-cafe-muted uppercase tracking-[0.2em] mb-3">Your Name</label>
                        <input type="text" id="cust-name" required class="w-full bg-cafe-card border border-white/5 rounded-2xl px-5 py-4 text-white text-lg focus:outline-none focus:border-cafe-accent transition-colors shadow-inner" placeholder="e.g. Jane">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-cafe-muted uppercase tracking-[0.2em] mb-3">Table Number</label>
                        <input type="number" id="table-number" min="1" max="99" required class="w-full bg-cafe-card border border-white/5 rounded-2xl px-5 py-4 text-white text-lg focus:outline-none focus:border-cafe-accent transition-colors shadow-inner" placeholder="e.g. 5">
                    </div>
                    
                    <button type="submit" class="w-full py-5 mt-4 bg-cafe-accent hover:bg-cafe-accentHover text-white font-bold uppercase tracking-widest rounded-2xl transition-all shadow-xl hover:-translate-y-1">
                        Place Order
                    </button>
                </form>
            </div>
        </div>
        
        <div id="success-toast" class="modal fixed top-10 left-1/2 -translate-x-1/2 z-[100] bg-cafe-card border border-cafe-accent text-white px-8 py-5 rounded-full shadow-2xl flex items-center gap-4 transform -translate-y-10 transition-all duration-500">
            <div class="bg-cafe-accent p-1.5 rounded-full">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <span class="font-bold tracking-wide text-lg">Order placed successfully!</span>
        </div>
    `;
    document.body.appendChild(ui);

    const modal = document.getElementById("checkout-modal");
    
    document.getElementById("close-checkout").addEventListener("click", () => modal.classList.remove("open"));
    document.getElementById("checkout-backdrop").addEventListener("click", () => modal.classList.remove("open"));
    
    document.getElementById("checkout-form").addEventListener("submit", (e) => {
        e.preventDefault();
        
        // Checkout complete purely frontend
        cart = [];
        saveCart();
        modal.classList.remove("open");
        
        // Show success animation
        const toast = document.getElementById("success-toast");
        toast.classList.add("open");
        toast.classList.remove("-translate-y-10");
        toast.classList.add("translate-y-5");
        
        setTimeout(() => {
            toast.classList.remove("open");
            toast.classList.remove("translate-y-5");
            toast.classList.add("-translate-y-10");
        }, 4000);
        
        e.target.reset();
    });
}
