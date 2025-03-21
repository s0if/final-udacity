// Trip and location data storage
const tripData = {};
const locationData = {};

// Format city name for URL encoding
const formatCityName = (city) => encodeURIComponent(city);

// Calculate days until trip
const calculateDaysUntilTrip = (departureDate) => {
  const today = new Date();
  const travelDay = new Date(departureDate);
  return Math.ceil((travelDay - today) / (1000 * 60 * 60 * 24));
};

// Fetch location details from GeoNames API
const fetchLocationDetails = async (city) => {
  try {
    if (!city) throw new Error("City name is required");

    const response = await fetch(
      `http://api.geonames.org/searchJSON?q=${city}&maxRows=1&username=baraa00`
    );

    if (!response.ok) throw new Error(`GeoNames API error: ${response.status}`);

    const data = await response.json();

    if (!data.geonames || data.geonames.length === 0) {
      throw new Error("No location data found for the given city");
    }

    const { lat, lng } = data.geonames[0];
    locationData.lat = lat;
    locationData.lng = lng;

    return { lat, lng };
  } catch (error) {
    console.error("Error fetching location details:", error);
    locationData.lat = "34.0522"; // Default: Los Angeles coordinates
    locationData.lng = "-118.2437";
    return locationData;
  }
};

// Fetch weather data from Weatherbit API
const fetchWeatherData = async (lat, lng) => {
  const apiKey = "f9720339199b43d0896b098bb3e8e311";

  try {
    if (!lat || !lng) throw new Error("Latitude and longitude are required");

    const apiUrl =
      tripData.daysUntil <= 7
        ? `https://api.weatherbit.io/v2.0/current?lat=${lat}&lon=${lng}&key=${apiKey}&include=minutely`
        : `https://api.weatherbit.io/v2.0/forecast/daily?lat=${lat}&lon=${lng}&key=${apiKey}`;

    const response = await fetch(apiUrl);

    if (!response.ok) throw new Error(`Weatherbit API error: ${response.status}`);

    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      throw new Error("No weather data found");
    }

    tripData.temperature =
      tripData.daysUntil <= 7
        ? data.data[0].app_temp
        : data.data[0].app_max_temp;

    return data;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    tripData.temperature = 22.5; // Default temperature
    return { temperature: tripData.temperature };
  }
};

// Fetch city image from Pixabay API
const fetchCityImage = async (city) => {
  const apiKey = "49425021-4ccb9ab92174c33cc6e88088e";

  try {
    if (!city) throw new Error("City name is required");

    const response = await fetch(
      `https://pixabay.com/api/?key=${apiKey}&q=${city}&image_type=photo&min_width=800&min_height=800`
    );

    if (!response.ok) throw new Error(`Pixabay API error: ${response.status}`);

    const data = await response.json();

    if (!data.hits || data.hits.length === 0) {
      throw new Error("No images found for the given city");
    }

    tripData.imageUrl = data.hits[0].previewURL;
    return data;
  } catch (error) {
    console.error("Error fetching city image:", error);
    tripData.imageUrl =
      "https://pixabay.com/get/g4f7c3af632abb03b99fa58e4ce0e3e88cec9dc4acf548c1af4a92c98e26aa83f66a598e00e0e8e3d9267efcae48c9cf0_640.jpg"; // Default image
    return { imageUrl: tripData.imageUrl };
  }
};

// Calculate trip duration
const calculateTripDuration = (departureDate, returnDate) => {
  try {
    if (!departureDate || !returnDate) {
      throw new Error("Both departure and return dates are required");
    }

    const start = new Date(departureDate);
    const end = new Date(returnDate);

    if (end < start) throw new Error("Return date cannot be before departure date");

    tripData.tripDuration = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return tripData.tripDuration;
  } catch (error) {
    console.error("Error calculating trip duration:", error);
    tripData.tripDuration = 7; // Default duration
    return tripData.tripDuration;
  }
};

// Display trip details in the UI
const displayTripDetails = () => {
  try {
    const imgElement = document.getElementById("weather-image");
    const durationElement = document.getElementById("trip-length");
    const countdownElement = document.getElementById("trip-countdown");
    const weatherElement = document.getElementById("weather-forecast");

    if (imgElement && tripData.imageUrl) {
      imgElement.src = tripData.imageUrl;
      imgElement.alt = `Image of ${tripData.destination || "destination"}`;
    }

    if (durationElement) {
      durationElement.textContent = `Trip Length: ${tripData.tripDuration} days`;
    }

    if (countdownElement) {
      countdownElement.textContent = `Trip Countdown: ${tripData.daysUntil} days`;
    }

    if (weatherElement) {
      weatherElement.textContent = `Weather forecast: ${tripData.temperature} °C`;
    }
  } catch (error) {
    console.error("Error displaying trip details:", error);
  }
};

// Export functions and data
export {
  formatCityName,
  calculateDaysUntilTrip,
  calculateTripDuration,
  fetchLocationDetails,
  fetchWeatherData,
  fetchCityImage,
  displayTripDetails,
  tripData,
  locationData,
};