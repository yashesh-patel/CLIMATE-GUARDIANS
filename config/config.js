// Configuration for WeatherWise Application
const CONFIG = {
  // API Keys
  openWeatherApiKey: "177ea533ef4a6bc8ebd91a637bf84ee6", // Replace with your actual key

  // Map settings
  map: {
    defaultCenter: [40.7128, -74.006], // New York
    defaultZoom: 10,
    maxZoom: 18,
    minZoom: 3,
  },

  // API Endpoints
  endpoints: {
    geocoding: "https://nominatim.openstreetmap.org/search",
    reverseGeocoding: "https://nominatim.openstreetmap.org/reverse",
    historicalWeather: "https://archive-api.open-meteo.com/v1/archive",
    currentWeather: "https://api.openweathermap.org/data/2.5/weather",
  },

  // Weather thresholds
  thresholds: {
    veryHot: 32, // °C - 89.6°F
    veryCold: 0, // °C - 32°F
    veryWindy: 7, // m/s - 15.7 mph
    veryWet: 10, // mm - 0.4 inches
  },

  // Application settings
  settings: {
    historicalYears: 20,
    cacheDuration: 30 * 60 * 1000,
    fallbackEnabled: true,
  },
};
