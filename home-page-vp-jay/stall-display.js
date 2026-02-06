document.addEventListener("DOMContentLoaded", () => {
  // 1. SETUP USER INFO (Standard Requirement)
  const savedName = localStorage.getItem("freshEatsUserName") || "Vendor";

  document.getElementById("sidebar-name").textContent = savedName;
  document.getElementById("sidebar-avatar").textContent = savedName
    .charAt(0)
    .toUpperCase();
  document.getElementById("header-avatar").textContent = savedName
    .charAt(0)
    .toUpperCase();
  document.getElementById("mobile-store-name").textContent =
    savedName + "'s Kitchen"; // Update phone preview name

  // 2. LIVE PREVIEW: Status Message
  const statusSelect = document.getElementById("status-message-select");
  const statusToggle = document.getElementById("status-toggle");
  const textDisplay = document.getElementById("status-text-display");
  const mobilePill = document.getElementById("mobile-status-pill");

  function updateStatus() {
    if (!statusToggle.checked) {
      textDisplay.textContent = "Store is Closed";
      textDisplay.style.color = "#dc2626"; // Red
      mobilePill.textContent = "Closed";
      mobilePill.style.background = "#fee2e2";
      mobilePill.style.color = "#dc2626";
      return;
    }

    const selectedText = statusSelect.options[statusSelect.selectedIndex].text;
    const selectedValue = statusSelect.value;

    // Update Editor View
    textDisplay.textContent = selectedText;
    textDisplay.style.color = "#166534"; // Green

    // Update Phone Preview
    mobilePill.textContent = selectedValue;
    mobilePill.style.background = "#e9f2e6";
    mobilePill.style.color = "#68a357";
  }

  statusSelect.addEventListener("change", updateStatus);
  statusToggle.addEventListener("change", updateStatus);

  // 3. LIVE PREVIEW: Banner Image
  // In a real app, this would be a file upload.
  // For this prototype, we cycle through 3 preset images when clicked.
  const bannerDropzone = document.getElementById("banner-dropzone");
  const previewBanner = document.getElementById("preview-banner");
  const mobileBanner = document.getElementById("mobile-banner-preview");

  const sampleImages = [
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000", // Pancake
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000", // Steak
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1000", // Salad
  ];
  let currentImgIndex = 0;

  bannerDropzone.addEventListener("click", () => {
    // Cycle images
    currentImgIndex = (currentImgIndex + 1) % sampleImages.length;
    const newUrl = sampleImages[currentImgIndex];

    // Update DOM
    previewBanner.src = newUrl;
    mobileBanner.style.backgroundImage = `url('${newUrl}')`;
  });

  // 4. SAVE BUTTON INTERACTION
  const saveBtn = document.getElementById("save-changes-btn");
  saveBtn.addEventListener("click", () => {
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = `<i class="ph-bold ph-spinner"></i> SAVING...`;

    setTimeout(() => {
      saveBtn.innerHTML = `<i class="ph-bold ph-check"></i> SAVED!`;
      saveBtn.style.backgroundColor = "#4ade80"; // Brighter green

      setTimeout(() => {
        saveBtn.innerHTML = originalText;
        saveBtn.style.backgroundColor = "";
      }, 2000);
    }, 1000);
  });
});
