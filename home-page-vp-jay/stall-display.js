document.addEventListener("DOMContentLoaded", () => {
  // VARIABLES
  const statusSelect = document.getElementById("status-message-select");
  const statusToggle = document.getElementById("status-toggle");
  const textDisplay = document.getElementById("status-text-display");
  const mobilePill = document.getElementById("mobile-status-pill");
  const previewBanner = document.getElementById("preview-banner");
  const mobileBanner = document.getElementById("mobile-banner-preview");
  const bannerDropzone = document.getElementById("banner-dropzone");
  const saveBtn = document.getElementById("save-changes-btn");

  let currentBannerUrl =
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000";
  let currentUser = null;

  // 1. FIREBASE CONNECTION CHECK
  const checkFirebase = setInterval(() => {
    if (window.auth) {
      clearInterval(checkFirebase);
      initAuth();
    }
  }, 100);

  function initAuth() {
    window.authCheck(window.auth, (user) => {
      if (user) {
        currentUser = user;
        // Load existing data
        loadData(user.uid);

        // Set User Name UI
        const name = localStorage.getItem("freshEatsUserName") || "Vendor";
        document.getElementById("sidebar-name").textContent = name;
        document.getElementById("mobile-store-name").textContent = name;
        document.getElementById("sidebar-avatar").textContent = name
          .charAt(0)
          .toUpperCase();
      } else {
        alert("Please log in first.");
      }
    });
  }

  // 2. UI UPDATE FUNCTION
  function updateLocalUI() {
    // Status Logic
    if (!statusToggle.checked) {
      textDisplay.textContent = "Store is Closed";
      textDisplay.style.color = "#dc2626";
      mobilePill.textContent = "Closed";
      mobilePill.style.background = "#fee2e2";
      mobilePill.style.color = "#dc2626";
    } else {
      textDisplay.textContent =
        statusSelect.options[statusSelect.selectedIndex].text;
      textDisplay.style.color = "#166534";
      mobilePill.textContent = statusSelect.value;
      mobilePill.style.background = "#e9f2e6";
      mobilePill.style.color = "#68a357";
    }

    // Banner Logic
    previewBanner.src = currentBannerUrl;
    mobileBanner.style.backgroundImage = `url('${currentBannerUrl}')`;
  }

  // 3. EVENT LISTENERS
  statusSelect.addEventListener("change", updateLocalUI);
  statusToggle.addEventListener("change", updateLocalUI);

  // Banner Cycling (Simulated Upload)
  const images = [
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000", // Pancakes
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000", // Steak
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1000", // Salad
  ];
  let imgIndex = 0;

  bannerDropzone.addEventListener("click", () => {
    imgIndex = (imgIndex + 1) % images.length;
    currentBannerUrl = images[imgIndex];
    updateLocalUI();
  });

  // 4. LOAD DATA FROM FIREBASE
  function loadData(uid) {
    const displayRef = window.dbRef(
      window.db,
      "vendors/" + uid + "/displaySettings",
    );
    window.dbOnValue(displayRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        if (data.banner) currentBannerUrl = data.banner;
        if (data.status) {
          statusToggle.checked = data.status.isOpen;
          statusSelect.value = data.status.pillText;
        }
        updateLocalUI();
      }
    });
  }

  // 5. SAVE TO FIREBASE
  saveBtn.addEventListener("click", () => {
    if (!currentUser) return;

    const dataToSave = {
      banner: currentBannerUrl,
      status: {
        isOpen: statusToggle.checked,
        pillText: statusToggle.checked ? statusSelect.value : "Closed",
        fullText: statusToggle.checked
          ? statusSelect.options[statusSelect.selectedIndex].text
          : "Store is Closed",
      },
      lastUpdated: Date.now(),
    };

    const displayRef = window.dbRef(
      window.db,
      "vendors/" + currentUser.uid + "/displaySettings",
    );

    saveBtn.innerHTML = `<i class="ph-bold ph-spinner"></i> SAVING...`;

    window.dbSet(displayRef, dataToSave).then(() => {
      saveBtn.innerHTML = `<i class="ph-bold ph-check"></i> SAVED!`;
      saveBtn.style.backgroundColor = "#4ade80";
      setTimeout(() => {
        saveBtn.innerHTML = `<i class="ph-bold ph-check"></i> SAVE CHANGES`;
        saveBtn.style.backgroundColor = "";
      }, 2000);
    });
  });
});
