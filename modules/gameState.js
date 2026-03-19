/**
 * Handles money, inventory, and game state saving/loading.
 */
export const gameState = {
    money: 1000,
    time: { day: 1, hour: 8 },
    inventory: {
        raw: {}, // e.g., { wood: 10 }
        parts: {}, // e.g., { chair_leg: 4 }
        products: {} // e.g., { chair: 2 }
    },
    machines: [],
    vehicles: [
        { id: 'bike_1', name: 'Starter Bike', speed: 1.5, fuel: 100, active: true },
        { id: 'car_1', name: 'Delivery Van', speed: 1.2, fuel: 100, active: false }
    ],
    activeBusiness: null,
    
    // Updates
    addMoney(amount) {
        this.money += amount;
        this.notify();
    },
    
    removeMoney(amount) {
        if (this.money >= amount) {
            this.money -= amount;
            this.notify();
            return true;
        }
        return false;
    },
    
    addToInventory(type, item, qty) {
        if (!this.inventory[type][item]) this.inventory[type][item] = 0;
        this.inventory[type][item] += qty;
        this.notify();
    },
    
    removeFromInventory(type, item, qty) {
        if (this.inventory[type][item] >= qty) {
            this.inventory[type][item] -= qty;
            this.notify();
            return true;
        }
        return false;
    },
    
    // Notify listeners
    listeners: [],
    subscribe(callback) {
        this.listeners.push(callback);
    },
    notify() {
        this.listeners.forEach(cb => cb(this));
        this.save();
    },
    
    save() {
        localStorage.setItem('biz_sim_save', JSON.stringify({
            money: this.money,
            inventory: this.inventory,
            machines: this.machines,
            activeBusiness: this.activeBusiness,
            time: this.time
        }));
    },
    
    load() {
        const data = localStorage.getItem('biz_sim_save');
        if (data) {
            const parsed = JSON.parse(data);
            Object.assign(this, parsed);
        }
    }
};
