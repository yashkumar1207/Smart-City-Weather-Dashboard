const PRIVATE_KEY = "bf7eb9d0b9064f4c92874102261603";

// UI Elements
const btn_submit = document.getElementById("trigger_search");
const field_input = document.getElementById("user_query");
const loader_ui = document.getElementById("status_msg");
const cards_container = document.getElementById("cards_container");
const theme_toggle = document.getElementById("theme_toggle");

// Controls
const search_input = document.getElementById("search_cards");
const filter_select = document.getElementById("filter_cards");
const sort_select = document.getElementById("sort_cards");

// Application State
let citiesData = [];

// Initial Load
const initialCities = ["London", "New York", "Tokyo", "Sydney", "Dubai"];

// Toggle Theme (Dark / Light Mode)
theme_toggle.addEventListener("click", () => {
  document.body.classList.toggle("light-mode");
  if (document.body.classList.contains("light-mode")) {
    theme_toggle.textContent = "Toggle Dark Mode";
  } else {
    theme_toggle.textContent = "Toggle Light Mode";
  }
});

// Fetch Single City Data
const fetchCityWeather = async (target_city) => {
  const api_endpoint = `https://api.weatherapi.com/v1/current.json?key=${PRIVATE_KEY}&q=${target_city}&aqi=no`;
  const response = await fetch(api_endpoint);
  if (!response.ok) throw new Error(`Could not fetch data for ${target_city}`);
  return await response.json();
};

// Load initial set of records
const loadInitialCities = async () => {
  try {
    loader_ui.style.display = "block";
    
    // Use Array.map to fetch concurrent requests via Promise.all
    const promises = initialCities.map((city) => fetchCityWeather(city));
    const results = await Promise.all(promises);
    
    // Transform raw JSON into our state objects using Array.map
    citiesData = results.map((data) => ({
      id: data.location.name.toLowerCase(),
      name: data.location.name,
      temp_c: data.current.temp_c,
      condition: data.current.condition.text,
      isFavorite: false
    }));
    
    updateUI();
  } catch (err) {
    console.error("Initialization Error:", err);
  } finally {
    loader_ui.style.display = "none";
  }
};

const updateUI = () => {
  // 1. Array Higher-Order Function: filter() for searching
  const query = search_input.value.trim().toLowerCase();
  let displayedList = citiesData.filter((city) => 
    city.name.toLowerCase().includes(query)
  );
  
  // 2. Array Higher-Order Function: filter() for specific criteria
  const filterVal = filter_select.value;
  displayedList = displayedList.filter((city) => {
    if (filterVal === "all") return true;
    if (filterVal === "warm") return city.temp_c > 20;
    if (filterVal === "cold") return city.temp_c <= 20;
    if (filterVal === "favorites") return city.isFavorite;
    return true;
  });
  
  // 3. Array Higher-Order Function: sort() for arranging data
  const sortVal = sort_select.value;
  // We use .slice() to avoid mutating the original filtered array
  displayedList = displayedList.slice().sort((a, b) => {
    if (sortVal === "temp_desc") return b.temp_c - a.temp_c;
    if (sortVal === "temp_asc") return a.temp_c - b.temp_c;
    if (sortVal === "alpha_asc") return a.name.localeCompare(b.name);
    if (sortVal === "alpha_desc") return b.name.localeCompare(a.name);
    return 0; // default
  });
  
  // 4. Array Higher-Order Function: map() for rendering HTML
  if (displayedList.length === 0) {
    cards_container.innerHTML = `<p style="text-align:center;width:100%;color:var(--text-color);">No cities matched.</p>`;
    return;
  }
  
  const htmlStrings = displayedList.map((city) => `
    <div class="weather-card">
      <div class="card-actions">
        <button class="action-btn btn-fav ${city.isFavorite ? 'active' : ''}" onclick="toggleFavorite('${city.id}')" title="Like / Favorite">❤️</button>
        <button class="action-btn btn-del" onclick="deleteCity('${city.id}')" title="Remove">🗑️</button>
      </div>
      <h3 class="loc-name">${city.name}</h3>
      <p class="temp-val">${Math.floor(city.temp_c)}°</p>
      <p class="weather-label">${city.condition}</p>
    </div>
  `);
  
  cards_container.innerHTML = htmlStrings.join('');
};

// Global Handlers for inline interactions
window.toggleFavorite = (id) => {
  // Use find() HOF instead of loop
  const city = citiesData.find((c) => c.id === id);
  if(city) {
    city.isFavorite = !city.isFavorite;
    updateUI();
  }
};

window.deleteCity = (id) => {
  // Use filter() HOF instead of loop to remove an item
  citiesData = citiesData.filter((c) => c.id !== id);
  updateUI();
};

const handleAddCity = async (cityName) => {
    try {
        loader_ui.style.display = "block";
        const data = await fetchCityWeather(cityName);
        const newCity = {
          id: data.location.name.toLowerCase(),
          name: data.location.name,
          temp_c: data.current.temp_c,
          condition: data.current.condition.text,
          isFavorite: false
        };
        
        // Prevent duplicate adds using find()
        if (!citiesData.find((c) => c.id === newCity.id)) {
            citiesData.push(newCity);
        }
        
        field_input.value = '';
        updateUI();
    } catch (err) {
        alert("Could not find condition data for this city.");
    } finally {
        loader_ui.style.display = "none";
    }
};

// Event Listeners for UI Features
search_input.addEventListener("input", updateUI);
filter_select.addEventListener("change", updateUI);
sort_select.addEventListener("change", updateUI);

btn_submit.addEventListener("click", () => {
  const query = field_input.value.trim();
  if (query) handleAddCity(query);
});

field_input.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    const query = field_input.value.trim();
    if (query) handleAddCity(query);
  }
});

// Ignite
document.addEventListener("DOMContentLoaded", loadInitialCities);