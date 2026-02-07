// 1. IMPORT FIREBASE
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

// 2. CONFIGURE FIREBASE
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

// 3. INITIALIZE
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// 4. MAIN LOGIC
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("signup-form");
  const roleSelect = document.getElementById("role-select");
  const stallInputGroup = document.getElementById("stall-input-group");
  const stallNameInput = document.getElementById("stall-name");
  const loadingOverlay = document.getElementById("loading-overlay");
  const signupBtn = document.getElementById("signup-btn");

  if (!form) return;

  // A. Toggle Stall Name Input based on Role
  if (roleSelect) {
    roleSelect.addEventListener("change", () => {
      if (roleSelect.value === "vendor") {
        if (stallInputGroup) stallInputGroup.style.display = "block";
        if (stallNameInput) stallNameInput.setAttribute("required", "true");
      } else {
        if (stallInputGroup) stallInputGroup.style.display = "none";
        if (stallNameInput) {
          stallNameInput.removeAttribute("required");
          stallNameInput.value = "";
        }
      }
    });
  }

  // B. Handle Form Submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Disable button to prevent double submission
    signupBtn.disabled = true;
    signupBtn.textContent = "Creating account...";

    // Select Inputs
    const nameInput = document.getElementById("signup-name");
    const emailInput = document.getElementById("signup-email");
    const passwordInput = document.getElementById("signup-password");

    const role = roleSelect.value;
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const stallName = stallNameInput ? stallNameInput.value.trim() : "";

    // Validation
    if (!role) {
      alert("Please select a role (Vendor or Patron).");
      signupBtn.disabled = false;
      signupBtn.textContent = "Sign up";
      return;
    }

    if (!name) {
      alert("Please enter your name.");
      signupBtn.disabled = false;
      signupBtn.textContent = "Sign up";
      return;
    }

    if (!email) {
      alert("Please enter your email.");
      signupBtn.disabled = false;
      signupBtn.textContent = "Sign up";
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      signupBtn.disabled = false;
      signupBtn.textContent = "Sign up";
      return;
    }

    if (role === "vendor" && !stallName) {
      alert("Please enter your Stall Name.");
      signupBtn.disabled = false;
      signupBtn.textContent = "Sign up";
      return;
    }

    try {
      // Show loading overlay
      if (loadingOverlay) loadingOverlay.style.display = "flex";

      // 1. Create User in Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;
      console.log("User created:", user.uid);

      // 2. Prepare Data Object
      const userData = {
        username: name,
        email: email,
        role: role,
        createdAt: Date.now(),
      };

      // 3. IF VENDOR: Add specific vendor data
      if (role === "vendor") {
        userData.stallName = stallName;
        userData.description = ""; // Empty description by default
        userData.status = "Open";
        userData.statusMessage = "Open Now";
        userData.bannerUrl =
          "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000";
      }

      // 4. Save to Database
      await set(ref(db, "users/" + user.uid), userData);

      // 5. Save Local Session
      localStorage.setItem("freshEatsUserName", name);
      localStorage.setItem("freshEatsRole", role);

      if (loadingOverlay) loadingOverlay.style.display = "none";

      alert("Account created successfully! Welcome to FreshEats! 🎉");

      // 6. Redirect
      if (role === "vendor") {
        window.location.href = "../home-page-vp-jay/vendor-home.html";
      } else {
        window.location.href = "../home-page-vp-jay/patron-home.html";
      }
    } catch (error) {
      console.error("Signup Error:", error);

      if (loadingOverlay) loadingOverlay.style.display = "none";
      signupBtn.disabled = false;
      signupBtn.textContent = "Sign up";

      // Handle specific error codes
      if (error.code === "auth/email-already-in-use") {
        alert("This email is already registered. Please log in instead.");
      } else if (error.code === "auth/invalid-email") {
        alert("Invalid email address. Please check and try again.");
      } else if (error.code === "auth/weak-password") {
        alert("Password is too weak. Please use a stronger password.");
      } else {
        alert("Error creating account: " + error.message);
      }
    }
  });
});
