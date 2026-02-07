// stall-display.js

// 1. Get Global Firebase Instances (Initialized in HTML)
const db = window.db;
const auth = window.auth;
const dbRef = window.dbRef;
const dbSet = window.dbSet;
const dbOnValue = window.dbOnValue;
const onAuthStateChanged = window.authCheck;

// 2. DOM Elements
const storeNameEl = document.getElementById("mobile-store-name");
const statusPill = document.getElementById("mobile-status-pill");
const statusText = document.getElementById("status-text-display");
const bannerPreview = document.getElementById("preview-banner");
const mobileBanner = document.getElementById("mobile-banner-preview");
const statusSelect = document.getElementById("status-message-select");
const statusToggle = document.getElementById("status-toggle");
const saveBtn = document.getElementById("save-changes-btn");

let currentUserId = null;

// 3. Authenticate & Load Data
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUserId = user.uid;
    loadVendorData(user.uid);
  } else {
    // Force back to signup/login if no user found
    window.location.href = "signup.html";
  }
});

// 4. Load Data from Firebase
function loadVendorData(uid) {
  const userRef = dbRef(db, "users/" + uid);

  dbOnValue(userRef, (snapshot) => {
    const data = snapshot.val();

    // Ensure we only load for vendors
    if (data && data.role === "vendor") {
      // A. Update Stall Name (Task 3: Reflected in display page)
      if (data.stallName) {
        storeNameEl.textContent = data.stallName;
      }

      // B. Update Banner
      if (data.bannerUrl) {
        bannerPreview.src = data.bannerUrl;
        mobileBanner.style.backgroundImage = `url('${data.bannerUrl}')`;
      }

      // C. Update Status Message
      if (data.statusMessage) {
        statusSelect.value = data.statusMessage;
        statusPill.textContent = data.statusMessage;
        statusText.textContent = data.statusMessage;
      }

      // D. Update Status Toggle
      if (data.status === "Open") {
        statusToggle.checked = true;
        // Visual green style
        statusText.parentElement.style.color = "#166534";
        statusText.parentElement.style.borderColor = "#bbf7d0";
        statusText.parentElement.style.background = "#f0fdf4";
      } else {
        statusToggle.checked = false;
        statusText.textContent = "Store is Closed";
        statusPill.textContent = "Closed";
        // Visual red style
        statusText.parentElement.style.color = "#991b1b";
        statusText.parentElement.style.borderColor = "#fecaca";
        statusText.parentElement.style.background = "#fef2f2";
      }
    }
  });
}

// 5. Live Preview Logic (Local UI updates)
statusSelect.addEventListener("change", (e) => {
  statusText.textContent = e.target.value;
  statusPill.textContent = e.target.value;
});

statusToggle.addEventListener("change", (e) => {
  if (e.target.checked) {
    statusText.textContent = statusSelect.value;
  } else {
    statusText.textContent = "Store is Closed";
  }
});

// 6. Save Changes to Firebase
saveBtn.addEventListener("click", () => {
  if (!currentUserId) return;

  const newStatus = statusToggle.checked ? "Open" : "Closed";
  const newMessage = statusSelect.value;
  // Currently saving the source string of the image
  const currentBanner = bannerPreview.src;

  // Update specific fields in Firebase
  dbSet(dbRef(db, "users/" + currentUserId + "/status"), newStatus);
  dbSet(dbRef(db, "users/" + currentUserId + "/statusMessage"), newMessage);
  dbSet(dbRef(db, "users/" + currentUserId + "/bannerUrl"), currentBanner);

  alert("Display settings saved!");
});
