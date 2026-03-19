/**
 * Simulated dynamic market with price fluctuations and news simulation.
 */
import { inventory } from './inventory.js';

export const market = {
    prices: {
        raw: {
            wood: 5,
            metal: 10,
            fabric: 8,
            chipset: 25
        },
        parts: {
            chair_leg: 15,
            table_top: 25,
            screen: 100
        },
        products: {
            chair: 45,
            table: 120,
            notebook: 350
        }
    },
    
    news: [
        { title: "Forest fire in North-West!", effect: "Wood shortage", target: "wood", multiplier: 1.5 },
        { title: "New mining technology discovered!", effect: "Metal prices drop", target: "metal", multiplier: 0.7 }
    ],
    
    activeNews: null,
    
    updatePrices() {
        // Random fluctuation loop
        setInterval(() => {
            const keys = Object.keys(this.prices.raw);
            const key = keys[Math.floor(Math.random() * keys.length)];
            const change = (Math.random() * 0.2 - 0.1); // +/- 10%
            this.prices.raw[key] = Math.max(1, +(this.prices.raw[key] * (1 + change)).toFixed(2));
            
            // Randomly trigger news
            if (Math.random() > 0.9) {
                this.activeNews = this.news[Math.floor(Math.random() * this.news.length)];
                this.applyNewsEffect(this.activeNews);
            }
            
            // Save state (minimal updates for prices)
            inventory.save();
        }, 15000); // 15s interval
    },
    
    applyNewsEffect(news) {
        if (this.prices.raw[news.target]) {
            this.prices.raw[news.target] = +(this.prices.raw[news.target] * news.multiplier).toFixed(2);
            inventory.save();
        }
    }
};
