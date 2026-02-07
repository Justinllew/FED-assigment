// 1. IMPORT
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getDatabase,
  ref,
  get,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// 2. CONFIG
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

// 3. INIT
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// 4. LOGIC
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("vendor-login-form");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const emailInput = form.querySelector('input[type="email"]');
    const passwordInput = form.querySelector('input[type="password"]');

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    try {
      // Authenticate
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // Check Database Role
      const snapshot = await get(ref(db, "users/" + user.uid));

      if (snapshot.exists()) {
        const userData = snapshot.val();

        if (userData.role === "vendor") {
          localStorage.setItem("freshEatsUserName", userData.username);
          localStorage.setItem("freshEatsRole", userData.role);

          alert("Welcome back, " + userData.username + "!");
          // Redirect (Ensure this file exists in the SAME folder, or adjust path)
          window.location.href = "/Vendor-home/vendor-home.html";
        } else {
          alert("Access Denied: You are a Patron.");
        }
      } else {
        alert("Error: User profile not found.");
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("Login Failed: " + error.message);
    }
  });
});
