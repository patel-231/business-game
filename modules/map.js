/**
 * Google Maps integration with nearby shop detection and travel simulation.
 */
import { ui } from './ui.js';

export const map = {
    gMap: null,
    markers: [],
    
    initMap(containerId, apiKey) {
        if (!apiKey || apiKey === "YOUR_GOOGLE_MAPS_API_KEY") {
            const container = document.getElementById(containerId);
            container.innerHTML = `
                <div id="placeholder-map" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #94a3b8;">
                    <i data-lucide="map-pin" size="48"></i>
                    <h2>Interactive Simulator Mode</h2>
                    <p style="margin-top: 1rem;">No valid API key. Using simulated locations.</p>
                    <div id="simulated-markers" style="margin-top: 2rem; display: flex; gap: 1rem;"></div>
                </div>
            `;
            this.addSimulatedMarkers();
            if (window.lucide) lucide.createIcons();
            return;
        }

        window.initMap = () => {
            this.gMap = new google.maps.Map(document.getElementById(containerId), {
                center: { lat: 40.7128, lng: -74.0060 },
                zoom: 14,
                styles: [
                    { "elementType": "geometry", "stylers": [{ "color": "#1e293b" }] },
                    { "elementType": "labels.text.stroke", "stylers": [{ "color": "#0f172a" }] },
                    { "elementType": "labels.text.fill", "stylers": [{ "color": "#94a3b8" }] },
                    { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#020617" }] }
                ]
            });
            this.fetchNearbyShops();
        };

        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`;
        script.defer = true;
        document.head.append(script);
    },

    addSimulatedMarkers() {
        const simData = [
            { name: "Hardware Store 1", type: "Raw Materials", dist: 2 },
            { name: "City Furniture Market", type: "Marketplace", dist: 5 },
            { name: "High-Tech Solutions", type: "Electronics", dist: 12 }
        ];

        const container = document.getElementById('simulated-markers');
        simData.forEach(loc => {
            const btn = document.createElement('button');
            btn.className = 'card secondary';
            btn.style.width = '180px';
            btn.innerHTML = `
                <div class="card-title">${loc.name}</div>
                <div class="stat-label">${loc.type}</div>
                <div class="stat-value" style="margin-top: 0.5rem;">${loc.dist}km Distance</div>
            `;
            btn.onclick = () => this.handleTravel(loc.name, loc.dist);
            container.appendChild(btn);
        });
    },

    handleTravel(locName, dist) {
        // Mock travel time calculation (1s per km for prototype)
        const time = Math.min(dist, 10); 
        ui.showTravel(time, `Travelling to ${locName}...`, () => {
            // After travel - show shop UI
            ui.toast(`Arrived at ${locName}`, 'success');
            // Trigger shop opening globally
            if (window.openShop) window.openShop(locName);
        });
    },

    fetchNearbyShops() {
        // For real API - call google.maps.places.PlacesService
        if (!this.gMap) return;
        const service = new google.maps.places.PlacesService(this.gMap);
        const request = {
            location: this.gMap.getCenter(),
            radius: '5000',
            type: ['hardware_store']
        };

        service.nearbySearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                results.forEach(place => {
                    const marker = new google.maps.Marker({
                        map: this.gMap,
                        position: place.geometry.location,
                        title: place.name
                    });
                    marker.addListener('click', () => {
                        this.handleTravel(place.name, 5); // Simulate distance 5km
                    });
                    this.markers.push(marker);
                });
            }
        });
    }
};
