const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

const API_KEY = "8cf40bf53c89c975bc8816ada17bfbb7"; // API key for OpenWeatherMap API

const createWeatherCard = (cityName, weatherItem, index) => {
    const selectedUnit = tempUnitSelect.value;
    const tempInCelsius = weatherItem.main.temp - 273.15; // Convert Kelvin to Celsius
    const temp = convertTemperature(tempInCelsius, selectedUnit).toFixed(2);
    const unitSymbol = selectedUnit === "fahrenheit" ? "°F" : "°C";
  
    if(index === 0) {
      return `<div class="details">
                  <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                  <h6>Temperature: ${temp}${unitSymbol}</h6>
                  <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                  <h6>Humidity: ${weatherItem.main.humidity}%</h6>
              </div>
              <div class="icon">
                  <i class="wi ${getWeatherIcon(weatherItem.weather[0].icon)}"></i>
                  <h6>${weatherItem.weather[0].description}</h6>
              </div>`;
    } else {
      return `<li class="card">
                  <div class="icon">
                      <i class="wi ${getWeatherIcon(weatherItem.weather[0].icon)}"></i>
                  </div>
                  <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
                  <h6>Temp: ${temp}${unitSymbol}</h6>
                  <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                  <h6>Humidity: ${weatherItem.main.humidity}%</h6>
              </li>`;
    }
  };  
function getWeatherIcon(conditionCode) {
    const iconMap = {
      '01d': 'wi-day-sunny',
      '01n': 'wi-night-clear',
      '02d': 'wi-day-cloudy',
      '02n': 'wi-night-alt-cloudy',
      '03d': 'wi-cloud',
      '03n': 'wi-cloud',
      '04d': 'wi-cloudy',
      '04n': 'wi-cloudy',
      '09d': 'wi-showers',
      '09n': 'wi-showers',
      '10d': 'wi-day-rain',
      '10n': 'wi-night-alt-rain',
      '11d': 'wi-thunderstorm',
      '11n': 'wi-thunderstorm',
      '13d': 'wi-snow',
      '13n': 'wi-snow',
      '50d': 'wi-fog',
      '50n': 'wi-fog',
    };
  
    return iconMap[conditionCode] || 'wi-na'; // Default to 'wi-na' if condition code is not found
  }
const convertTemperature = (temp, unit) => {
    if (unit === "fahrenheit") {
      return (temp * 9/5) + 32; // Celsius to Fahrenheit
    }
    return temp; // Default is Celsius
  };
const tempUnitSelect = document.getElementById("temp-unit");

tempUnitSelect.addEventListener("change", () => {
const selectedUnit = tempUnitSelect.value;

  // Refetch weather data to re-render cards with the selected unit
const cityName = cityInput.value || "Current Location"; // Use current input or fallback
  getWeatherDetails(cityName);
});

const getWeatherDetails = (cityName, latitude, longitude) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;
    loadingSpinner.style.display = "flex";
    fetch(WEATHER_API_URL).then(response => response.json()).then(data => {
        loadingSpinner.style.display = "none";
        // Filter the forecasts to get only one forecast per day
        const uniqueForecastDays = [];
        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if (!uniqueForecastDays.includes(forecastDate)) {
                return uniqueForecastDays.push(forecastDate);
            }
        });

        // Clearing previous weather data
        cityInput.value = "";
        currentWeatherDiv.innerHTML = "";
        weatherCardsDiv.innerHTML = "";

        // Creating weather cards and adding them to the DOM
        fiveDaysForecast.forEach((weatherItem, index) => {
            const iconClass = getWeatherIcon(weatherItem.weather[0].icon);
            const html = createWeatherCard(cityName, weatherItem, index, iconClass); // Pass iconClass
            if (index === 0) {
                currentWeatherDiv.insertAdjacentHTML("beforeend", html);
                document.querySelector('.current-weather .icon i').className = `wi ${iconClass}`; // Update current weather icon
            } else {
                weatherCardsDiv.insertAdjacentHTML("beforeend", html);
            }
        });
        
        document.querySelector('.weather-data').classList.add('loaded');        
    }).catch(() => {
        loadingSpinner.style.display = "none";
        alert("An error occurred while fetching the weather forecast!");
    });
}

const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (cityName === "") return;
    const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
    
    // Get entered city coordinates (latitude, longitude, and name) from the API response
    fetch(API_URL).then(response => response.json()).then(data => {
        if (!data.length) return alert(`No coordinates found for ${cityName}`);
        const { lat, lon, name } = data[0];
        getWeatherDetails(name, lat, lon);
    }).catch(() => {
        alert("An error occurred while fetching the coordinates!");
    });
}

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords; // Get coordinates of user location
            // Get city name from coordinates using reverse geocoding API
            const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
            fetch(API_URL).then(response => response.json()).then(data => {
                const { name } = data[0];
                getWeatherDetails(name, latitude, longitude);
            }).catch(() => {
                alert("An error occurred while fetching the city name!");
            });
        },
        error => { // Show alert if user denied the location permission
            if (error.code === error.PERMISSION_DENIED) {
                alert("Geolocation request denied. Please reset location permission to grant access again.");
            } else {
                alert("Geolocation request error. Please reset location permission.");
            }
        });
}

locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());