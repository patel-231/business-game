/**
 * Main Controller for BizSim Advanced Upgrade
 */
import { inventory } from './modules/inventory.js';
import { ui } from './modules/ui.js';
import { transactions } from './modules/transactions.js';
import { market } from './modules/market.js';
import { map } from './modules/map.js';
import { production } from './modules/production.js';

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    inventory.load();
    updateDashboard();
    
    // Systems Start
    market.updatePrices();
    production.update();
    
    // Global Loop for UI Refresh (Throttle)
    setInterval(() => {
        updateDashboard();
    }, 1000);
    
    // Initial Map Setup
    map.initMap('map-container', 'YOUR_GOOGLE_MAPS_API_KEY');
    
    // Event Delegation
    document.body.addEventListener('click', handleGlobalClick);
});

function handleGlobalClick(e) {
    const target = e.target.closest('[data-action]');
    if (!target) return;
    
    const action = target.getAttribute('data-action');
    const item = target.getAttribute('data-item');
    const price = target.getAttribute('data-price');
    const type = target.getAttribute('data-type');
    
    switch(action) {
        case 'open-device': toggleDevice(); break;
        case 'buy-init': 
            ui.openQuantityModal(item, price, 'buy', (qty) => {
                transactions.buy(type || 'raw', item, qty, price, updateDashboard);
            });
            break;
        case 'sell-init': 
            ui.openQuantityModal(item, price, 'sell', (qty) => {
                transactions.sell(type || 'products', item, qty, price, updateDashboard);
            });
            break;
    }
}

function updateDashboard() {
    // Money
    document.getElementById('money-display').textContent = `$${(inventory.money || 0).toLocaleString()}`;
    
    // Time
    document.getElementById('time-display').textContent = `Day ${inventory.time.day} | ${String(inventory.time.hour).padStart(2, '0')}:00`;
    
    // Inventory Products Count
    const totalProd = Object.values(inventory.items.products).reduce((a, b) => a + b, 0);
    document.getElementById('stock-display').textContent = `${totalProd} Units`;
    
    // News & Trends
    const newsEl = document.getElementById('active-news');
    if (market.activeNews) {
        newsEl.innerHTML = `<i data-lucide="trending-up"></i> ${market.activeNews.title}`;
        newsEl.classList.add('notification');
    }
    
    renderFactoryContent();
    renderMarketPrices();
}

function renderFactoryContent() {
    const list = document.getElementById('machine-list');
    const invList = document.getElementById('inventory-list');
    const noBiz = document.getElementById('no-biz-message');
    const factory = document.getElementById('factory-content');

    if (!inventory.activeBusiness) {
        noBiz.style.display = 'block';
        factory.style.display = 'none';
        return;
    }

    noBiz.style.display = 'none';
    factory.style.display = 'block';

    // Simplified machinery status for prototype
    list.innerHTML = `
        <div class="card">
            <div class="card-title">Production Unit 01</div>
            <div class="card-meta">Type: Assembly Line</div>
            <div class="progress-bar" style="width: 20%; height: 4px; margin-top: 1rem;"></div>
        </div>
    `;

    // Inventory List with SELL options
    invList.innerHTML = '';
    const items = inventory.items.products;
    Object.entries(items).forEach(([name, qty]) => {
        if (qty > 0) {
            const price = market.prices.products[name] || 100;
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div style="display: flex; justify-content: space-between;">
                    <div class="card-title" style="text-transform: capitalize;">${name}</div>
                    <div class="stat-value">${qty}</div>
                </div>
                <button class="secondary" data-action="sell-init" data-item="${name}" data-price="${price}" data-type="products" style="margin-top: 1rem; width: 100%;">
                    SELL FOR $${price}/u
                </button>
            `;
            invList.appendChild(card);
        }
    });
}

function renderMarketPrices() {
    const container = document.getElementById('market-prices');
    container.innerHTML = '<h3>Raw Materials</h3>';
    
    Object.entries(market.prices.raw).forEach(([item, price]) => {
        const div = document.createElement('div');
        div.className = 'price-indicator';
        div.innerHTML = `
            <span style="text-transform: capitalize;">${item}</span>
            <span class="price-value">$${price}</span>
            <button class="secondary" data-action="buy-init" data-item="${item}" data-price="${price}" data-type="raw">BUY</button>
        `;
        container.appendChild(div);
    });
    
    if (window.lucide) lucide.createIcons();
}

// Device & App Helpers
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
            <div style="display: flex; flex-direction: column; gap: 1rem;">
                <button onclick="startGame('Furniture')">Furniture Mfg</button>
                <button onclick="startGame('Electronics')">Electronics Mfg</button>
            </div>
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
        body.innerHTML = `<p>App contents are loading...</p>`;
    }
    if (window.lucide) lucide.createIcons();
};

window.hideApp = () => {
    document.getElementById('device-content').style.display = 'grid';
    document.getElementById('app-view').style.display = 'none';
    document.getElementById('app-title').textContent = 'Home';
};

window.startGame = (type) => {
    inventory.activeBusiness = type;
    inventory.save();
    ui.toast(`Business Started: ${type}`, 'success');
    updateDashboard();
    toggleDevice();
};

window.openShop = (shopName) => {
    const modal = document.createElement('div');
    modal.id = 'shop-modal';
    modal.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.9); backdrop-filter: blur(10px); z-index: 2000; display: flex; align-items: center; justify-content: center;';
    
    modal.innerHTML = `
        <div class="glass-panel" style="width: 500px; max-height: 80vh;">
            <h2>${shopName}</h2>
            <p class="stat-label">Location: Downtown Area</p>
            <div class="card-list" style="margin-top: 1.5rem;">
                <div class="card">
                    <div class="card-title">Contract Bulk: Wood (50 units)</div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span>Price: $200</span>
                        <button data-action="buy-init" data-item="wood" data-price="4" data-type="raw">Purchase Slot</button>
                    </div>
                </div>
            </div>
            <button class="secondary" onclick="this.closest('#shop-modal').remove()" style="margin-top: 2rem;">LEAVE SHOP</button>
        </div>
    `;
    document.body.appendChild(modal);
};
