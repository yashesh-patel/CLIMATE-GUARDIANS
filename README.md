# 🌍 **CLIMATE GUARDIANS**
### _NASA Space Apps Challenge 2025 Project_  
**Historical Weather Probability Dashboard**

![GitHub Repo Size](https://img.shields.io/github/repo-size/<your-username>/CLIMATE_GUARDIANS?color=green)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Status](https://img.shields.io/badge/Status-Active-success)
![Tech Stack](https://img.shields.io/badge/Tech%20Stack-HTML%20%7C%20CSS%20%7C%20JS%20%7C%20NASA%20APIs-orange)

---

## 🛰️ **Overview**

**CLIMATE GUARDIANS** is an interactive web application that analyzes **historical weather data** to estimate the **probability of adverse weather conditions** (e.g., very hot, cold, windy, or wet) for any selected **location and date**.  

Built for the **NASA Space Apps Challenge 2025**, this project empowers users to make informed decisions about their **outdoor plans** using data from **NASA Earth observation missions** and global weather APIs.

---

## 🚀 **Features**

- 🌡️ **Weather Probability Analysis** — Predicts chances of extreme weather (heat, cold, rain, wind, etc.) based on NASA datasets and OpenWeather API.  
- 🗺️ **Interactive Map Search** — Choose locations via OpenStreetMap with zoom and click-to-select features.  
- 📅 **Date-based Querying** — Analyze conditions for any date, past or future.  
- 🧭 **Activity Recommendations** — Suggests whether your activity (like hiking, beach day, or sports) is favorable or risky.  
- 📊 **Visual Charts** — Displays historical trends and monthly averages using Chart.js.  
- 🪐 **Space-Themed UI** — Modern responsive Bootstrap 5 interface inspired by NASA design.  
- ⚙️ **Offline Fallback Mode** — Uses internal climate models when APIs are unavailable.  

---

## 🧩 **Tech Stack**

| Category | Tools & Libraries |
|-----------|------------------|
| **Frontend** | HTML5, CSS3, JavaScript (ES6) |
| **UI Framework** | Bootstrap 5, Bootstrap Icons |
| **Maps** | Leaflet.js, OpenStreetMap |
| **Charts** | Chart.js |
| **APIs** | NASA Earth Data, OpenWeatherMap, Open-Meteo Archive, Nominatim Geocoding |
| **Data Sources** | NASA GISTEMP, MODIS, MERRA-2, GPM, AIRS, TRMM |
| **Hosting** | GitHub Pages / Netlify |

---

## 🔑 **Configuration**

Edit the file **`config/config.js`** to set your API key and default settings:

```js
const CONFIG = {
  openWeatherApiKey: "YOUR_OPENWEATHER_API_KEY",
  map: {
    defaultCenter: [40.7128, -74.006], // Default: New York
    defaultZoom: 10,
  },
  endpoints: {
    geocoding: "https://nominatim.openstreetmap.org/search",
    reverseGeocoding: "https://nominatim.openstreetmap.org/reverse",
    historicalWeather: "https://archive-api.open-meteo.com/v1/archive",
    currentWeather: "https://api.openweathermap.org/data/2.5/weather",
  },
};
