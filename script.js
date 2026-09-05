const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");

const errorMessage = document.getElementById("errorMessage");
const locationName = document.getElementById("locationName");
const weatherDescription = document.getElementById("weatherDescription");
const temperature = document.getElementById("temperature");
const feelsLike = document.getElementById("feelsLike");
const weatherIcon = document.getElementById("weatherIcon");

const commuteAdvice = document.getElementById("commuteAdvice");
const commuteMessage = document.getElementById("commuteMessage");
const umbrellaAdvice = document.getElementById("umbrellaAdvice");
const clothingAdvice = document.getElementById("clothingAdvice");
const windSpeed = document.getElementById("windSpeed");
const humidity = document.getElementById("humidity");
const sunrise = document.getElementById("sunrise");
const sunset = document.getElementById("sunset");
const rainChance = document.getElementById("rainChance");

const weatherCodes = {
  0: ["Clear sky", "☀️"],
  1: ["Mainly clear", "🌤️"],
  2: ["Partly cloudy", "⛅"],
  3: ["Overcast", "☁️"],
  45: ["Foggy", "🌫️"],
  48: ["Foggy", "🌫️"],
  51: ["Light drizzle", "🌦️"],
  53: ["Drizzle", "🌦️"],
  55: ["Heavy drizzle", "🌧️"],
  61: ["Light rain", "🌦️"],
  63: ["Rain", "🌧️"],
  65: ["Heavy rain", "🌧️"],
  71: ["Light snow", "🌨️"],
  73: ["Snow", "❄️"],
  75: ["Heavy snow", "❄️"],
  80: ["Rain showers", "🌦️"],
  81: ["Rain showers", "🌧️"],
  82: ["Heavy rain showers", "⛈️"],
  95: ["Thunderstorm", "⛈️"],
  96: ["Thunderstorm with hail", "⛈️"],
  99: ["Severe thunderstorm", "⛈️"]
};

searchBtn.addEventListener("click", searchCity);

cityInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    searchCity();
  }
});

locationBtn.addEventListener("click", getUserLocation);

async function searchCity() {
  const city = cityInput.value.trim();

  if (!city) {
    showError("Please enter a city name.");
    return;
  }

  try {
    clearError();
    searchBtn.textContent = "Searching...";

    const locationResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
    );

    const locationData = await locationResponse.json();

    if (!locationData.results || locationData.results.length === 0) {
      throw new Error("City not found.");
    }

    const place = locationData.results[0];

    await getWeather(place.latitude, place.longitude, place.name);

  } catch (error) {
    showError(error.message);
  } finally {
    searchBtn.textContent = "Search";
  }
}

async function getWeather(latitude, longitude, cityName) {
  const weatherResponse = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&hourly=precipitation_probability&daily=sunrise,sunset&timezone=auto`
  );

  if (!weatherResponse.ok) {
    throw new Error("Unable to fetch weather data.");
  }

  const data = await weatherResponse.json();
  displayWeather(data, cityName);
}

function displayWeather(data, cityName) {
  const current = data.current;
  const daily = data.daily;

  const weatherInfo = weatherCodes[current.weather_code] || [
    "Unknown weather",
    "🌍"
  ];

  const rainProbability =
    data.hourly.precipitation_probability[0] ?? 0;

  locationName.textContent = cityName;
  weatherDescription.textContent = weatherInfo[0];
  weatherIcon.textContent = weatherInfo[1];

  temperature.textContent = `${Math.round(current.temperature_2m)}°C`;
  feelsLike.textContent =
    `Feels like ${Math.round(current.apparent_temperature)}°C`;

  windSpeed.textContent =
    `${Math.round(current.wind_speed_10m)} km/h`;

  humidity.textContent =
    `${current.relative_humidity_2m}%`;

  sunrise.textContent = formatTime(daily.sunrise[0]);
  sunset.textContent = formatTime(daily.sunset[0]);
  rainChance.textContent = `${rainProbability}%`;

  updateAdvice(
    current.temperature_2m,
    current.weather_code,
    rainProbability,
    current.wind_speed_10m
  );

  clearError();
}

function updateAdvice(temp, weatherCode, rainProbability, wind) {
  const isRainy = [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99]
    .includes(weatherCode);

  if (isRainy || rainProbability >= 50) {
    umbrellaAdvice.textContent = "Carry one ☔";
    commuteAdvice.textContent = "Rain may affect your journey";
    commuteMessage.textContent =
      "Carry an umbrella and allow extra travel time.";
  } else if (wind >= 35) {
    umbrellaAdvice.textContent = "Be careful 🌬️";
    commuteAdvice.textContent = "Windy conditions today";
    commuteMessage.textContent =
      "Take care while travelling, especially on two-wheelers.";
  } else {
    umbrellaAdvice.textContent = "Not needed ☀️";
    commuteAdvice.textContent = "Good weather for travelling";
    commuteMessage.textContent =
      "The weather looks comfortable for your daily commute.";
  }

  if (temp < 15) {
    clothingAdvice.textContent = "Wear a jacket 🧥";
  } else if (temp < 25) {
    clothingAdvice.textContent = "Light jacket";
  } else if (temp >= 35) {
    clothingAdvice.textContent = "Wear light clothes";
  } else {
    clothingAdvice.textContent = "Comfortable clothes";
  }
}

function formatTime(dateTime) {
  return new Date(dateTime).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function getUserLocation() {
  if (!navigator.geolocation) {
    showError("Geolocation is not supported by your browser.");
    return;
  }

  locationBtn.textContent = "Getting location...";

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const { latitude, longitude } = position.coords;

        await getWeather(
          latitude,
          longitude,
          "Your Current Location"
        );
      } catch (error) {
        showError("Unable to load your location's weather.");
      } finally {
        locationBtn.textContent = "📍 Use My Location";
      }
    },
    () => {
      showError("Please allow location access in your browser.");
      locationBtn.textContent = "📍 Use My Location";
    }
  );
}

function showError(message) {
  errorMessage.textContent = message;
}

function clearError() {
  errorMessage.textContent = "";
}