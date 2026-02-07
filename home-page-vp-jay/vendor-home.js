// 1. Access Global Firebase Instances (Initialized in HTML)
const db = window.db;
const auth = window.auth;
const dbRef = window.dbRef;
const dbOnValue = window.dbOnValue;
const onAuthStateChanged = window.authCheck;
const { signOut } =
  await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js");

// 2. DOM Elements Selection
// -- Sidebar & Header Profile --
const sidebarName = document.getElementById("sidebar-name");
const sidebarAvatar = document.getElementById("sidebar-avatar");
const headerAvatar = document.getElementById("header-avatar");

// -- Main Dashboard Widgets --
const dashMainStatus = document.getElementById("dash-main-status");

// -- Right Column: Live Sketch Preview --
const sketchBanner = document.getElementById("sketch-banner");
const sketchName = document.getElementById("sketch-name");
const sketchPill = document.getElementById("sketch-pill");

// -- Navigation --
const logoutLinks = document.querySelectorAll(".logout-link");

// 3. Authentication & Data Listener
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User logged in:", user.uid);
    initializeDashboard(user.uid);
  } else {
    // If not logged in, redirect to landing page
    window.location.href = "../index.html";
  }
});

// 4. Main Dashboard Logic
function initializeDashboard(uid) {
  const userRef = dbRef(db, "users/" + uid);

  // Listen for real-time changes
  dbOnValue(userRef, (snapshot) => {
    const data = snapshot.val();

    // Safety check: ensure data exists and user is a vendor
    if (data && data.role === "vendor") {
      updateProfileUI(data);
      updateStatusWidget(data);
      updateSketchPreview(data);
    }
  });
}

// 5. UI Update Functions

/**
 * Updates the User Profile sections (Sidebar name, Avatar initials)
 */
function updateProfileUI(data) {
  // Prioritize Stall Name, fallback to Username, fallback to "Vendor"
  const displayName = data.stallName || data.username || "Vendor";

  // Set Text
  if (sidebarName) sidebarName.textContent = displayName;

  // Set Initials (e.g., "Uncle Lim" -> "U")
  const initial = displayName.charAt(0).toUpperCase();
  if (sidebarAvatar) sidebarAvatar.textContent = initial;
  if (headerAvatar) headerAvatar.textContent = initial;
}

/**
 * Updates the large "Live Store Status" card in the center column
 */
function updateStatusWidget(data) {
  if (!dashMainStatus) return;

  const isOpen = data.status === "Open";

  if (isOpen) {
    dashMainStatus.textContent = "Store is OPEN";
    // Optional: Add logic here to change icon colors if you have them
  } else {
    dashMainStatus.textContent = "Store is CLOSED";
  }
}

/**
 * Updates the "Live Display Sketch" card in the right column
 */
function updateSketchPreview(data) {
  // 1. Banner Image
  if (sketchBanner && data.bannerUrl) {
    sketchBanner.style.backgroundImage = `url('${data.bannerUrl}')`;
  }

  // 2. Stall Name on phone preview
  if (sketchName) {
    sketchName.textContent = data.stallName || "My Stall";
  }

  // 3. Status Pill (e.g., "Open Now", "Long Queue")
  if (sketchPill) {
    const message = data.statusMessage || "Loading...";
    sketchPill.textContent = message;

    // Dynamic coloring for the pill based on status
    if (data.status === "Open") {
      sketchPill.style.background = "#e9f2e6"; // Light Green
      sketchPill.style.color = "#68a357"; // Dark Green
    } else {
      sketchPill.style.background = "#fee2e2"; // Light Red
      sketchPill.style.color = "#dc2626"; // Dark Red
    }
  }
}

// 6. Logout Handler
logoutLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    signOut(auth)
      .then(() => {
        console.log("User signed out");
        window.location.href = "../public-page-jay/public-page.html";
      })
      .catch((error) => {
        console.error("Sign out error", error);
      });
  });
});
