document.addEventListener("DOMContentLoaded", () => {
    const menuContainer = document.getElementById("menu-container");
    
    // Only fetch if we are on the menu page
    if (menuContainer) {
        fetchMenuData();
    }
});

async function fetchMenuData() {
    const loadingState = document.getElementById("loading-state");
    const errorState = document.getElementById("error-state");
    const menuContainer = document.getElementById("menu-container");

    try {
        const response = await fetch('data/menu.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        loadingState.classList.add('hidden');
        menuContainer.classList.remove('hidden');
        
        renderMenu(data, menuContainer);
    } catch (error) {
        console.error("Failed to load menu:", error);
        loadingState.classList.add('hidden');
        errorState.classList.remove('hidden');
    }
}

function renderMenu(data, container) {
    for (const [category, items] of Object.entries(data)) {
        // Create category section
        const section = document.createElement('section');
        section.className = 'mb-16';

        // Add title
        const title = document.createElement('h2');
        title.className = 'text-3xl font-bold mb-8 text-white capitalize border-b border-stone-800 pb-2';
        title.textContent = category;
        section.appendChild(title);

        // Create grid
        const grid = document.createElement('div');
        grid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8';

        items.forEach(item => {
            const card = createItemCard(item);
            grid.appendChild(card);
        });

        section.appendChild(grid);
        container.appendChild(section);
    }
}

function createItemCard(item) {
    const card = document.createElement('div');
    card.className = 'bg-stone-800 rounded-2xl overflow-hidden shadow-lg border border-stone-700/50 flex flex-col hover:border-brand-accent/30 transition-colors duration-300';
    
    // Default image if none provided
    const imgUrl = item.image || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80';
    const description = item.description || 'Deliciously prepared locally.';

    card.innerHTML = `
        <div class="relative h-48 w-full">
            <img src="${imgUrl}" alt="${item.name}" class="absolute inset-0 w-full h-full object-cover">
            <div class="absolute inset-0 bg-gradient-to-t from-stone-900 to-transparent opacity-60"></div>
        </div>
        <div class="p-6 flex flex-col flex-grow">
            <div class="flex justify-between items-start mb-2">
                <h3 class="text-xl font-bold text-white">${item.name}</h3>
                <span class="text-xl font-bold text-brand-accent">₹${item.price}</span>
            </div>
            <p class="text-stone-400 text-sm flex-grow mb-6">${description}</p>
            <a href="https://wa.me/919999999999?text=Hi,%20I%20want%20to%20order%20${encodeURIComponent(item.name)}" target="_blank" class="w-full py-2 bg-stone-700 hover:bg-brand-accent text-center text-sm font-semibold rounded-lg transition-colors border border-stone-600 hover:border-transparent text-white mt-auto">
                Order
            </a>
        </div>
    `;

    return card;
}
