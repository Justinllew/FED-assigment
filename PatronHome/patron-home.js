document.addEventListener("DOMContentLoaded", () => {
  // --- DROPDOWN LOGIC ---
  const userMenuBtn = document.getElementById("userMenuBtn");
  const dropdownMenu = document.getElementById("dropdownMenu");
  const overlay = document.getElementById("overlay");

  function openMenu() {
    dropdownMenu.classList.add("active");
    overlay.classList.add("active");
  }

  function closeMenu() {
    dropdownMenu.classList.remove("active");
    overlay.classList.remove("active");
  }

  if (userMenuBtn) {
    userMenuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (dropdownMenu.classList.contains("active")) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  if (overlay) {
    overlay.addEventListener("click", () => {
      closeMenu();
    });
  }

  // --- DELIVERY VS PICKUP TOGGLE LOGIC ---
  const deliveryBtn = document.getElementById("deliveryBtn");
  const pickupBtn = document.getElementById("pickupBtn");
  const locationInput = document.getElementById("locationInput");

  // Click "Delivery"
  if (deliveryBtn) {
    deliveryBtn.addEventListener("click", () => {
      deliveryBtn.classList.add("active");
      pickupBtn.classList.remove("active");
      if (locationInput) locationInput.placeholder = "Enter your address";
    });
  }

  // Click "Pick up"
  if (pickupBtn) {
    pickupBtn.addEventListener("click", () => {
      pickupBtn.classList.add("active");
      deliveryBtn.classList.remove("active");
      if (locationInput) locationInput.placeholder = "Enter pickup location";
    });
  }

  // --- STORE CARD CLICK LOGIC ---
  const storeCards = document.querySelectorAll(".store-card");

  storeCards.forEach((card) => {
    card.addEventListener("click", () => {
      const storeName = card.querySelector("h3").innerText;
      console.log(`Navigating to ${storeName}...`);
      alert(`Navigating to ${storeName}...`);
    });
  });
});
