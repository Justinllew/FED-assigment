// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-analytics.js";
import {
  getDatabase,
  ref,
  push,
  set,
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-database.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);

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

const form = document.getElementById("schedule-form");

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const hawkerCentre = centreSelect.value;
  const stallName = document.getElementById("stall").value;
  const inspectionDate = document.getElementById("date").value;
  const inspectorName = document.getElementById("inspector").value;
  const notes = document.getElementById("notes").value;

  const inspectionRef = ref(database, "inspections");
  const newinspectionRef = push(inspectionRef);
  set(newinspectionRef, {
    hawkerCentre,
    stallName,
    inspectionDate,
    inspectorName,
    notes,
  })
    .then(() => {
      console.log("Hawker Centre:", hawkerCentre);
      console.log("Stall Name:", stallName);
      console.log("Inspection Date:", inspectionDate);
      console.log("Inspector:", inspectorName);
      console.log("Notes:", notes);
      form.reset();
      location.href = "dashboardInspect.html";
    })
    .catch((error) => {
      console.error("Error Saving:", error);
      alert("Could not schedule inspection. Please try again");
    });
});
