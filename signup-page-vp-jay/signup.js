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

  if (!form) return; // Safety check

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Select Inputs
    const nameInput = form.querySelector('input[type="text"]');
    const emailInput = form.querySelector('input[type="email"]');
    const passwordInput = form.querySelector('input[type="password"]');

    const role = roleSelect.value;
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // Validation
    if (!role) return alert("Please select a role.");
    if (password.length < 6)
      return alert("Password must be at least 6 characters.");

    try {
      // Create User
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;
      console.log("User created:", user.uid);

      // Save Profile
      await set(ref(db, "users/" + user.uid), {
        username: name,
        email: email,
        role: role,
        createdAt: Date.now(),
      });

      // Save Local Session
      localStorage.setItem("freshEatsUserName", name);
      localStorage.setItem("freshEatsRole", role);

      alert("Account created successfully!");

      // Redirect
      if (role === "vendor") {
        window.location.href = "../home-page-vp-jay/vendor-home.html"; // Check this path!
      } else {
        window.location.href = "../home-page-vp-jay/patron-home.html"; // Check this path!
      }
    } catch (error) {
      console.error("Signup Error:", error);
      if (error.code === "auth/email-already-in-use") {
        alert("Email taken. Please log in.");
      } else {
        alert("Error: " + error.message);
      }
    }
  });
});
