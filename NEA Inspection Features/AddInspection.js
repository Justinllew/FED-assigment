const form = document.getElementById("schedule-form");

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const hawkerCentre = document.getElementById("Hawkercentre").value;
  const stallName = document.getElementById("stall").value;
  const inspectionDate = document.getElementById("date").value;
  const inspectorName = document.getElementById("inspector").value;
  const notes = document.getElementById("notes").value;

  console.log("Hawker Centre:", hawkerCentre);
  console.log("Stall Name:", stallName);
  console.log("Inspection Date:", inspectionDate);
  console.log("Inspector:", inspectorName);
  console.log("Notes:", notes);

  form.reset();
});
