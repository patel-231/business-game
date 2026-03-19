/**
 * Initialize Google Maps and markers for markets and clients.
 */
export const map = {
    gMap: null,
    markers: [],
    
    initMap(containerId, apiKey) {
        if (!apiKey || apiKey === "YOUR_GOOGLE_MAPS_API_KEY") {
            console.log("No valid Google Maps API Key found. Using placeholder graphics.");
            this.gMap = "placeholder"; // For testing
            return;
        }
        
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
        script.defer = true;
        document.head.append(script);
        
        window.initMap = () => {
            console.log("Map Initialized!");
            this.gMap = new google.maps.Map(document.getElementById(containerId), {
                center: { lat: 40.7128, lng: -74.0060 }, // NYC center
                zoom: 12,
            });
            this.addMarkers();
        };
    },
    
    addMarkers() {
        if (!this.gMap || this.gMap === "placeholder") return;
        
        const locs = [
            { name: "Market 1", lat: 40.7128, lng: -74.0060, type: "shop" },
            { name: "Client 1", lat: 40.7028, lng: -73.9960, type: "client" }
        ];
        
        locs.forEach(loc => {
            const marker = new google.maps.Marker({
                position: { lat: loc.lat, lng: loc.lng },
                map: this.gMap,
                title: loc.name,
                icon: loc.type === "shop" ? "http://maps.google.com/mapfiles/ms/icons/shopping.png" : "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
            });
            
            marker.addListener("click", () => {
                console.log(`Visited: ${loc.name}`);
                // Handle click event: open shop/client dialog
            });
            
            this.markers.push(marker);
        });
    }
};
