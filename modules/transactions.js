/**
 * Business transactions: Buying/Selling logic with validation and processing.
 */
import { inventory } from './inventory.js';
import { ui } from './ui.js';

export const transactions = {
    buy(itemType, itemName, qty, price, callback) {
        const total = price * qty;
        
        if (inventory.money < total) {
            ui.toast("Insufficient funds", 'danger');
            return false;
        }

        // Processing Step
        ui.showTravel(1.5, "Processing Payment...", () => {
            inventory.money -= total;
            
            if (!inventory.items[itemType][itemName]) inventory.items[itemType][itemName] = 0;
            inventory.items[itemType][itemName] += qty;
            
            inventory.addHistory({ type: 'buy', item: itemName, qty, cost: total });
            ui.toast(`Bought ${qty} ${itemName}`, 'success');
            
            if (callback) callback();
        });
        
        return true;
    },

    sell(itemType, itemName, qty, price, callback) {
        const currentQty = inventory.items[itemType][itemName] || 0;
        
        if (currentQty < qty) {
            ui.toast("Insufficient stock", 'danger');
            return false;
        }

        const revenue = price * qty;

        ui.showTravel(2, "Confirming Logistics...", () => {
            inventory.items[itemType][itemName] -= qty;
            inventory.money += revenue;
            
            inventory.addHistory({ type: 'sell', item: itemName, qty, revenue });
            ui.toast(`Sold ${qty} ${itemName}`, 'success');
            
            if (callback) callback();
        });
        
        return true;
    }
};
