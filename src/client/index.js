import "./styles/style.scss";
import {
  formatCityName,
  calculateDaysUntilTrip,
  calculateTripDuration,
  fetchLocationDetails,
  fetchWeatherData,
  fetchCityImage,
  displayTripDetails,
  tripData,
} from "./js/app.js";

// Helper function to create and append elements
const createElement = (tag, className, innerHTML = "") => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (innerHTML) element.innerHTML = innerHTML;
  return element;
};

// Helper function to show a dialog
const showDialog = (title, message, buttons) => {
  const dialog = createElement("div", "action-dialog");
  dialog.innerHTML = `
    <div class="dialog-content">
      <h4><i class="fas fa-check-circle"></i> ${title}</h4>
      <p>${message}</p>
      <div class="dialog-buttons">
        ${buttons
          .map(
            (button) =>
              `<button id="${button.id}"><i class="${button.icon}"></i> ${button.label}</button>`
          )
          .join("")}
      </div>
    </div>
  `;
  document.body.appendChild(dialog);
  return dialog;
};

const createTripPreview = (tripData) => {
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const previewContainer = createElement("div", "trip-preview-overlay");
  previewContainer.innerHTML = `
    <div class="trip-preview">
      <div class="preview-header">
        <h2><i class="fas fa-plane-departure"></i> Trip to ${
          tripData.destination
        }</h2>
        <button class="close-preview"><i class="fas fa-times"></i></button>
      </div>
      <div class="preview-content">
        <div class="preview-image">
          <img src="${tripData.imageUrl}" alt="Image of ${
    tripData.destination
  }">
        </div>
        <div class="preview-details">
          <p><i class="fas fa-calendar-alt"></i> <strong>Departure:</strong> ${formatDate(
            tripData.departureDate
          )}</p>
          <p><i class="fas fa-calendar-check"></i> <strong>Return:</strong> ${formatDate(
            tripData.returnDate
          )}</p>
          <p><i class="fas fa-clock"></i> <strong>Trip Duration:</strong> ${
            tripData.tripDuration
          } days</p>
          <p><i class="fas fa-hourglass-half"></i> <strong>Trip Countdown:</strong> ${
            tripData.daysUntil
          } days</p>
          <p><i class="fas fa-temperature-high"></i> <strong>Temperature:</strong> ${
            tripData.temperature
          } °C</p>
          <hr>
          <div class="preview-actions">
            <button class="print-from-preview"><i class="fas fa-print"></i> Print</button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(previewContainer);

  // Add event listeners for preview actions
  previewContainer
    .querySelector(".close-preview")
    .addEventListener("click", () => {
      previewContainer.remove();
    });

  previewContainer
    .querySelector(".print-from-preview")
    .addEventListener("click", () => {
      printTripDetails(tripData);
    });
};

// Helper function to print trip details
const printTripDetails = (tripData) => {
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const printContent = `
    <html>
    <head>
      <title>Trip to ${tripData.destination}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
        .print-header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
        .print-content { display: flex; flex-wrap: wrap; }
        .print-image { margin-right: 20px; margin-bottom: 20px; }
        .print-image img { max-width: 100%; height: auto; max-height: 300px; }
        .print-details { flex: 1; min-width: 300px; }
        .print-details p { margin: 10px 0; }
        h1 { color: #3498db; }
        .print-footer { margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px; text-align: center; font-size: 0.8em; }
      </style>
    </head>
    <body>
      <div class="print-header">
        <h1>Trip to ${tripData.destination}</h1>
      </div>
      <div class="print-content">
        <div class="print-image">
          <img src="${tripData.imageUrl}" alt="Image of ${
    tripData.destination
  }">
        </div>
        <div class="print-details">
          <p><strong>Destination:</strong> ${tripData.destination}</p>
          <p><strong>Departure Date:</strong> ${formatDate(
            tripData.departureDate
          )}</p>
          <p><strong>Return Date:</strong> ${formatDate(
            tripData.returnDate
          )}</p>
          <p><strong>Trip Duration:</strong> ${tripData.tripDuration} days</p>
          <p><strong>Days Until Departure:</strong> ${
            tripData.daysUntil
          } days</p>
          <p><strong>Temperature at Destination:</strong> ${
            tripData.temperature
          } °C</p>
        </div>
      </div>
      <div class="print-footer">
        <p>This trip was planned using Travel Planner on ${new Date().toLocaleDateString()}</p>
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open("", "_blank");
  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.onload = () => printWindow.print();
};

// Initialize the application
window.onload = () => {
  try {
    const form = document.querySelector("form");
    const outputsDiv = document.querySelector(".outputs");

    if (!form || !outputsDiv) {
      console.error("Required elements not found in the DOM");
      return;
    }

    // Add Save and Remove buttons if they don't exist
    if (!document.querySelector(".buttons-container")) {
      const buttonsContainer = createElement("div", "buttons-container");
      const saveButton = createElement(
        "button",
        "save-button",
        '<i class="fas fa-save"></i> Save'
      );
      const removeButton = createElement(
        "button",
        "remove-button",
        '<i class="fas fa-trash"></i> Remove'
      );

      buttonsContainer.append(saveButton, removeButton);
      outputsDiv.appendChild(buttonsContainer);

      saveButton.addEventListener("click", () => {
        if (Object.keys(tripData).length > 0) {
          const savedTrips = JSON.parse(
            localStorage.getItem("savedTrips") || "[]"
          );
          savedTrips.push({ ...tripData, savedAt: new Date().toISOString() });
          localStorage.setItem("savedTrips", JSON.stringify(savedTrips));

          const dialog = showDialog(
            "Trip saved successfully!",
            "What would you like to do next?",
            [
              { id: "preview-trip", icon: "fas fa-eye", label: "Preview Trip" },
              { id: "print-trip", icon: "fas fa-print", label: "Print Trip" },
              { id: "close-dialog", icon: "fas fa-times", label: "Close" },
            ]
          );

          dialog
            .querySelector("#preview-trip")
            .addEventListener("click", () => {
              createTripPreview(tripData);
              dialog.remove();
            });

          dialog.querySelector("#print-trip").addEventListener("click", () => {
            printTripDetails(tripData);
            dialog.remove();
          });

          dialog
            .querySelector("#close-dialog")
            .addEventListener("click", () => {
              dialog.remove();
            });
        } else {
          alert("No trip details to save. Please search for a trip first.");
        }
      });

      removeButton.addEventListener("click", () => {
        const elementsToClear = [
          "trip-length",
          "trip-countdown",
          "weather-forecast",
          "weather-image",
        ];
        elementsToClear.forEach((id) => {
          const element = document.getElementById(id);
          if (element) element.textContent = "";
        });

        form.reset();
        Object.keys(tripData).forEach((key) => delete tripData[key]);
        alert("Trip removed!");
      });
    }

    // Handle form submission
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const resultsArea = document.querySelector(".outputs");
      if (resultsArea) resultsArea.classList.add("loading");

      try {
        const cityName = document.getElementById("country").value;
        const departureDate = document.getElementById("travel-date").value;
        const returnDate = document.getElementById("return-date").value;

        if (!cityName || !departureDate || !returnDate) {
          throw new Error("Please fill out all fields");
        }

        tripData.destination = cityName;
        tripData.daysUntil = calculateDaysUntilTrip(departureDate);
        tripData.departureDate = departureDate;
        tripData.returnDate = returnDate;
        calculateTripDuration(departureDate, returnDate);

        await fetchLocationDetails(formatCityName(cityName))
          .then((locationData) =>
            fetchWeatherData(locationData.lat, locationData.lng)
          )
          .catch((error) =>
            console.error("Error fetching location/weather data:", error)
          );

        await fetchCityImage(cityName).catch((error) =>
          console.error("Error fetching city image:", error)
        );

        displayTripDetails();
      } catch (error) {
        console.error("Error processing trip:", error);
        alert(`Error: ${error.message || "Failed to process trip"}`);
      } finally {
        if (resultsArea) resultsArea.classList.remove("loading");
      }
    });
  } catch (error) {
    console.error("Error initializing application:", error);
  }
};