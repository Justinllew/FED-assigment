const AddInspectBtn = document.getElementById("AddInspectBtn");

if (AddInspectBtn) {
  AddInspectBtn.addEventListener("click", function () {
    location.href = "AddInspection.html";
  });
}

const inspectButtons = document.querySelectorAll(".inspect-btn");

inspectButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    location.href = "InspectionForm.html";
  });
});
