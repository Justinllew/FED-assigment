import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyD_KhKzAe9NR7XkUQ2ZF_bzX6K-AR7M_Zc",
  authDomain: "fed-asg-nea-inspector-database.firebaseapp.com",
  databaseURL:
    "https://fed-asg-nea-inspector-database-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "fed-asg-nea-inspector-database",
  storageBucket: "fed-asg-nea-inspector-database.firebasestorage.app",
  messagingSenderId: "345844365046",
  appId: "1:345844365046:web:de8e6a08657a1e82859ed7",
  measurementId: "G-5KVYK0HM4Y",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const AddInspectBtn = document.getElementById("AddInspectBtn");
if (AddInspectBtn) {
  AddInspectBtn.addEventListener("click", () => {
    location.href = "AddInspection.html";
  });
}

const inspectionList = document.querySelector(".inspection-list");

if (inspectionList) {
  const inspectionsRef = ref(database, "inspections"); // points to your Firebase node

  onValue(inspectionsRef, (snapshot) => {
    const data = snapshot.val();

    inspectionList
      .querySelectorAll(".inspection-row:not(.header)")
      .forEach((row) => row.remove());

    if (data) {
      Object.entries(data).forEach(([id, inspection]) => {
        // Skip inspections that have been graded
        if (inspection.graded) return;

        const row = document.createElement("div");
        row.classList.add("inspection-row");

        row.innerHTML = `
      <span>${inspection.hawkerCentre}</span>
      <span>${inspection.stallName}</span>
      <span>${inspection.inspectionDate}</span>
      <button class="inspect-btn">Inspect</button>
    `;

        row.querySelector(".inspect-btn").addEventListener("click", () => {
          location.href = `InspectionForm.html?id=${id}&stall=${inspection.stallName}`;
        });

        inspectionList.appendChild(row);
      });
    }
  });
}
