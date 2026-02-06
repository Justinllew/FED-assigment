document.addEventListener("DOMContentLoaded", () => {
  // 1. SETUP STATIC INFO (Name/Avatar)
  const savedName = localStorage.getItem("freshEatsUserName") || "Vendor";

  function updateNameDisplay(name) {
    // Sidebar & Header
    if (document.getElementById("sidebar-name"))
      document.getElementById("sidebar-name").textContent = name;
    if (document.getElementById("sidebar-avatar"))
      document.getElementById("sidebar-avatar").textContent = name
        .charAt(0)
        .toUpperCase();
    if (document.getElementById("header-avatar"))
      document.getElementById("header-avatar").textContent = name
        .charAt(0)
        .toUpperCase();

    // Sketch Card
    if (document.getElementById("sketch-name"))
      document.getElementById("sketch-name").textContent = name;
  }
  updateNameDisplay(savedName);

  // 2. CONNECT TO FIREBASE
  const checkFirebase = setInterval(() => {
    if (window.auth && window.db) {
      clearInterval(checkFirebase);
      initDashboardListener();
    }
  }, 100);

  function initDashboardListener() {
    // Detect User
    window.authCheck(window.auth, (user) => {
      if (user) {
        console.log("Dashboard connected for user:", user.uid);

        // CONNECT TO DATABASE
        const displayRef = window.dbRef(
          window.db,
          "vendors/" + user.uid + "/displaySettings",
        );

        // LISTEN FOR CHANGES
        window.dbOnValue(displayRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            updateSketchCard(data);
          }
        });
      }
    });
  }

  // 3. UPDATE UI
  function updateSketchCard(data) {
    const sketchBanner = document.getElementById("sketch-banner");
    const sketchPill = document.getElementById("sketch-pill");
    const mainStatus = document.getElementById("dash-main-status");

    // Update Banner
    if (data.banner && sketchBanner) {
      sketchBanner.style.backgroundImage = `url('${data.banner}')`;
    }

    // Update Status Pill
    if (data.status && sketchPill) {
      sketchPill.textContent = data.status.pillText;

      if (data.status.isOpen) {
        sketchPill.style.background = "#e9f2e6";
        sketchPill.style.color = "#68a357";
      } else {
        sketchPill.style.background = "#fee2e2";
        sketchPill.style.color = "#dc2626";
      }
    }

    // Update Main Card Text
    if (data.status && mainStatus) {
      mainStatus.textContent = data.status.fullText;
    }
  }
});
