const PRIVATE_KEY = "bf7eb9d0b9064f4c92874102261603";

const btn_submit = document.getElementById("trigger_search");
const field_input = document.getElementById("user_query");
const loader_ui = document.getElementById("status_msg");

const pull_weather_data = async (target_city) => {
  try {
    loader_ui.style.display = "block";

    // console.log("Requesting data for city:", target_city);

    const api_endpoint = `https://api.weatherapi.com/v1/current.json?key=${PRIVATE_KEY}&q=${target_city}&aqi=no`;
    const raw_output = await fetch(api_endpoint);

    if (!raw_output.ok) {
      throw new Error("Location not recognized.");
    }

    const json_payload = await raw_output.json();

    // console.log("Success ->", json_payload);

    render_stats(json_payload);
  } catch (err) {
    // console.log("System Error:", err.message);
    alert(err.message);
  } finally {
    loader_ui.style.display = "none";
  }
};

const render_stats = (processed_data) => {
  const current_temp = processed_data.current.temp_c;
  const current_desc = processed_data.current.condition.text;
  const city_string = processed_data.location.name;

  document.getElementById("loc_name").textContent = city_string;
  document.getElementById("temp_val").textContent =
    `${Math.floor(current_temp)}°`;
  document.getElementById("weather_label").textContent = current_desc;
};

btn_submit.addEventListener("click", () => {
  const query = field_input.value.trim();
  if (query) pull_weather_data(query);
});

field_input.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    const query = field_input.value.trim();
    if (query) pull_weather_data(query);
  }
});