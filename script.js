const API_KEY = "bf7eb9d0b9064f4c92874102261603"; // yeah I know this shouldn't be exposed... will fix later

// grabbing DOM elements (could probably group these better but meh)
const searchBtn = document.getElementById("trigger_search");
const inputBox = document.getElementById("user_query");
const statusEl = document.getElementById("status_msg");
const cardsWrap = document.getElementById("cards_container");
const themeBtn = document.getElementById("theme_toggle");

// filters / controls
const searchBox = document.getElementById("search_cards");
const filterDropdown = document.getElementById("filter_cards");
const sortDropdown = document.getElementById("sort_cards");

// app state (keeping it simple for now)
let cityList = [];

// default cities (just picked some random ones tbh)
const defaultCities = ["London", "New York", "Tokyo", "Sydney", "Dubai"];

const STORAGE_NAME = "smartCityDashboard";

/* --- local storage helpers --- */

// load from storage (if it breaks, just ignore and move on)
function loadFromStorage() {
  const raw = localStorage.getItem(STORAGE_NAME);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (err) {
    console.warn("localStorage parse failed... clearing maybe?", err);
    return null;
  }
}

// save only minimal stuff (no need to store temp etc.)
function persistCities() {
  const minimal = cityList.map(c => {
    return {
      name: c.name,
      isFavorite: c.isFavorite
    };
  });

  localStorage.setItem(STORAGE_NAME, JSON.stringify(minimal));
}


/* --- theme toggle --- */

themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("light-mode");

  // not super elegant but readable enough
  if (document.body.classList.contains("light-mode")) {
    themeBtn.textContent = "Toggle Dark Mode";
  } else {
    themeBtn.textContent = "Toggle Light Mode";
  }
});


/* --- API stuff --- */

// fetch weather (could add caching later maybe)
async function getWeather(cityName) {
  const url = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${cityName}&aqi=no`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("API failed for " + cityName); // quick error message
  }

  const json = await res.json();
  return json;
}


/* --- init --- */

async function initCities() {
  try {
    statusEl.style.display = "block";
    statusEl.innerHTML = "Loading weather data..."; // spinner kicks in via CSS

    let baseList = defaultCities.map(n => ({ name: n, isFavorite: false }));

    const saved = loadFromStorage();

    // prefer stored data if available
    if (saved && saved.length) {
      baseList = saved;
    }

    // fetch all cities (parallel requests)
    const requests = baseList.map(c => getWeather(c.name));
    const responses = await Promise.allSettled(requests);

    // build final list
    cityList = [];

    responses.forEach((res, idx) => {
      if (res.status === "fulfilled") {
        const d = res.value;

        cityList.push({
          id: d.location.name.toLowerCase(),
          name: d.location.name,
          temp_c: d.current.temp_c,
          condition: d.current.condition.text,
          isFavorite: baseList[idx].isFavorite
        });
      }
      // else ignore failed ones silently for now
    });

    // remove duplicates (kinda brute force but works)
    cityList = cityList.filter((item, index, arr) => {
      return index === arr.findIndex(t => t.id === item.id);
    });

    persistCities();
    renderUI();

  } catch (e) {
    console.error("init failed...", e);
  } finally {
    statusEl.style.display = "none";
    statusEl.textContent = "Connecting to server..."; // default idle text
  }
}


/* --- UI rendering --- */

function renderUI() {

  // search filter
  const q = searchBox.value.trim().toLowerCase();

  let visible = cityList.filter(c => {
    return c.name.toLowerCase().includes(q);
  });

  // extra filtering
  const filterVal = filterDropdown.value;

  visible = visible.filter(c => {
    if (filterVal === "warm") return c.temp_c > 20;
    if (filterVal === "cold") return c.temp_c <= 20;
    if (filterVal === "favorites") return c.isFavorite;

    return true; // default = all
  });

  // sorting (copy array first so original isn't messed up)
  const sortVal = sortDropdown.value;

  let sorted = visible.slice(); // shallow copy

  sorted.sort((a, b) => {
    if (sortVal === "temp_desc") return b.temp_c - a.temp_c;
    if (sortVal === "temp_asc") return a.temp_c - b.temp_c;

    if (sortVal === "alpha_asc") return a.name.localeCompare(b.name);
    if (sortVal === "alpha_desc") return b.name.localeCompare(a.name);

    return 0;
  });

  // render
  if (!sorted.length) {
    cardsWrap.innerHTML = `<p style="text-align:center;width:100%;">No cities matched.</p>`;
    return;
  }

  let html = "";

  sorted.forEach(city => {
    html += `
      <div class="weather-card">
        <div class="card-actions">
          <button class="action-btn btn-fav ${city.isFavorite ? 'active' : ''}" 
            onclick="toggleFav('${city.id}')">❤️</button>

          <button class="action-btn btn-del" 
            onclick="removeCity('${city.id}')">🗑️</button>
        </div>

        <h3 class="loc-name">${city.name}</h3>
        <p class="temp-val">${Math.floor(city.temp_c)}°</p>
        <p class="weather-label">${city.condition}</p>
      </div>
    `;
  });

  cardsWrap.innerHTML = html;
}


/* --- actions --- */

// toggle favorite (simple enough)
window.toggleFav = function (id) {
  const found = cityList.find(c => c.id === id);

  if (found) {
    found.isFavorite = !found.isFavorite;

    persistCities();
    renderUI();
  }
};


// remove city
window.removeCity = function (id) {
  cityList = cityList.filter(c => c.id !== id);

  persistCities();
  renderUI();
};


// add new city
async function addCity(name) {
  try {
    statusEl.style.display = "block";
    statusEl.textContent = "Fetching weather data...";

    const data = await getWeather(name);

    const cityObj = {
      id: data.location.name.toLowerCase(),
      name: data.location.name,
      temp_c: data.current.temp_c,
      condition: data.current.condition.text,
      isFavorite: false
    };

    // prevent duplicates (might optimize later)
    const exists = cityList.find(c => c.id === cityObj.id);

    if (!exists) {
      cityList.push(cityObj);
      persistCities();
    }

    inputBox.value = "";
    renderUI();

  } catch (err) {
    alert("City not found... or API issue?");
  } finally {
    statusEl.style.display = "none";
    statusEl.textContent = "Connecting to server...";
  }
}


/* --- debounce helper --- */

// basic debounce (I always end up rewriting this...)
function debounce(fn, wait) {
  let timer;

  return function (...args) {
    clearTimeout(timer);

    timer = setTimeout(() => {
      fn.apply(null, args);
    }, wait);
  };
}

const debouncedRender = debounce(renderUI, 300);


/* --- event bindings --- */

searchBox.addEventListener("input", debouncedRender);
filterDropdown.addEventListener("change", renderUI);
sortDropdown.addEventListener("change", renderUI);

searchBtn.addEventListener("click", () => {
  const val = inputBox.value.trim();

  if (val) {
    addCity(val);
  }
});

// enter key support (felt necessary)
inputBox.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    const val = inputBox.value.trim();

    if (val) addCity(val);
  }
});


/* --- boot --- */

// kick things off
document.addEventListener("DOMContentLoaded", initCities);
