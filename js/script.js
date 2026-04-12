document.addEventListener("DOMContentLoaded", () => {
    // Intro Loader Logic
    const introLoader = document.getElementById("intro-loader");
    if (introLoader) {
        setTimeout(() => {
            introLoader.classList.add("fade-out");
            setTimeout(() => {
                introLoader.style.display = "none";
            }, 1000);
        }, 1500);
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
        section.className = 'mb-16';

        const title = document.createElement('h2');
        title.className = 'text-3xl font-bold mb-8 text-white capitalize border-b border-stone-800 pb-2 tracking-wide';
        title.textContent = category;
        section.appendChild(title);

        const grid = document.createElement('div');
        grid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8';

        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'bg-stone-800 rounded-2xl overflow-hidden shadow-lg border border-stone-700/50 flex flex-col transform transition duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(217,119,6,0.15)] group relative';
            
            const badgeHTML = item.tag ? `<div class="absolute top-4 right-4 bg-brand-accent text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md z-10">${item.tag}</div>` : '';
            
            card.innerHTML = `
                <div class="relative h-56 w-full overflow-hidden">
                    ${badgeHTML}
                    <img src="${item.image}" alt="${item.name}" loading="lazy" class="absolute inset-0 w-full h-full object-cover transform transition duration-500 group-hover:scale-105">
                    <div class="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent opacity-80"></div>
                </div>
                <div class="p-6 bg-gradient-to-b from-stone-800 to-stone-900 flex-grow flex flex-col">
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="text-xl font-bold text-white tracking-tight">${item.name}</h3>
                        <span class="text-xl font-bold text-brand-accent ml-4">₹${item.price}</span>
                    </div>
                    <p class="text-stone-400 text-sm flex-grow mb-6 leading-relaxed">${item.description}</p>
                    <button onclick="addToCart('${item.id}', '${item.name}', ${item.price})" class="w-full py-3 bg-stone-700 hover:bg-brand-accent text-center text-sm font-bold tracking-wide uppercase rounded-xl transition-all duration-300 border border-stone-600 hover:border-transparent text-white mt-auto flex items-center justify-center gap-2">
                        Add to Cart
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
    // Open cart for UX
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
        container.innerHTML = `<div class="text-center text-stone-500 mt-10">Your cart is empty.</div>`;
        btn.disabled = true;
        btn.classList.add("opacity-50", "cursor-not-allowed");
    } else {
        btn.disabled = false;
        btn.classList.remove("opacity-50", "cursor-not-allowed");
        
        cart.forEach(item => {
            total += item.price * item.quantity;
            const row = document.createElement("div");
            row.className = "flex justify-between items-center mb-4 p-4 bg-stone-800 rounded-xl border border-stone-700";
            row.innerHTML = `
                <div class="flex-grow">
                    <h4 class="text-white font-bold">${item.name}</h4>
                    <span class="text-brand-accent text-sm font-bold">₹${item.price}</span>
                </div>
                <div class="flex items-center space-x-3 bg-stone-900 rounded-lg p-1 border border-stone-700">
                    <button onclick="updateQuantity('${item.id}', -1)" class="w-8 h-8 flex items-center justify-center text-white hover:bg-stone-700 rounded-md transition-colors">-</button>
                    <span class="text-white font-bold w-4 text-center">${item.quantity}</span>
                    <button onclick="updateQuantity('${item.id}', 1)" class="w-8 h-8 flex items-center justify-center text-white hover:bg-stone-700 rounded-md transition-colors">+</button>
                </div>
            `;
            container.appendChild(row);
        });
    }
    totalEl.textContent = `₹${total}`;
}

// --- UI INJECTION & MODALS ---
function injectCartUI() {
    // Check if toggles exist
    const toggles = document.querySelectorAll("#cart-toggle");
    
    const ui = document.createElement("div");
    ui.innerHTML = `
        <div id="cart-backdrop" class="cart-backdrop fixed inset-0 z-40 bg-black/60 backdrop-blur-sm cursor-pointer border-none"></div>
        <div id="cart-slider" class="cart-slider fixed top-0 right-0 h-full w-full sm:w-[400px] bg-stone-900 z-50 shadow-2xl flex flex-col border-l border-stone-800">
            <div class="p-6 border-b border-stone-800 flex justify-between items-center bg-stone-950">
                <h2 class="text-2xl font-bold text-white tracking-tight">Your Cart</h2>
                <button id="close-cart" class="text-stone-400 hover:text-white transition-colors">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
            <div class="p-6 flex-grow overflow-y-auto" id="cart-items-container"></div>
            <div class="p-6 border-t border-stone-800 bg-stone-950">
                <div class="flex justify-between items-center mb-6">
                    <span class="text-stone-400 font-bold uppercase tracking-widest text-sm">Total</span>
                    <span id="cart-total" class="text-3xl font-bold text-brand-accent tracking-tighter">₹0</span>
                </div>
                <button id="checkout-btn" class="w-full py-4 bg-brand-accent hover:bg-brand-accentHover text-white font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg flex justify-center items-center gap-2">
                    Place Order
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
        <div id="checkout-modal" class="modal fixed inset-0 z-50 flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" id="checkout-backdrop"></div>
            <div class="relative bg-stone-900 border border-stone-800 rounded-3xl p-8 w-full max-w-md shadow-2xl transform">
                <button id="close-checkout" class="absolute top-6 right-6 text-stone-400 hover:text-white transition-colors">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                <h2 class="text-3xl font-bold text-white mb-2 tracking-tight">Checkout</h2>
                <p class="text-stone-400 mb-8 font-light">Complete your order details.</p>
                
                <form id="checkout-form" class="space-y-6">
                    <div>
                        <label class="block text-sm font-bold text-stone-300 uppercase tracking-widest mb-2">Customer Name</label>
                        <input type="text" id="cust-name" required class="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-accent transition-colors" placeholder="e.g. John Doe">
                    </div>
                    <div>
                        <label class="block text-sm font-bold text-stone-300 uppercase tracking-widest mb-2">Table Number</label>
                        <input type="number" id="table-number" min="1" max="99" required class="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-accent transition-colors" placeholder="e.g. 5">
                    </div>
                    
                    <button type="submit" class="w-full py-4 bg-brand-accent hover:bg-brand-accentHover text-white font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg mt-4">
                        Confirm Order
                    </button>
                </form>
            </div>
        </div>
        
        <div id="success-toast" class="modal fixed top-10 right-10 z-[60] bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 transform translate-y-[-20px]">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            <span class="font-bold">Order placed successfully!</span>
        </div>
    `;
    document.body.appendChild(ui);

    const modal = document.getElementById("checkout-modal");
    
    document.getElementById("close-checkout").addEventListener("click", () => modal.classList.remove("open"));
    document.getElementById("checkout-backdrop").addEventListener("click", () => modal.classList.remove("open"));
    
    document.getElementById("checkout-form").addEventListener("submit", (e) => {
        e.preventDefault();
        
        const name = document.getElementById("cust-name").value;
        const table = document.getElementById("table-number").value;
        const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
        
        const order = {
            id: Date.now().toString(),
            timestamp: new Date().toLocaleTimeString(),
            customer: name,
            table: table,
            items: [...cart],
            total: total
        };
        
        let allOrders = JSON.parse(localStorage.getItem("cafe_orders")) || [];
        allOrders.push(order);
        localStorage.setItem("cafe_orders", JSON.stringify(allOrders));
        
        // Reset
        cart = [];
        saveCart();
        modal.classList.remove("open");
        
        // Show success
        const toast = document.getElementById("success-toast");
        toast.classList.add("open");
        toast.style.transform = "translateY(0)";
        setTimeout(() => {
            toast.classList.remove("open");
            toast.style.transform = "translateY(-20px)";
        }, 3000);
        
        e.target.reset();
    });
}
