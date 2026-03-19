/**
 * Main Controller for BizSim Game
 */
import { gameState } from './modules/gameState.js';
import { production } from './modules/production.js';
import { market } from './modules/market.js';
import { vehicles } from './modules/vehicles.js';
import { map } from './modules/map.js';

// Init
document.addEventListener('DOMContentLoaded', () => {
    gameState.load();
    updateUI();
    
    // Subscribe UI to state changes
    gameState.subscribe(updateUI);
    
    // Start systems
    market.updatePrices();
    production.update();
    
    // UI Event Listeners
    document.getElementById('open-device').addEventListener('click', toggleDevice);
    document.getElementById('buy-raw-btn').addEventListener('click', showMarketModal);
    
    // Placeholder Map Init
    map.initMap('map-container', 'YOUR_GOOGLE_MAPS_API_KEY');
});

function updateUI() {
    // Top Stats
    document.getElementById('money-display').textContent = `$${gameState.money.toLocaleString()}`;
    const stockCount = Object.values(gameState.inventory.products).reduce((a, b) => a + b, 0);
    document.getElementById('stock-display').textContent = `${stockCount} Units`;
    document.getElementById('time-display').textContent = `Day ${gameState.time.day} | ${String(gameState.time.hour).padStart(2, '0')}:00`;

    // Factory Content
    const factoryContent = document.getElementById('factory-content');
    const noBizMessage = document.getElementById('no-biz-message');
    
    if (gameState.activeBusiness) {
        factoryContent.style.display = 'block';
        noBizMessage.style.display = 'none';
        renderFactory();
        renderInventory();
    } else {
        factoryContent.style.display = 'none';
        noBizMessage.style.display = 'block';
    }

    // Market UI
    renderMarketPrices();
}

function renderFactory() {
    const list = document.getElementById('machine-list');
    list.innerHTML = '';
    
    if (gameState.machines.length === 0) {
        list.innerHTML = `<div class="card" onclick="openMachineShop()">+ Buy your first machine</div>`;
    }
    
    gameState.machines.forEach(machine => {
        const prod = production.activeProductions.find(p => p.machineId === machine.id);
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-title">${machine.name}</div>
            <div class="card-meta">
                <span>Efficiency: ${machine.efficiency * 100}%</span>
                <span>${prod ? 'Processing...' : 'Idle'}</span>
            </div>
            ${prod ? `
                <div class="progress-container">
                    <div class="progress-bar" style="width: ${(prod.currentTime / prod.totalTime) * 100}%"></div>
                </div>
            ` : `<button onclick="startProductionDialog('${machine.id}')" style="margin-top: 1rem; width: 100%;">START PRODUCTION</button>`}
        `;
        list.appendChild(card);
    });
}

function renderInventory() {
    const list = document.getElementById('inventory-list');
    list.innerHTML = '';
    
    // Check raw materials
    Object.entries(gameState.inventory.raw).forEach(([item, q]) => {
        if (q > 0) list.innerHTML += `<div class="card"><div class="card-title">${item} (Raw)</div><div>Qty: ${q}</div></div>`;
    });
    
    // Check parts
    Object.entries(gameState.inventory.parts).forEach(([item, q]) => {
        if (q > 0) list.innerHTML += `<div class="card"><div class="card-title">${item} (Part)</div><div>Qty: ${q}</div></div>`;
    });
    
    // Check products
    Object.entries(gameState.inventory.products).forEach(([item, q]) => {
        if (q > 0) list.innerHTML += `<div class="card"><div class="card-title">${item} (Final Product)</div><div>Qty: ${q}</div></div>`;
    });
    
    if (list.innerHTML === '') {
        list.innerHTML = `<div class="card-meta">Inventory empty.</div>`;
    }
}

function renderMarketPrices() {
    const container = document.getElementById('market-prices');
    container.innerHTML = '';
    
    Object.entries(market.prices.raw).forEach(([item, price]) => {
        const div = document.createElement('div');
        div.className = 'price-indicator';
        div.innerHTML = `
            <span style="text-transform: capitalize;">${item}</span>
            <span class="price-value">$${price}</span>
            <span class="price-up"><i data-lucide="trending-up" size="14"></i></span>
        `;
        container.appendChild(div);
    });
    
    if (lucide) lucide.createIcons();
}

// Global UI Interactivity (Exposed to window for HTML click handlers)
window.toggleDevice = () => {
    const overlay = document.getElementById('device-overlay');
    overlay.style.display = overlay.style.display === 'none' ? 'flex' : 'none';
};

window.showApp = (appName) => {
    const content = document.getElementById('device-content');
    const view = document.getElementById('app-view');
    const body = document.getElementById('app-body');
    const title = document.getElementById('app-title');
    
    content.style.display = 'none';
    view.style.display = 'block';
    title.textContent = appName.toUpperCase();
    
    if (appName === 'biz-select') {
        body.innerHTML = `
            <p>Select your business sector:</p><br>
            <button onclick="startGame('Furniture')">Furniture Mfg</button><br><br>
            <button onclick="startGame('Electronics')">Electronics Mfg</button>
        `;
    } else if (appName === 'vehicles') {
        body.innerHTML = `
            <p>Your Fleet:</p><br>
            <div class="card">
                <div>Model: Starter Bike</div>
                <div>Status: Available</div>
            </div>
        `;
    } else {
        body.innerHTML = `<p>App content coming soon...</p>`;
    }
};

window.hideApp = () => {
    document.getElementById('device-content').style.display = 'grid';
    document.getElementById('app-view').style.display = 'none';
    document.getElementById('app-title').textContent = 'Home';
};

window.startGame = (type) => {
    gameState.activeBusiness = type;
    gameState.machines = [{ id: 'machine_1', name: 'Standard Cutter', efficiency: 1.0 }];
    gameState.inventory.raw = { wood: 10, metal: 5 };
    gameState.notify();
    hideApp();
    toggleDevice();
};

window.showMarketModal = () => {
    const modal = document.getElementById('modal-container');
    const content = document.getElementById('modal-content');
    modal.style.display = 'flex';
    
    content.innerHTML = `
        <h2>Global Market Buy</h2>
        <p>Buy materials via online order (Delivery fee: $20)</p>
        <div class="card-list">
            ${Object.entries(market.prices.raw).map(([item, price]) => `
                <div class="card">
                    <div class="card-title">${item}</div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span>Price: $${price}/unit</span>
                        <button onclick="buyMaterial('${item}', 10)">Buy 10</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
};

window.buyMaterial = (item, qty) => {
    if (market.buyRaw(item, qty)) {
        console.log(`Bought ${qty} ${item}`);
    } else {
        alert("Not enough money!");
    }
};

window.closeModal = () => {
    document.getElementById('modal-container').style.display = 'none';
};

window.startProductionDialog = (hostId) => {
    const modal = document.getElementById('modal-container');
    const content = document.getElementById('modal-content');
    modal.style.display = 'flex';
    
    const products = [
        { name: 'chair_leg', type: 'parts', raw_material: 'wood', required_raw: 2, base_production_time: 10 },
        { name: 'chair', type: 'products', raw_material: 'wood', required_raw: 8, base_production_time: 25 }
    ];
    
    content.innerHTML = `
        <h2>Select Production Task</h2>
        <div class="card-list">
            ${products.map(p => {
                const itemStr = p.name; // Simpler to just pass the IDs/Names
                return `
                <div class="card">
                    <div class="card-title" style="text-transform: capitalize;">${p.name.replace('_', ' ')}</div>
                    <div>Costs: ${p.required_raw} ${p.raw_material}</div>
                    <button onclick='window.processProd("${hostId}", "${p.name}")' style="margin-top: 0.5rem; width: 100%;">PRODUCE</button>
                </div>
                `;
            }).join('')}
        </div>
    `;
};

// Add a helper for processing
window.processProd = (machineId, itemName) => {
    const products = [
        { name: 'chair_leg', type: 'parts', raw_material: 'wood', required_raw: 2, base_production_time: 10 },
        { name: 'chair', type: 'products', raw_material: 'wood', required_raw: 8, base_production_time: 25 }
    ];
    const item = products.find(p => p.name === itemName);
    const machine = gameState.machines.find(m => m.id === machineId);
    if (production.startProduction(machine, item)) {
        closeModal();
    } else {
        alert("Not enough raw materials!");
    }
};
