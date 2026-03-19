/**
 * Manages production queues and machine performance.
 */
import { inventory } from './inventory.js';

export const production = {
    activeProductions: [],
    
    startProduction(machine, item) {
        const rawQty = inventory.items.raw[item.raw_material] || 0;
        if (rawQty < item.required_raw) return false;
        
        inventory.items.raw[item.raw_material] -= item.required_raw;
        
        const prod = {
            id: Date.now(),
            machineId: machine.id,
            itemName: item.name,
            itemType: item.type, // parts or products
            totalTime: item.base_production_time / (machine.efficiency || 1),
            currentTime: 0,
            status: 'processing'
        };
        
        this.activeProductions.push(prod);
        inventory.save();
        return true;
    },
    
    update() {
        if (this.intervalStarted) return;
        this.intervalStarted = true;

        setInterval(() => {
            if (this.activeProductions.length === 0) return;
            
            this.activeProductions.forEach((prod, index) => {
                prod.currentTime += 1;
                
                if (prod.currentTime >= prod.totalTime) {
                    if (!inventory.items[prod.itemType][prod.itemName]) inventory.items[prod.itemType][prod.itemName] = 0;
                    inventory.items[prod.itemType][prod.itemName] += 1;
                    
                    this.activeProductions.splice(index, 1);
                    inventory.save();
                }
            });
        }, 1000);
    }
};
