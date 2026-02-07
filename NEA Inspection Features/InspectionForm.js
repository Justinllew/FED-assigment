import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import {
  getDatabase,
  ref,
  update,
  get,
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

const urlParameters = new URLSearchParams(location.search);
const InspectionId = urlParameters.get("id");
const stallNameURL = urlParameters.get("stall");

const decreaseBtn = document.getElementById("decrease");
const increaseBtn = document.getElementById("increase");
const scoreValue = document.getElementById("scoreValue");

let currentScore = parseInt(scoreValue.textContent);

// Decrease score
decreaseBtn.addEventListener("click", () => {
  if (currentScore > 0) currentScore--;
  scoreValue.textContent = currentScore;
});

// Increase score
increaseBtn.addEventListener("click", () => {
  if (currentScore < 100) currentScore++;
  scoreValue.textContent = currentScore;
});

// ===== Auto-fill stall name from Dashboard =====
document.addEventListener("DOMContentLoaded", () => {
  if (stallNameURL) {
    document.getElementById("stallName").value = stallNameURL;
  }

  if (!InspectionId) return;

  const inspectionRef = ref(database, `inspections/${InspectionId}`);

  get(inspectionRef).then((snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      document.getElementById("stallName").value = data.stallName || "";
      document.getElementById("inspectionDate").value =
        data.inspectionDate || "";
      currentScore = data.score || 0;
      scoreValue.textContent = currentScore;
    }
  });
});

// ===== Form Submission =====
const inspectionForm = document.querySelector(".inspection-form");

inspectionForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const stallName = document.getElementById("stallName").value;
  const date = document.getElementById("inspectionDate").value;
  const score = currentScore;
  const comments = document.getElementById("comments").value;

  // Update Firebase and mark as graded
  update(ref(database, `inspections/${InspectionId}`), {
    score: score,
    comments: comments,
    graded: true, // <-- this is the new line
  }).then(() => {
    // Redirect back to dashboard
    location.href = "dashboardInspect.html";
  });
});
