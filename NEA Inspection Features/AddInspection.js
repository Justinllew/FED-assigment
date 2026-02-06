// ===== POPULATE HAWKER CENTRE DROPDOWN =====
const centreSelect = document.getElementById("Hawkercentre");

fetch("HawkerCentresGEOJSON.geojson")
  .then((res) => res.json())
  .then((geojson) => {
    centreSelect.innerHTML = '<option value="">Select hawker centre</option>';

    geojson.features.forEach((feature) => {
      const centreName = feature.properties.NAME;
      const option = document.createElement("option");
      option.value = centreName;
      option.textContent = centreName;
      centreSelect.appendChild(option);
    });
  })
  .catch((err) => {
    console.error("Error loading local hawker centres:", err);
    centreSelect.innerHTML = '<option value="">Failed to load centres</option>';
  });

// ===== FORM SUBMIT =====
const form = document.getElementById("schedule-form");

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const hawkerCentre = centreSelect.value;
  const stallName = document.getElementById("stall").value;
  const inspectionDate = document.getElementById("date").value;
  const inspectorName = document.getElementById("inspector").value;
  const notes = document.getElementById("notes").value;

  console.log("Hawker Centre:", hawkerCentre);
  console.log("Stall Name:", stallName);
  console.log("Inspection Date:", inspectionDate);
  console.log("Inspector:", inspectorName);
  console.log("Notes:", notes);

  // Reset the form after submit
  form.reset();
});
