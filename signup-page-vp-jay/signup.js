import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// CONFIGURATION
const firebaseConfig = {
  apiKey: "AIzaSyA8zDkXrfnzEE6OpvEAATqNliz9FBYxOPo",
  authDomain: "hawkerbase-fedasg.firebaseapp.com",
  databaseURL:
    "https://hawkerbase-fedasg-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "hawkerbase-fedasg",
  storageBucket: "hawkerbase-fedasg.firebasestorage.app",
  messagingSenderId: "216203478131",
  appId: "1:216203478131:web:cb0ff58ba3f51911de9606",
  measurementId: "G-T2CVBCSMV4",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("signup-form");
  const roleSelect = document.getElementById("role-select");

  // Elements for Vendor logic
  const stallInputGroup = document.getElementById("stall-input-group"); // Make sure this ID exists in HTML
  const stallNameInput = document.getElementById("stall-name");

  if (!form) return;

  // 1. Toggle Stall Name Visibility
  if (roleSelect && stallInputGroup) {
    roleSelect.addEventListener("change", () => {
      if (roleSelect.value === "vendor") {
        stallInputGroup.style.display = "block";
        stallNameInput.setAttribute("required", "true");
      } else {
        stallInputGroup.style.display = "none";
        stallNameInput.removeAttribute("required");
        stallNameInput.value = "";
      }
    });
  }

  // 2. Handle Submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Get Values
    const name = document
      .querySelector('input[placeholder="Name"]')
      .value.trim();
    const email = document.querySelector('input[type="email"]').value.trim();
    const password = document
      .querySelector('input[type="password"]')
      .value.trim();
    const role = roleSelect.value;

    // Get Stall Name (if visible)
    const stallName = stallNameInput ? stallNameInput.value.trim() : "";

    // Validation
    if (!role) return alert("Please select a role.");
    if (password.length < 6)
      return alert("Password must be at least 6 characters.");
    if (role === "vendor" && !stallName)
      return alert("Please enter your Stall Name.");

    try {
      // Create Auth User
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // Prepare Data Object (Separation of concerns)
      const userData = {
        username: name,
        email: email,
        role: role,
        createdAt: Date.now(),
      };

      // Vendor Specific Data
      if (role === "vendor") {
        userData.stallName = stallName;
        userData.status = "Open";
        userData.statusMessage = "Open Now";
        userData.bannerUrl =
          "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000";
      }

      // Write to Database
      await set(ref(db, "users/" + user.uid), userData);

      // Session Storage
      localStorage.setItem("freshEatsUserName", name);
      localStorage.setItem("freshEatsRole", role);

      alert("Account created successfully!");

      // Redirect Logic
      if (role === "vendor") {
        window.location.href = "../home-page-vp-jay/vendor-home.html";
      } else {
        window.location.href = "../home-page-vp-jay/patron-home.html";
      }
    } catch (error) {
      console.error("Signup Error:", error);
      if (error.code === "auth/email-already-in-use") {
        alert("Email is already registered. Please log in.");
      } else {
        alert("Error: " + error.message);
      }
    }
  });
});
