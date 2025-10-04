// Fallback data and climate models for when APIs are unavailable
const FALLBACK_CLIMATE_DATA = {
  // Climate models for different regions
  models: {
    tropical: {
      name: "Tropical",
      temperature: {
        annual: [24, 32],
        seasonal: {
          summer: [26, 34],
          winter: [22, 30],
        },
      },
      precipitation: {
        annual: [1500, 3000],
        monsoon: [200, 500],
        dry: [10, 50],
      },
      probabilities: {
        "very-hot": 65,
        "very-cold": 2,
        "very-windy": 25,
        "very-wet": 45,
        "very-uncomfortable": 55,
      },
    },
    temperate: {
      name: "Temperate",
      temperature: {
        annual: [5, 25],
        seasonal: {
          summer: [15, 30],
          winter: [-5, 10],
        },
      },
      precipitation: {
        annual: [600, 1200],
        distribution: "even",
      },
      probabilities: {
        "very-hot": 25,
        "very-cold": 20,
        "very-windy": 35,
        "very-wet": 30,
        "very-uncomfortable": 28,
      },
    },
    continental: {
      name: "Continental",
      temperature: {
        annual: [-10, 20],
        seasonal: {
          summer: [10, 25],
          winter: [-20, 0],
        },
      },
      precipitation: {
        annual: [400, 800],
        distribution: "summer_peak",
      },
      probabilities: {
        "very-hot": 15,
        "very-cold": 40,
        "very-windy": 30,
        "very-wet": 25,
        "very-uncomfortable": 22,
      },
    },
    arid: {
      name: "Arid/Desert",
      temperature: {
        annual: [15, 40],
        diurnal: [15, 25],
      },
      precipitation: {
        annual: [50, 250],
        irregular: true,
      },
      probabilities: {
        "very-hot": 70,
        "very-cold": 8,
        "very-windy": 50,
        "very-wet": 5,
        "very-uncomfortable": 45,
      },
    },
    mediterranean: {
      name: "Mediterranean",
      temperature: {
        annual: [10, 28],
        seasonal: {
          summer: [20, 35],
          winter: [5, 15],
        },
      },
      precipitation: {
        annual: [400, 800],
        distribution: "winter_peak",
      },
      probabilities: {
        "very-hot": 35,
        "very-cold": 10,
        "very-windy": 40,
        "very-wet": 20,
        "very-uncomfortable": 25,
      },
    },
  },

  // Major cities with pre-calculated climate data
  cities: {
    "New York": { model: "temperate", lat: 40.7128, lon: -74.006 },
    London: { model: "temperate", lat: 51.5074, lon: -0.1278 },
    Tokyo: { model: "temperate", lat: 35.6762, lon: 139.6503 },
    Sydney: { model: "temperate", lat: -33.8688, lon: 151.2093 },
    Mumbai: { model: "tropical", lat: 19.076, lon: 72.8777 },
    Dubai: { model: "arid", lat: 25.2048, lon: 55.2708 },
    Moscow: { model: "continental", lat: 55.7558, lon: 37.6173 },
    "Los Angeles": { model: "mediterranean", lat: 34.0522, lon: -118.2437 },
    Singapore: { model: "tropical", lat: 1.3521, lon: 103.8198 },
    Cairo: { model: "arid", lat: 30.0444, lon: 31.2357 },
  },

  // Seasonal adjustments for probabilities
  seasonalAdjustments: {
    northern: {
      winter: {
        "very-hot": -20,
        "very-cold": 25,
        "very-wet": 5,
        "very-windy": 10,
      },
      spring: {
        "very-hot": 5,
        "very-cold": -10,
        "very-wet": 15,
        "very-windy": 15,
      },
      summer: {
        "very-hot": 25,
        "very-cold": -20,
        "very-wet": 10,
        "very-windy": 5,
      },
      autumn: {
        "very-hot": -5,
        "very-cold": 5,
        "very-wet": 10,
        "very-windy": 10,
      },
    },
    southern: {
      summer: {
        "very-hot": 25,
        "very-cold": -20,
        "very-wet": 10,
        "very-windy": 5,
      },
      autumn: {
        "very-hot": -5,
        "very-cold": 5,
        "very-wet": 10,
        "very-windy": 10,
      },
      winter: {
        "very-hot": -20,
        "very-cold": 25,
        "very-wet": 5,
        "very-windy": 10,
      },
      spring: {
        "very-hot": 5,
        "very-cold": -10,
        "very-wet": 15,
        "very-windy": 15,
      },
    },
  },
};

// Utility functions for fallback data
const FallbackUtils = {
  // Get climate model for coordinates
  getClimateModel(lat, lon) {
    // Simple latitude-based model detection
    const absLat = Math.abs(lat);

    if (absLat < 23.5) return "tropical";
    if (absLat < 35) return Math.random() > 0.5 ? "arid" : "mediterranean";
    if (absLat < 50) return "temperate";
    if (absLat < 66.5) return "continental";
    return "continental"; // polar would be here in extended model
  },

  // Get seasonal adjustments
  getSeasonalAdjustment(lat, month) {
    const hemisphere = lat >= 0 ? "northern" : "southern";
    const seasons = FALLBACK_CLIMATE_DATA.seasonalAdjustments[hemisphere];

    let season;
    if (hemisphere === "northern") {
      if (month >= 2 && month <= 4) season = "spring";
      else if (month >= 5 && month <= 7) season = "summer";
      else if (month >= 8 && month <= 10) season = "autumn";
      else season = "winter";
    } else {
      if (month >= 8 && month <= 10) season = "spring";
      else if (month >= 11 || month <= 1) season = "summer";
      else if (month >= 2 && month <= 4) season = "autumn";
      else season = "winter";
    }

    return seasons[season] || {};
  },

  // Generate realistic probabilities based on location and date
  generateProbabilities(lat, lon, date) {
    const climateModel =
      FALLBACK_CLIMATE_DATA.models[this.getClimateModel(lat, lon)];
    const targetDate = new Date(date);
    const month = targetDate.getMonth();
    const adjustments = this.getSeasonalAdjustment(lat, month);

    const baseProbabilities = { ...climateModel.probabilities };

    // Apply seasonal adjustments
    Object.keys(adjustments).forEach((condition) => {
      if (baseProbabilities[condition] !== undefined) {
        baseProbabilities[condition] = Math.max(
          0,
          Math.min(100, baseProbabilities[condition] + adjustments[condition])
        );
      }
    });

    // Add some random variation (±10%)
    Object.keys(baseProbabilities).forEach((key) => {
      const variation = Math.random() * 20 - 10;
      baseProbabilities[key] = Math.max(
        0,
        Math.min(100, Math.round(baseProbabilities[key] + variation))
      );
    });

    baseProbabilities.totalYears = 25;
    baseProbabilities.dataSource = "Fallback-ClimateModel";

    return baseProbabilities;
  },

  // Get known city data if available
  getCityData(cityName) {
    return FALLBACK_CLIMATE_DATA.cities[cityName];
  },
};
