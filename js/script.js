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
        title.className = 'text-3xl font-bold mb-8 text-white capitalize border-b border-stone-800 pb-2 tracking-wide';
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
    // Upgraded: Added scale transform, robust shadows, and smooth transitions
    card.className = 'bg-stone-800 rounded-2xl overflow-hidden shadow-lg border border-stone-700/50 flex flex-col transform transition duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(217,119,6,0.15)] group';
    
    // Default image if none provided
    const imgUrl = item.image || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80';
    const description = item.description || 'Deliciously prepared locally.';
    
    // Add popular badge logic
    const badgeHTML = item.popular ? `<div class="absolute top-4 right-4 bg-brand-accent text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md z-10">Popular</div>` : '';

    // Upgraded: Group hover effects on image zoom 
    card.innerHTML = `
        <div class="relative h-56 w-full overflow-hidden">
            ${badgeHTML}
            <img src="${imgUrl}" alt="${item.name}" loading="lazy" class="absolute inset-0 w-full h-full object-cover transform transition duration-500 group-hover:scale-105">
            <div class="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent opacity-80"></div>
        </div>
        <div class="p-6 flex flex-col flex-grow bg-gradient-to-b from-stone-800 to-stone-900">
            <div class="flex justify-between items-start mb-2">
                <h3 class="text-xl font-bold text-white tracking-tight">${item.name}</h3>
                <span class="text-xl font-bold text-brand-accent ml-4">₹${item.price}</span>
            </div>
            <p class="text-stone-400 text-sm flex-grow mb-6 leading-relaxed">${description}</p>
            <a href="https://wa.me/919999999999?text=Hi,%20I%20want%20to%20order%20${encodeURIComponent(item.name)}" target="_blank" class="w-full py-3 bg-stone-700 hover:bg-brand-accent text-center text-sm font-bold tracking-wide uppercase rounded-xl transition-all duration-300 border border-stone-600 hover:border-transparent text-white mt-auto shadow-md hover:shadow-brand-accent/30 flex items-center justify-center gap-2">
                <svg fill="currentColor" viewBox="0 0 24 24" class="w-4 h-4" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                Order Now
            </a>
        </div>
    `;

    return card;
}
