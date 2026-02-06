// ===== Score Controls =====
const decreaseBtn = document.getElementById("decrease");
const increaseBtn = document.getElementById("increase");
const scoreValue = document.getElementById("scoreValue");

let currentScore = parseInt(scoreValue.textContent);

// Decrease score
decreaseBtn.addEventListener("click", function () {
  if (currentScore > 0) {
    currentScore--;
    scoreValue.textContent = currentScore;
  }
});

// Increase score
increaseBtn.addEventListener("click", function () {
  if (currentScore < 100) {
    currentScore++;
    scoreValue.textContent = currentScore;
  }
});

// ===== Auto-fill stall name from Dashboard =====
document.addEventListener("DOMContentLoaded", function () {
  // Example: Dashboard passes selected stall via sessionStorage
  const selectedStall = sessionStorage.getItem("selectedStall");

  if (selectedStall) {
    document.getElementById("stallName").value = selectedStall;
  }
});

// ===== Form Submission =====
const inspectionForm = document.querySelector(".inspection-form");

inspectionForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const stallName = document.getElementById("stallName").value;
  const date = document.getElementById("inspectionDate").value;
  const score = currentScore;
  const comments = document.getElementById("comments").value;

  // Log for now
  console.log("Stall Name:", stallName);
  console.log("Date:", date);
  console.log("Hygiene Score:", score);
  console.log("Comments:", comments);

  // Clear form
  document.getElementById("inspectionDate").value = "";
  document.getElementById("comments").value = "";
  currentScore = 0;
  scoreValue.textContent = currentScore;

  // Remove the Dashboard row
  const inspectedRowId = sessionStorage.getItem("inspectedRowId");
  if (inspectedRowId) {
    const row = window.opener.document.getElementById(inspectedRowId);
    if (row) row.remove();
  }

  // Redirect back to Dashboard
  window.location.href = "DashboardInspect.html";
});
