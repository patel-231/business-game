/**
 * Manage vehicles and travel time simulation.
 */
export const vehicles = {
    all: [
        { id: 'bike_1', name: 'Scooter', speed: 10, fuel: 100, cost_per_km: 1 },
        { id: 'car_1', name: 'Pick-up Truck', speed: 15, fuel: 100, cost_per_km: 2 }
    ],
    
    selected: 'bike_1',
    
    getSpeed(id) {
        return this.all.find(v => v.id === id).speed;
    },
    
    calculateTravelTime(dist_km) {
        const speed = this.getSpeed(this.selected);
        return dist_km / speed; // return seconds for simulation
    },
    
    travel(dist_km) {
        const time = this.calculateTravelTime(dist_km);
        const cost = dist_km * this.all.find(v => v.id === this.selected).cost_per_km;
        
        return new Promise((resolve, reject) => {
            if (this.selected.fuel < cost) {
                reject('Not enough fuel!');
                return;
            }
            
            this.selected.fuel -= cost;
            console.log(`Travelling ${dist_km} km for ${time}s`);
            setTimeout(resolve, time * 1000); // simulate the travel time
        });
    }
};
