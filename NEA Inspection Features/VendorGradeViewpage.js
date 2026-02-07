import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-database.js";

// --- Firebase config ---
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

// --- DOM Elements ---
const selectStall = document.getElementById("selectStall");
const gradeCircle = document.querySelector(".grade-circle");
const gradeLetter = document.querySelector(".grade-letter");
const awardDate = document.querySelector(".award-text h3");
const commentQuote = document.querySelector(".comment-quote");

// --- Grade calculation helper ---
function getGrade(score) {
  if (score >= 85) return { letter: "A", text: "Excellent", color: "#c0392b" };
  if (score >= 70) return { letter: "B", text: "Good", color: "#22c55e" };
  if (score >= 50) return { letter: "C", text: "Average", color: "#f59e0b" };
  return { letter: "F", text: "Fail", color: "#999" };
}

// --- Populate dropdown with stalls ---
const stallsRef = ref(database, "inspections");
onValue(stallsRef, (snapshot) => {
  const data = snapshot.val();
  if (!data) return;

  // Clear existing options except placeholder
  selectStall
    .querySelectorAll("option:not(:first-child)")
    .forEach((o) => o.remove());

  const uniqueStalls = new Set();
  Object.values(data).forEach((inspection) => {
    if (!uniqueStalls.has(inspection.stallName)) {
      uniqueStalls.add(inspection.stallName);
      const opt = document.createElement("option");
      opt.value = inspection.stallName;
      opt.textContent = inspection.stallName;
      selectStall.appendChild(opt);
    }
  });
});

// --- Update main grade when stall selected ---
selectStall.addEventListener("change", () => {
  const selectedStall = selectStall.value;
  if (!selectedStall) return;

  const inspectionsRef = ref(database, "inspections");
  onValue(inspectionsRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    // Find the most recent inspection for this stall
    const inspections = Object.values(data)
      .filter((i) => i.stallName === selectedStall)
      .sort((a, b) => new Date(b.inspectionDate) - new Date(a.inspectionDate));

    if (inspections.length === 0) return;

    const latest = inspections[0];
    const grade = getGrade(latest.score);

    // Update main grade circle
    gradeLetter.textContent = grade.letter;
    gradeCircle.style.backgroundColor = grade.color;

    // Update award date
    awardDate.textContent = latest.inspectionDate;

    // Update comment
    commentQuote.textContent = latest.comments || latest.notes || "No comments";
  });
});

// --- Add grade text beside past pills (static) ---
document.querySelectorAll(".history-item span.pill").forEach((pill) => {
  const text = pill.textContent.toLowerCase();
  let gradeText = "";
  if (text.includes("excellent")) gradeText = "A";
  else if (text.includes("good")) gradeText = "B";
  else if (text.includes("average")) gradeText = "C";

  pill.textContent = `${pill.textContent} (${gradeText})`;
});
