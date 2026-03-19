/**
 * Core game state storage and persistence.
 */
export const inventory = {
    money: 1000,
    time: { day: 1, hour: 8 },
    items: {
        raw: { wood: 10, metal: 5, fabric: 0, chipset: 0 },
        parts: {},
        products: {}
    },
    history: [],
    activeBusiness: null,
    
    save() {
        localStorage.setItem('biz_sim_v2', JSON.stringify({
            money: this.money,
            items: this.items,
            activeBusiness: this.activeBusiness,
            time: this.time,
            history: this.history
        }));
    },
    
    load() {
        const data = localStorage.getItem('biz_sim_v2');
        if (data) {
            const parsed = JSON.parse(data);
            Object.assign(this, parsed);
        }
    },

    addHistory(entry) {
        this.history.unshift({ ...entry, id: Date.now() });
        if (this.history.length > 20) this.history.pop();
        this.save();
    }
};
