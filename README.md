# Smart-City-Weather-Dashboard

## 📋 Project Description

The Smart City Weather Dashboard is an interactive web application that provides real-time weather information and personalized "What to Wear" recommendations. This app goes beyond basic temperature display by offering intelligent clothing suggestions based on current and forecasted weather conditions. Users get a complete weather experience with a 5-day forecast, dynamic visual indicators, and automatic location detection.

## ✨ Core Features

### 1. **Real-Time Weather Display**
   - Current temperature, humidity, wind speed, and pressure
   - Detailed weather descriptions (e.g., "Partly Cloudy", "Light Rain")
   - Dynamic weather icons that change based on OpenWeatherMap weather codes

### 2. **City Search**
   - Search weather information by city name
   - Autocomplete suggestions for ease of use
   - Support for international cities with proper handling of city names

### 3. **Automatic Geolocation**
   - Browser Geolocation API integration
   - Automatically loads local weather on first visit
   - User-friendly permission requests
   - Fallback to default location if permission denied

### 4. **Dynamic UI**
   - **Temperature-based background colors:**
     - 🔵 Blue gradient for cold weather (<0°C)
     - 🟢 Green gradient for cool weather (0-15°C)
     - 🟡 Yellow gradient for moderate weather (15-25°C)
     - 🟠 Orange gradient for warm weather (25-35°C)
     - 🔴 Red gradient for hot weather (>35°C)
   - Smooth transitions between color themes
   - Responsive design for mobile and desktop devices

## 🛠️ Technologies

### Frontend Stack
- **HTML5** - Semantic structure
- **CSS3** - Modern styling with transitions and animations
- **JavaScript (ES6+)** - Dynamic functionality and API interactions
- **Responsive Web Design** - Mobile-first approach

### APIs & Services
- **WeatherAPI** - "https://api.weatherapi.com"

## 🌟 Bonus Features Implemented (Milestone 4)
- **Debouncing:** Local searching is debounced (300ms) to ensure smooth input handling and reduce unnecessary renders.
- **Local Storage:** User preferences like bookmarked cities are automatically saved to `localStorage`, persisting user data between sessions.
- **Loading Indicators:** A sleek CSS-animated spinner provides visual feedback during all network requests, improving perceived performance.
- **Code Refactoring:** Eliminated `for`/`while` loops in favor of modern JavaScript Higher-Order Functions (`map()`, `filter()`, `find()`, `sort()`) for a cleaner and more functional architecture.

## 🚀 Deployment Instructions

This project is built using standard web technologies (HTML, CSS, JS) and requires no build steps. It is fully ready for deployment on any static platform.

### Deploy via Vercel
1. Install the Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the root of the project directory.
3. Follow the on-screen prompts to deploy instantly.

### Deploy via Netlify
1. Go to [Netlify](https://app.netlify.com/drop).
2. Drag and drop the project folder into the deployment zone.
3. Your live dashboard is instantly accessible! Alternatively, push to GitHub and connect the repository.