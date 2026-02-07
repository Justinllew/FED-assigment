// 1. IMPORT
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
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
  const form = document.querySelector("form");

  if (!form) {
    console.error("Form not found!");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const emailInput = form.querySelector('input[type="email"]');
    const passwordInput = form.querySelector('input[type="password"]');

    if (!emailInput || !passwordInput) {
      alert("Email or password field not found");
      return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      alert("Please enter both email and password");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      const snapshot = await get(ref(db, "users/" + user.uid));

      if (snapshot.exists()) {
        const userData = snapshot.val();

        if (userData.role === "patron") {
          localStorage.setItem("freshEatsUserName", userData.username);
          localStorage.setItem("freshEatsRole", userData.role);

          alert("Welcome back, " + userData.username + "!");
          // FIXED PATH
          window.location.href = "../PatronHome/patron-home.html";
        } else {
          alert(
            "Access Denied: You are a Vendor. Please use the vendor login.",
          );
          await signOut(auth);
        }
      } else {
        alert("Error: User profile not found.");
      }
    } catch (error) {
      console.error("Login Error:", error);

      if (error.code === "auth/user-not-found") {
        alert("No account found with this email. Please sign up first.");
      } else if (error.code === "auth/wrong-password") {
        alert("Incorrect password. Please try again.");
      } else if (error.code === "auth/invalid-email") {
        alert("Invalid email format.");
      } else if (error.code === "auth/too-many-requests") {
        alert("Too many failed login attempts. Please try again later.");
      } else {
        alert("Login Failed: " + error.message);
      }
    }
  });
});
