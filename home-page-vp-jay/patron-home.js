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

  userMenuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (dropdownMenu.classList.contains("active")) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  overlay.addEventListener("click", () => {
    closeMenu();
  });

  // --- NEW: DELIVERY VS PICKUP TOGGLE LOGIC ---
  const deliveryBtn = document.getElementById("deliveryBtn");
  const pickupBtn = document.getElementById("pickupBtn");
  const locationInput = document.getElementById("locationInput");

  // Click "Delivery"
  deliveryBtn.addEventListener("click", () => {
    // Toggle active styling
    deliveryBtn.classList.add("active");
    pickupBtn.classList.remove("active");

    // Update Input for Delivery Context
    locationInput.placeholder = "Enter your address";
  });

  // Click "Pick up"
  pickupBtn.addEventListener("click", () => {
    // Toggle active styling
    pickupBtn.classList.add("active");
    deliveryBtn.classList.remove("active");

    // Update Input for Pickup Context
    locationInput.placeholder = "Enter pickup location";
  });
});
