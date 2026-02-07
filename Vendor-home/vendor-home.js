import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyA8zDkXrfnzEE6OpvEAATqNliz9FBYxOPo",
  authDomain: "hawkerbase-fedasg.firebaseapp.com",
  databaseURL:
    "https://hawkerbase-fedasg-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "hawkerbase-fedasg",
  storageBucket: "hawkerbase-fedasg.firebasestorage.app",
  messagingSenderId: "216203478131",
  appId: "1:216203478131:web:cb0ff58ba3f51911de9606",
  measurementId: "G-E4S08BB1PG",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// DOM Elements
const sidebarName = document.getElementById("sidebar-name");
const sidebarAvatar = document.getElementById("sidebar-avatar");
const headerAvatar = document.getElementById("header-avatar");
const dashMainStatus = document.getElementById("dash-main-status");
const sketchBanner = document.getElementById("sketch-banner");
const sketchName = document.getElementById("sketch-name");
const sketchPill = document.getElementById("sketch-pill");
const logoutLinks = document.querySelectorAll(".logout-link");

// Auth Listener
onAuthStateChanged(auth, (user) => {
  if (user) {
    initializeDashboard(user.uid);
  } else {
    window.location.href = "../index.html";
  }
});

function initializeDashboard(uid) {
  const userRef = ref(db, "users/" + uid);

  onValue(
    userRef,
    (snapshot) => {
      const data = snapshot.val();

      // Validate user data exists
      if (!data) {
        console.error("User data not found");
        alert("Error: User data not found. Please sign up again.");
        signOut(auth).then(
          () => (window.location.href = "../public-page-jay/public-page.html"),
        );
        return;
      }

      // Validate user is a vendor
      if (data.role !== "vendor") {
        alert("Access denied. This page is only for vendors.");
        signOut(auth).then(
          () => (window.location.href = "../public-page-jay/public-page.html"),
        );
        return;
      }

      updateUI(data);
    },
    (error) => {
      console.error("Error loading dashboard data:", error);
      alert("Error loading your data. Please try again.");
    },
  );
}

function updateUI(data) {
  // Profile Info
  const displayName = data.stallName || data.username || "Vendor";
  const initial = displayName.charAt(0).toUpperCase();

  if (sidebarName) sidebarName.textContent = displayName;
  if (sidebarAvatar) sidebarAvatar.textContent = initial;
  if (headerAvatar) headerAvatar.textContent = initial;

  // Dashboard Status
  if (dashMainStatus) {
    dashMainStatus.textContent =
      data.status === "Open" ? "Store is OPEN" : "Store is CLOSED";
  }

  // Preview Card
  if (sketchBanner && data.bannerUrl) {
    sketchBanner.style.backgroundImage = `url("${data.bannerUrl}")`;
  }

  if (sketchName) {
    sketchName.textContent = displayName;
  }

  if (sketchPill) {
    sketchPill.textContent = data.statusMessage || "Loading...";
    sketchPill.style.background =
      data.status === "Open" ? "#e9f2e6" : "#fee2e2";
    sketchPill.style.color = data.status === "Open" ? "#68a357" : "#dc2626";
  }
}

// Logout
logoutLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    signOut(auth)
      .then(() => {
        window.location.href = "../public-page-jay/public-page.html";
      })
      .catch((error) => {
        console.error("Logout error:", error);
        alert("Error logging out. Please try again.");
      });
  });
});
