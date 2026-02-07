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
const patronName = document.getElementById("patron-name");
const userMenuBtn = document.getElementById("userMenuBtn");
const dropdownMenu = document.getElementById("dropdownMenu");
const overlay = document.getElementById("overlay");
const logoutLink = document.getElementById("logout-link");
const storesGrid = document.getElementById("stores-grid");
const loadingState = document.getElementById("loading-state");
const emptyState = document.getElementById("empty-state");
const filterButtons = document.querySelectorAll(".filter-btn");

let allVendors = [];
let currentFilter = "all";
let unsubscribePatronListener = null; // Store patron data listener
let unsubscribeVendorsListener = null; // Store vendors data listener

// Auth Listener
onAuthStateChanged(auth, (user) => {
  if (user) {
    loadPatronData(user.uid);
    loadAllVendors();
  } else {
    // FIXED PATH
    window.location.href = "../public-page-jay/public-page.html";
  }
});

// Load patron data
function loadPatronData(uid) {
  const userRef = ref(db, "users/" + uid);

  unsubscribePatronListener = onValue(
    userRef,
    (snapshot) => {
      const data = snapshot.val();

      if (!data) {
        console.error("User data not found");
        return;
      }

      // Validate user is a patron
      if (data.role !== "patron") {
        alert("Access denied. This page is only for patrons.");
        signOut(auth).then(
          () => (window.location.href = "../public-page-jay/public-page.html"),
        );
        return;
      }

      // Update patron name
      const displayName = data.username || "Patron";
      if (patronName) patronName.textContent = displayName;
    },
    (error) => {
      console.error("Error loading patron data:", error);
    },
  );
}

// Load all vendors from Firebase
function loadAllVendors() {
  const usersRef = ref(db, "users");

  unsubscribeVendorsListener = onValue(
    usersRef,
    (snapshot) => {
      const users = snapshot.val();

      if (!users) {
        showEmptyState();
        return;
      }

      // Filter only vendors
      allVendors = Object.entries(users)
        .filter(([uid, data]) => data.role === "vendor")
        .map(([uid, data]) => ({ uid, ...data }));

      if (allVendors.length === 0) {
        showEmptyState();
      } else {
        hideLoadingState();
        renderVendors(allVendors);
      }
    },
    (error) => {
      console.error("Error loading vendors:", error);
      showEmptyState();
    },
  );
}

// Render vendor cards
function renderVendors(vendors) {
  if (!storesGrid) return;

  // Apply filter
  let filteredVendors = vendors;
  if (currentFilter === "open") {
    filteredVendors = vendors.filter((v) => v.status === "Open");
  } else if (currentFilter === "closed") {
    filteredVendors = vendors.filter((v) => v.status === "Closed");
  }

  // Clear grid
  storesGrid.innerHTML = "";

  if (filteredVendors.length === 0) {
    storesGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666;">
        <p>No ${currentFilter === "all" ? "" : currentFilter} stalls found.</p>
      </div>
    `;
    return;
  }

  // Render each vendor
  filteredVendors.forEach((vendor) => {
    const card = createVendorCard(vendor);
    storesGrid.appendChild(card);
  });
}

// Create vendor card element
function createVendorCard(vendor) {
  const card = document.createElement("div");
  card.className = "store-card";
  card.setAttribute("data-vendor-id", vendor.uid);

  const stallName = vendor.stallName || "Unnamed Stall";
  const description = vendor.description || "No description available.";
  const statusMessage = vendor.statusMessage || "Closed";
  const bannerUrl =
    vendor.bannerUrl ||
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000";
  const isOpen = vendor.status === "Open";

  // Truncate description to 60 characters
  const shortDescription =
    description.length > 60
      ? description.substring(0, 60) + "..."
      : description;

  card.innerHTML = `
    <div 
      class="store-img" 
      style="background-image: url('${bannerUrl}'); background-size: cover; background-position: center;"
    ></div>
    <div class="store-info">
      <div class="store-header">
        <h3>${stallName}</h3>
        <span class="rating">4.8 ★</span>
      </div>
      <p class="store-description">${shortDescription}</p>
      <div class="store-footer">
        <span class="status-badge ${isOpen ? "status-open" : "status-closed"}">
          ${statusMessage}
        </span>
        <span class="delivery-time">20-30 min</span>
      </div>
    </div>
  `;

  // Add click event to view stall details (future feature)
  card.addEventListener("click", () => {
    console.log("Clicked vendor:", vendor.uid, vendor.stallName);
    // Future: Navigate to stall detail page
    // window.location.href = `stall-detail.html?id=${vendor.uid}`;
  });

  return card;
}

// Show/hide states
function showEmptyState() {
  if (loadingState) loadingState.style.display = "none";
  if (emptyState) emptyState.style.display = "flex";
  if (storesGrid) storesGrid.style.display = "none";
}

function hideLoadingState() {
  if (loadingState) loadingState.style.display = "none";
  if (emptyState) emptyState.style.display = "none";
  if (storesGrid) storesGrid.style.display = "grid";
}

// Filter buttons
filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    // Update active button
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    // Update filter and re-render
    currentFilter = btn.getAttribute("data-filter");
    renderVendors(allVendors);
  });
});

// Dropdown menu toggle
if (userMenuBtn && dropdownMenu && overlay) {
  userMenuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdownMenu.classList.toggle("active");
    overlay.classList.toggle("active");
  });

  // Close dropdown when clicking anywhere outside
  document.addEventListener("click", (e) => {
    if (!userMenuBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
      dropdownMenu.classList.remove("active");
      overlay.classList.remove("active");
    }
  });
}

// Tab switching (Delivery/Pickup)
const deliveryBtn = document.getElementById("deliveryBtn");
const pickupBtn = document.getElementById("pickupBtn");

if (deliveryBtn && pickupBtn) {
  deliveryBtn.addEventListener("click", () => {
    deliveryBtn.classList.add("active");
    pickupBtn.classList.remove("active");
  });

  pickupBtn.addEventListener("click", () => {
    pickupBtn.classList.add("active");
    deliveryBtn.classList.remove("active");
  });
}

// Logout handler function
function handleLogout(e) {
  e.preventDefault();
  e.stopPropagation();
  console.log("Logout button clicked!");

  // Unsubscribe from ALL Firebase listeners to prevent errors
  if (unsubscribePatronListener) {
    unsubscribePatronListener();
  }
  if (unsubscribeVendorsListener) {
    unsubscribeVendorsListener();
  }

  signOut(auth)
    .then(() => {
      console.log("Signout successful, redirecting...");
      // FIXED PATH
      window.location.href = "../public-page-jay/public-page.html";
    })
    .catch((error) => {
      console.error("Logout error:", error);
      alert("Error logging out: " + error.message);
    });
}

// Logout - Multiple attachment methods for reliability
const logoutLinkElement = document.getElementById("logout-link");

// Method 1: Direct attachment
if (logoutLinkElement) {
  console.log("✓ Logout link found and listener attached");
  logoutLinkElement.addEventListener("click", handleLogout);
} else {
  console.error("✗ Logout link NOT found - check HTML id");
}

// Method 2: Event delegation (backup)
document.addEventListener("click", (e) => {
  if (e.target.id === "logout-link" || e.target.closest("#logout-link")) {
    handleLogout(e);
  }
});
