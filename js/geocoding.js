// Geocoding and location services
class GeocodingService {
    constructor() {
        this.cache = new Map();
        this.requestQueue = [];
        this.lastRequestTime = 0;
    }

    // Rate limiting helper
    async rateLimit() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        const minTimeBetweenRequests = 1000; // 1 second between requests
        
        if (timeSinceLastRequest < minTimeBetweenRequests) {
            await new Promise(resolve => 
                setTimeout(resolve, minTimeBetweenRequests - timeSinceLastRequest)
            );
        }
        this.lastRequestTime = Date.now();
    }

    // Geocode location name to coordinates
    async geocodeLocation(location) {
        const cacheKey = `geocode:${location.toLowerCase()}`;
        
        // Check cache first
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        await this.rateLimit();

        try {
            const response = await fetch(
                `${CONFIG.endpoints.geocoding}?format=json&q=${encodeURIComponent(location)}&limit=1&addressdetails=1`
            );
            
            if (!response.ok) {
                throw new Error(`Geocoding API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data && data.length > 0) {
                const result = {
                    lat: parseFloat(data[0].lat),
                    lon: parseFloat(data[0].lon),
                    name: data[0].display_name,
                    address: data[0].address
                };
                
                // Cache the result
                this.cache.set(cacheKey, result);
                return result;
            }
            
            throw new Error('Location not found');
        } catch (error) {
            console.error('Geocoding error:', error);
            throw new Error(`Unable to find location: ${location}`);
        }
    }

    // Reverse geocode coordinates to location name
    async reverseGeocode(lat, lon) {
        const cacheKey = `reverse:${lat.toFixed(4)},${lon.toFixed(4)}`;
        
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        await this.rateLimit();

        try {
            const response = await fetch(
                `${CONFIG.endpoints.reverseGeocoding}?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`
            );
            
            if (!response.ok) {
                throw new Error(`Reverse geocoding API error: ${response.status}`);
            }
            
            const data = await response.json();
            const locationName = data.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
            
            this.cache.set(cacheKey, locationName);
            return locationName;
        } catch (error) {
            console.error('Reverse geocoding error:', error);
            return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
        }
    }

    // Get user's current location
    async getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by this browser'));
                return;
            }

            const options = {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 600000 // 10 minutes
            };

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const lat = position.coords.latitude;
                        const lon = position.coords.longitude;
                        const locationName = await this.reverseGeocode(lat, lon);
                        
                        resolve({
                            lat,
                            lon,
                            name: locationName,
                            accuracy: position.coords.accuracy
                        });
                    } catch (error) {
                        reject(error);
                    }
                },
                (error) => {
                    let errorMessage;
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Location access denied by user';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Location information unavailable';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Location request timed out';
                            break;
                        default:
                            errorMessage = 'An unknown error occurred';
                    }
                    reject(new Error(errorMessage));
                },
                options
            );
        });
    }

    // Detect climate zone based on coordinates
    detectClimateZone(lat) {
        const absLat = Math.abs(lat);
        
        if (absLat <= 30) return 'tropical';
        if (absLat <= 60) return 'temperate';
        return 'continental';
    }

    // Clear cache
    clearCache() {
        this.cache.clear();
    }
}

// Initialize geocoding service
const geocodingService = new GeocodingService();