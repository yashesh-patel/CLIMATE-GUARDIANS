// Main application controller
class WeatherWiseApp {
  constructor() {
    this.map = null;
    this.marker = null;
    this.currentLocation = null;
    this.isLoading = false;

    this.init();
  }

  init() {
    this.createRealisticNightEarth(); // Create realistic night Earth first
    this.createStars(); // Create starfield background
    this.initializeMap();
    this.setupEventListeners();
    this.setDefaultDate();
    this.loadUserLocation();
  }

  // Create realistic night Earth with city lights
  createRealisticNightEarth() {
    const earthContainer = document.querySelector(".earth-container");
    if (!earthContainer) {
      console.warn("Earth container not found");
      return;
    }

    // Clear any existing content
    earthContainer.innerHTML = "";

    // Create main Earth sphere
    const earth = document.createElement("div");
    earth.className = "earth";

    // Create Earth base with dark continents
    const earthBase = document.createElement("div");
    earthBase.className = "earth-base";

    // Create city lights layer
    const earthLights = document.createElement("div");
    earthLights.className = "earth-lights";

    // Add subtle cloud layer
    const earthClouds = document.createElement("div");
    earthClouds.className = "earth-clouds";

    // Add atmospheric glow
    const earthAtmosphere = document.createElement("div");
    earthAtmosphere.className = "earth-atmosphere";

    // Add subtle highlight
    const earthHighlight = document.createElement("div");
    earthHighlight.className = "earth-highlight";

    // Assemble the Earth
    earth.appendChild(earthBase);
    earth.appendChild(earthLights);
    earth.appendChild(earthClouds);
    earth.appendChild(earthAtmosphere);
    earth.appendChild(earthHighlight);
    earthContainer.appendChild(earth);
  }

  // Create starfield background
  createStars() {
    const starsContainer = document.getElementById("stars-container");
    if (!starsContainer) {
      console.warn("Stars container not found");
      return;
    }

    const starCount = 400; // More stars for realistic space

    // Clear any existing stars
    starsContainer.innerHTML = "";

    for (let i = 0; i < starCount; i++) {
      const star = document.createElement("div");
      star.classList.add("star");

      // Random position
      const x = Math.random() * 100;
      const y = Math.random() * 100;

      // Different star sizes
      const size = Math.random() * 2 + 0.5;

      // Different brightness levels
      const brightness = Math.random() * 0.8 + 0.2;

      // Different twinkle speeds
      const duration = Math.random() * 4 + 2;
      const delay = Math.random() * 5;

      star.style.left = `${x}%`;
      star.style.top = `${y}%`;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.opacity = brightness;
      star.style.animationDelay = `${delay}s`;

      starsContainer.appendChild(star);
    }
  }

  initializeMap() {
    // Initialize the map with colorful tiles
    this.map = L.map("map").setView(
      CONFIG.map.defaultCenter,
      CONFIG.map.defaultZoom
    );

    // Use colorful OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: CONFIG.map.maxZoom,
      minZoom: CONFIG.map.minZoom,
    }).addTo(this.map);

    // Initialize marker with custom icon
    this.marker = L.marker(CONFIG.map.defaultCenter, {
      draggable: true,
    }).addTo(this.map);

    // Update location input when marker is dragged
    this.marker.on("dragend", async (e) => {
      const latlng = this.marker.getLatLng();
      await this.updateLocationFromCoordinates(latlng.lat, latlng.lng);
    });

    // Update marker when map is clicked
    this.map.on("click", async (e) => {
      this.marker.setLatLng(e.latlng);
      await this.updateLocationFromCoordinates(e.latlng.lat, e.latlng.lng);
    });
  }

  setupEventListeners() {
    // Form submission
    document
      .getElementById("weather-query-form")
      .addEventListener("submit", (e) => this.handleFormSubmit(e));

    // Current location button
    document
      .getElementById("current-location-btn")
      .addEventListener("click", () => this.useCurrentLocation());

    // Location input changes
    document
      .getElementById("location-input")
      .addEventListener("change", (e) => this.handleLocationInputChange(e));

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) =>
      this.handleKeyboardShortcuts(e)
    );
  }

  async handleFormSubmit(e) {
    e.preventDefault();

    if (this.isLoading) return;

    const locationInput = document.getElementById("location-input").value;
    const dateInput = document.getElementById("date-input").value;

    if (!locationInput || !dateInput) {
      this.showAlert("Please enter both location and date", "warning");
      return;
    }

    await this.getWeatherData(locationInput, dateInput);
  }

  async getWeatherData(location, date) {
    this.setLoading(true);

    try {
      // Geocode the location
      const geocoded = await geocodingService.geocodeLocation(location);
      this.currentLocation = geocoded;

      // Update map
      this.map.setView([geocoded.lat, geocoded.lon], 12);
      this.marker.setLatLng([geocoded.lat, geocoded.lon]);

      // Get current weather
      const currentWeather = await weatherService.getCurrentWeather(
        geocoded.lat,
        geocoded.lon
      );
      this.updateCurrentConditions(currentWeather);

      // Get historical probabilities
      const probabilities = await weatherService.getHistoricalWeather(
        geocoded.lat,
        geocoded.lon,
        date
      );

      // Display results
      this.displayResults(geocoded.name, date, probabilities, currentWeather);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      this.showAlert(error.message, "error");
    } finally {
      this.setLoading(false);
    }
  }

  async useCurrentLocation() {
    try {
      this.setLoading(true, "Finding your location...");

      const location = await geocodingService.getCurrentLocation();
      this.currentLocation = location;

      // Update UI
      document.getElementById("location-input").value = location.name;
      this.map.setView([location.lat, location.lon], 12);
      this.marker.setLatLng([location.lat, location.lon]);

      // Get current weather for this location
      const currentWeather = await weatherService.getCurrentWeather(
        location.lat,
        location.lon
      );
      this.updateCurrentConditions(currentWeather);
    } catch (error) {
      this.showAlert(error.message, "error");
    } finally {
      this.setLoading(false);
    }
  }

  async handleLocationInputChange(e) {
    const location = e.target.value.trim();

    // Only search for locations with reasonable length
    if (location.length > 2 && location.length < 50) {
      try {
        const geocoded = await geocodingService.geocodeLocation(location);
        this.map.setView([geocoded.lat, geocoded.lon], 12);
        this.marker.setLatLng([geocoded.lat, geocoded.lon]);
      } catch (error) {
        // Silently fail for typing - user might still be typing or location not found
        console.log(
          "Location search failed, user might still be typing:",
          location
        );
      }
    }
  }

  async updateLocationFromCoordinates(lat, lon) {
    try {
      const locationName = await geocodingService.reverseGeocode(lat, lon);
      document.getElementById("location-input").value = locationName;
      this.currentLocation = { lat, lon, name: locationName };
    } catch (error) {
      console.error("Error reverse geocoding:", error);
    }
  }

  updateCurrentConditions(weather) {
    const container = document.getElementById("current-conditions");

    if (!weather) {
      container.innerHTML =
        '<p class="text-muted text-center">Weather data unavailable</p>';
      return;
    }

    const iconUrl = weather.isFallback
      ? `https://openweathermap.org/img/wn/${weather.icon}@2x.png`
      : `https://openweathermap.org/img/wn/${weather.icon}@2x.png`;

    container.innerHTML = `
            <div class="current-conditions-card">
                <div class="weather-condition-icon">
                    <img src="${iconUrl}" alt="${
      weather.description
    }" style="width: 70px; height: 70px;">
                </div>
                <div class="temperature-display">${weather.temperature}°C</div>
                <div class="condition-description">${weather.description}</div>
                <div class="additional-info">
                    <div class="condition-item">
                        <span>Feels like:</span>
                        <span>${weather.feelsLike}°C</span>
                    </div>
                    <div class="condition-item">
                        <span>Humidity:</span>
                        <span>${weather.humidity}%</span>
                    </div>
                    <div class="condition-item">
                        <span>Wind:</span>
                        <span>${weather.windSpeed} m/s</span>
                    </div>
                    <div class="condition-item">
                        <span>Pressure:</span>
                        <span>${weather.pressure} hPa</span>
                    </div>
                    ${
                      weather.isFallback
                        ? '<div class="text-center mt-2"><small>Using fallback data</small></div>'
                        : ""
                    }
                </div>
            </div>
        `;
  }

  displayResults(location, date, probabilities, currentWeather) {
    // Update basic info
    document.getElementById(
      "results-location"
    ).textContent = `Location: ${location}`;
    document.getElementById("results-date").textContent = `Date: ${new Date(
      date
    ).toLocaleDateString()}`;

    // Remove the data source line
    document.getElementById("data-source").style.display = "none";

    // Update probability results
    this.updateProbabilityResults(probabilities);

    // Update overall risk
    this.updateRiskLevel(probabilities);

    // Update activity recommendation
    this.updateActivityRecommendation(probabilities, currentWeather);

    // Update charts
    this.updateCharts(location, probabilities);

    // Show results section with animation
    const resultsSection = document.getElementById("results-section");
    resultsSection.style.display = "block";
    resultsSection.classList.add("fade-in-up");

    // Scroll to results
    setTimeout(() => {
      resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  updateProbabilityResults(probabilities) {
    const container = document.getElementById("probability-results");
    container.innerHTML = "";

    const conditions = [
      {
        id: "very-hot",
        name: "Very Hot",
        icon: "thermometer-sun",
        param: ">32°C (90°F)",
      },
      {
        id: "very-cold",
        name: "Very Cold",
        icon: "thermometer-snow",
        param: "<0°C (32°F)",
      },
      {
        id: "very-windy",
        name: "Very Windy",
        icon: "wind",
        param: ">7 m/s (16 mph)",
      },
      {
        id: "very-wet",
        name: "Very Wet",
        icon: "cloud-rain-heavy",
        param: '>10 mm (0.4") rain',
      },
      {
        id: "very-uncomfortable",
        name: "Very Uncomfortable",
        icon: "emoji-dizzy",
        param: "Heat index >40°C",
      },
    ];

    conditions.forEach((condition) => {
      if (document.getElementById(condition.id).checked) {
        const probability = probabilities[condition.id] || 0;
        const color = this.getColorForProbability(probability);

        const col = document.createElement("div");
        col.className = "col-md-6 col-lg-4 mb-3 fade-in-up";
        col.style.animationDelay = `${conditions.indexOf(condition) * 0.1}s`;

        col.innerHTML = `
                    <div class="card h-100">
                        <div class="card-body text-center">
                            <div class="mb-2">
                                <i class="bi bi-${
                                  condition.icon
                                } weather-icon" style="font-size: 2.2rem; color: ${color};"></i>
                            </div>
                            <h5 class="card-title">${condition.name}</h5>
                            <div class="probability-value" style="color: ${color};">${probability}%</div>
                            <div class="probability-indicator">
                                <div class="probability-bar" style="width: ${probability}%; background-color: ${color};"></div>
                            </div>
                            <div class="parameter-description small text-muted mt-1">
                                ${condition.param}
                            </div>
                            <p class="card-text small text-muted mt-2">
                                ${this.getProbabilityDescription(
                                  condition.id,
                                  probability
                                )}
                            </p>
                        </div>
                    </div>
                `;

        container.appendChild(col);
      }
    });
  }

  updateRiskLevel(probabilities) {
    const values = Object.entries(probabilities)
      .filter(([key]) => key.startsWith("very-"))
      .map(([_, value]) => value);

    const maxProbability = Math.max(...values);
    const alert = document.getElementById("overall-risk-alert");
    const riskText = document.getElementById("overall-risk");

    let riskLevel, alertClass;

    if (maxProbability < 30) {
      riskLevel = "Low";
      alertClass = "risk-low";
    } else if (maxProbability < 60) {
      riskLevel = "Moderate";
      alertClass = "risk-moderate";
    } else {
      riskLevel = "High";
      alertClass = "risk-high";
    }

    riskText.textContent = riskLevel;
    alert.className = `alert ${alertClass}`;
  }

  updateActivityRecommendation(probabilities, currentWeather) {
    const activityType = document.getElementById("activity-type").value;
    const recommendation = this.generateRecommendation(
      activityType,
      probabilities,
      currentWeather
    );
    document.getElementById("activity-recommendation").textContent =
      recommendation;
  }

  updateCharts(location, probabilities) {
    const sampleData = chartManager.generateSampleData(
      this.currentLocation?.lat || CONFIG.map.defaultCenter[0],
      this.currentLocation?.lon || CONFIG.map.defaultCenter[1]
    );

    // Trends chart
    const trendsCtx = document.getElementById("trend-chart").getContext("2d");
    chartManager.createTrendsChart(trendsCtx, sampleData.trends, location);

    // Monthly chart
    const monthlyCtx = document
      .getElementById("monthly-chart")
      .getContext("2d");
    chartManager.createMonthlyChart(monthlyCtx, sampleData.monthly, location);
  }

  generateRecommendation(activityType, probabilities, currentWeather) {
    const values = Object.values(probabilities).filter(
      (val) => typeof val === "number"
    );
    const averageRisk = values.reduce((a, b) => a + b, 0) / values.length;

    let baseRecommendation = "Based on historical weather patterns, ";

    if (averageRisk < 25) {
      baseRecommendation +=
        "conditions are typically excellent for outdoor activities.";
    } else if (averageRisk < 50) {
      baseRecommendation +=
        "conditions are usually favorable, but be prepared for potential weather changes.";
    } else {
      baseRecommendation +=
        "there's a significant chance of adverse conditions. Consider having a backup plan.";
    }

    // Activity-specific advice
    const activityAdvice = {
      hiking:
        " For hiking, pay special attention to precipitation and wind conditions which can make trails dangerous.",
      beach:
        " For a beach day, temperature and precipitation are the most important factors for enjoyment.",
      fishing:
        " For fishing, wind conditions significantly impact water conditions and fish behavior.",
      picnic:
        " For a picnic, precipitation is your primary concern for comfort and food safety.",
      sightseeing:
        " For sightseeing, all weather factors can impact visibility, comfort, and photo opportunities.",
      camping:
        " For camping, consider all factors as you'll be exposed to elements for an extended period.",
      sports:
        " For outdoor sports, wind and precipitation are particularly important for performance and safety.",
    };

    if (activityType && activityAdvice[activityType]) {
      baseRecommendation += activityAdvice[activityType];
    }

    // Add current weather context
    if (currentWeather && !currentWeather.isFallback) {
      baseRecommendation += ` Current conditions: ${currentWeather.description.toLowerCase()}, ${
        currentWeather.temperature
      }°C.`;
    }

    return baseRecommendation;
  }

  getColorForProbability(probability) {
    if (probability < 30) return "#28a745"; // Green
    if (probability < 60) return "#ffc107"; // Yellow
    return "#dc3545"; // Red
  }

  getProbabilityDescription(condition, probability) {
    const descriptions = {
      "very-hot": "days above 32°C (90°F)",
      "very-cold": "days below 0°C (32°F)",
      "very-windy": "days above 7 m/s (16 mph)",
      "very-wet": 'days above 10 mm (0.4") rain',
      "very-uncomfortable": "uncomfortable weather days",
    };

    let level;
    if (probability < 20) level = "very low";
    else if (probability < 40) level = "low";
    else if (probability < 60) level = "moderate";
    else if (probability < 80) level = "high";
    else level = "very high";

    return `${level} probability of ${descriptions[condition]}`;
  }

  setDefaultDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById("date-input").valueAsDate = tomorrow;
  }

  async loadUserLocation() {
    // Try to get user's location on load
    setTimeout(() => {
      if (!this.currentLocation) {
        this.useCurrentLocation().catch(() => {
          // Silently fail - user might have denied location access
        });
      }
    }, 1000);
  }

  setLoading(
    loading,
    message = "Analyzing historical weather data for your location..."
  ) {
    this.isLoading = loading;

    const loadingIndicator = document.getElementById("loading-indicator");
    const submitBtn = document.getElementById("submit-btn");
    const submitSpinner = document.getElementById("submit-spinner");

    if (loading) {
      loadingIndicator.style.display = "block";
      submitBtn.disabled = true;
      submitSpinner.classList.remove("d-none");
      loadingIndicator.querySelector("p").textContent = message;
    } else {
      loadingIndicator.style.display = "none";
      submitBtn.disabled = false;
      submitSpinner.classList.add("d-none");
    }
  }

  showAlert(message, type = "info") {
    const alertClass = {
      info: "alert-info",
      warning: "alert-warning",
      error: "alert-danger",
      success: "alert-success",
    }[type];

    const alert = document.createElement("div");
    alert.className = `alert ${alertClass} alert-dismissible fade show`;
    alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

    // Insert at the top of main content
    const main = document.querySelector("main");
    main.insertBefore(alert, main.firstChild);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      if (alert.parentNode) {
        alert.remove();
      }
    }, 5000);
  }

  handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + Enter to submit form
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      document
        .getElementById("weather-query-form")
        .dispatchEvent(new Event("submit"));
    }

    // Escape to clear loading states
    if (e.key === "Escape" && this.isLoading) {
      this.setLoading(false);
    }
  }
}

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.weatherWiseApp = new WeatherWiseApp();
});

// Export for potential module use
if (typeof module !== "undefined" && module.exports) {
  module.exports = { WeatherWiseApp };
}
