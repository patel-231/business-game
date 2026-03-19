/**
 * Manages production queues and machine performance.
 */
import { gameState } from './gameState.js';

export const production = {
    activeProductions: [],
    
    startProduction(machine, item) {
        if (!gameState.inventory.raw[item.raw_material] >= item.required_raw) return false;
        
        gameState.removeFromInventory('raw', item.raw_material, item.required_raw);
        
        const prod = {
            id: Date.now(),
            machineId: machine.id,
            itemName: item.name,
            itemType: item.type, // parts or products
            totalTime: item.base_production_time / machine.efficiency,
            currentTime: 0,
            status: 'processing'
        };
        
        this.activeProductions.push(prod);
        this.update();
        return true;
    },
    
    update() {
        // Run production loop every second
        setInterval(() => {
            if (this.activeProductions.length === 0) return;
            
            this.activeProductions.forEach((prod, index) => {
                prod.currentTime += 1; // 1 second intervals
                
                if (prod.currentTime >= prod.totalTime) {
                    // Complete production
                    gameState.addToInventory(prod.itemType, prod.itemName, 1);
                    this.activeProductions.splice(index, 1);
                    console.log(`Produced: ${prod.itemName}`);
                    gameState.notify();
                }
            });
        }, 1000);
    }
};
