import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  onValue,
  update,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

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
const storeNameEl = document.getElementById("mobile-store-name");
const laptopStoreNameEl = document.getElementById("laptop-store-name");
const mobileDescriptionEl = document.getElementById("mobile-description");
const laptopDescriptionEl = document.getElementById("laptop-description");
const statusPill = document.getElementById("mobile-status-pill");
const laptopStatusPill = document.getElementById("laptop-status-pill");
const statusText = document.getElementById("status-text-display");
const bannerPreview = document.getElementById("preview-banner");
const mobileBanner = document.getElementById("mobile-banner-preview");
const laptopBanner = document.getElementById("laptop-banner-preview");
const statusSelect = document.getElementById("status-message-select");
const statusToggle = document.getElementById("status-toggle");
const saveBtn = document.getElementById("save-changes-btn");
const logoutLinks = document.querySelectorAll(".logout-link");
const sidebarName = document.getElementById("sidebar-name");
const sidebarAvatar = document.getElementById("sidebar-avatar");
const headerAvatar = document.getElementById("header-avatar");
const stallNameInput = document.getElementById("stall-name-input");
const descriptionInput = document.getElementById("stall-description-input");
const charCount = document.getElementById("char-count");
const bannerFileInput = document.getElementById("banner-file-input");
const loadingOverlay = document.getElementById("loading-overlay");

let currentUserId = null;
let currentBannerUrl =
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000";
let unsubscribeListener = null; // Store unsubscribe function

// Character counter for description
if (descriptionInput && charCount) {
  descriptionInput.addEventListener("input", () => {
    const length = descriptionInput.value.length;
    charCount.textContent = `${length}/150`;
  });
}

// Banner URL input handler
if (bannerFileInput) {
  bannerFileInput.addEventListener("input", (e) => {
    const url = e.target.value.trim();
    if (url) {
      // Validate URL format
      try {
        new URL(url);
        currentBannerUrl = url;

        // Update previews
        bannerPreview.src = url;
        mobileBanner.style.backgroundImage = `url("${url}")`;
        laptopBanner.style.backgroundImage = `url("${url}")`;
      } catch (error) {
        console.log("Invalid URL");
      }
    }
  });
}

// Auth Listener
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUserId = user.uid;
    loadVendorData(user.uid);
  } else {
    // FIXED PATH
    window.location.href = "../public-page-jay/public-page.html";
  }
});

// Load vendor data from Firebase
function loadVendorData(uid) {
  const userRef = ref(db, "users/" + uid);

  unsubscribeListener = onValue(
    userRef,
    (snapshot) => {
      const data = snapshot.val();

      // Validate user is a vendor
      if (!data) {
        console.error("User data not found");
        alert("Error: User data not found. Please sign up again.");
        signOut(auth).then(
          () => (window.location.href = "../public-page-jay/public-page.html"),
        );
        return;
      }

      if (data.role !== "vendor") {
        alert("Access denied. This page is only for vendors.");
        signOut(auth).then(
          () => (window.location.href = "../public-page-jay/public-page.html"),
        );
        return;
      }

      updateUIWithData(data);
    },
    (error) => {
      console.error("Error loading vendor data:", error);
      // Only show error if user is still authenticated
      if (auth.currentUser) {
        alert("Error loading your data. Please try again.");
      }
    },
  );
}

// Update UI with vendor data
function updateUIWithData(data) {
  // Sidebar & Header Update
  const displayName = data.stallName || data.username || "Vendor";
  if (sidebarName) sidebarName.textContent = displayName;
  if (sidebarAvatar)
    sidebarAvatar.textContent = displayName.charAt(0).toUpperCase();
  if (headerAvatar)
    headerAvatar.textContent = displayName.charAt(0).toUpperCase();

  // Stall Name Input
  if (stallNameInput) {
    stallNameInput.value = data.stallName || "";
  }

  // Description Input
  if (descriptionInput) {
    descriptionInput.value = data.description || "";
    const length = data.description ? data.description.length : 0;
    if (charCount) charCount.textContent = `${length}/150`;
  }

  // Display Page Updates
  if (storeNameEl) storeNameEl.textContent = data.stallName || "Vendor Name";
  if (laptopStoreNameEl)
    laptopStoreNameEl.textContent = data.stallName || "Vendor Name";

  if (mobileDescriptionEl)
    mobileDescriptionEl.textContent = data.description || "No description yet.";
  if (laptopDescriptionEl)
    laptopDescriptionEl.textContent = data.description || "No description yet.";

  // Banner
  if (data.bannerUrl) {
    currentBannerUrl = data.bannerUrl;
    bannerPreview.src = data.bannerUrl;
    mobileBanner.style.backgroundImage = `url("${data.bannerUrl}")`;
    laptopBanner.style.backgroundImage = `url("${data.bannerUrl}")`;
  }

  // Status Message
  if (data.statusMessage) {
    statusSelect.value = data.statusMessage;
    updateStatusDisplay(data.statusMessage, data.status === "Open");
  }

  // Status Toggle
  if (data.status === "Open") {
    statusToggle.checked = true;
  } else {
    statusToggle.checked = false;
  }
}

// Update status display across all previews
function updateStatusDisplay(message, isOpen) {
  if (statusText) statusText.textContent = message;
  if (statusPill) statusPill.textContent = message;
  if (laptopStatusPill) laptopStatusPill.textContent = message;

  // Update colors
  const statusBox = statusText?.parentElement;
  if (statusBox) {
    if (isOpen) {
      statusBox.style.color = "#166534";
      statusBox.style.borderColor = "#bbf7d0";
      statusBox.style.background = "#f0fdf4";
    } else {
      statusBox.style.color = "#991b1b";
      statusBox.style.borderColor = "#fecaca";
      statusBox.style.background = "#fef2f2";
    }
  }
}

// UI Event Listeners
statusSelect.addEventListener("change", (e) => {
  const isOpen = statusToggle.checked;
  if (isOpen) {
    updateStatusDisplay(e.target.value, true);
  }
});

statusToggle.addEventListener("change", (e) => {
  if (e.target.checked) {
    updateStatusDisplay(statusSelect.value, true);
  } else {
    updateStatusDisplay("Store is Closed", false);
  }
});

// Stall name input updates preview in real-time
if (stallNameInput) {
  stallNameInput.addEventListener("input", (e) => {
    const newName = e.target.value || "Vendor Name";
    if (storeNameEl) storeNameEl.textContent = newName;
    if (laptopStoreNameEl) laptopStoreNameEl.textContent = newName;
  });
}

// Description input updates preview in real-time
if (descriptionInput) {
  descriptionInput.addEventListener("input", (e) => {
    const newDesc = e.target.value || "No description yet.";
    if (mobileDescriptionEl) mobileDescriptionEl.textContent = newDesc;
    if (laptopDescriptionEl) laptopDescriptionEl.textContent = newDesc;
  });
}

// Save Changes
saveBtn.addEventListener("click", async () => {
  if (!currentUserId) {
    alert("Error: User not authenticated");
    return;
  }

  try {
    // Show loading overlay
    if (loadingOverlay) loadingOverlay.style.display = "flex";

    const newStatus = statusToggle.checked ? "Open" : "Closed";
    const newMessage = statusSelect.value;
    const newStallName = stallNameInput.value.trim();
    const newDescription = descriptionInput.value.trim();

    // Validate stall name
    if (!newStallName) {
      alert("Please enter a stall name");
      if (loadingOverlay) loadingOverlay.style.display = "none";
      return;
    }

    // Update Firebase
    const updates = {
      stallName: newStallName,
      description: newDescription,
      status: newStatus,
      statusMessage: newMessage,
      bannerUrl: currentBannerUrl,
      lastUpdated: Date.now(),
    };

    await update(ref(db, "users/" + currentUserId), updates);

    if (loadingOverlay) loadingOverlay.style.display = "none";
    alert("Display settings saved successfully! ✓");
  } catch (error) {
    console.error("Error saving changes:", error);
    if (loadingOverlay) loadingOverlay.style.display = "none";
    alert("Error saving changes: " + error.message);
  }
});

// Logout
logoutLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();

    // Unsubscribe from Firebase listener to prevent errors
    if (unsubscribeListener) {
      unsubscribeListener();
    }

    signOut(auth)
      .then(() => {
        // FIXED PATH
        window.location.href = "../public-page-jay/public-page.html";
      })
      .catch((error) => {
        console.error("Logout error:", error);
        alert("Error logging out. Please try again.");
      });
  });
});
