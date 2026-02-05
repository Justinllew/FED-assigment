document.addEventListener("DOMContentLoaded", () => {
  // --- FEATURE 1: Delivery vs. Pickup Toggle ---
  const deliveryBtn = document.querySelector(".pill-btn:first-child");
  const pickupBtn = document.querySelector(".pill-btn:last-child");

  function toggleMode(mode) {
    if (mode === "delivery") {
      deliveryBtn.classList.add("active");
      deliveryBtn.classList.remove("inactive");
      pickupBtn.classList.add("inactive");
      pickupBtn.classList.remove("active");

      // Optional: Change placeholder text
      const input = document.querySelector(".address-input-wrapper input");
      if (input) input.placeholder = "Enter your address";
    } else {
      pickupBtn.classList.add("active");
      pickupBtn.classList.remove("inactive");
      deliveryBtn.classList.add("inactive");
      deliveryBtn.classList.remove("active");

      // Optional: Change placeholder text
      const input = document.querySelector(".address-input-wrapper input");
      if (input) input.placeholder = "Enter zip code or city";
    }
  }

  if (deliveryBtn && pickupBtn) {
    deliveryBtn.addEventListener("click", () => toggleMode("delivery"));
    pickupBtn.addEventListener("click", () => toggleMode("pickup"));
  }

  // --- FEATURE 2: Order Button Redirect ---
  const orderBtn = document.querySelector(".order-btn");
  const addressInput = document.querySelector(".address-input-wrapper input");

  if (orderBtn && addressInput) {
    orderBtn.addEventListener("click", () => {
      const address = addressInput.value.trim();

      if (address === "") {
        alert("Please enter an address first!");
        return;
      }

      console.log(`Ordering for address: ${address}`);
      // window.location.href = `results.html?location=${encodeURIComponent(address)}`;
      alert(`Redirecting to search results for: ${address}`);
    });
  }

  // --- FEATURE 3: Bag/Cart Click ---
  const bagBtn = document.querySelector(".bag-btn");
  if (bagBtn) {
    bagBtn.addEventListener("click", () => {
      // Navigate to cart page
      window.location.href = "cart.html";
    });
  }

  // --- FEATURE 4: User Dropdown Toggle (MOVED OUTSIDE) ---
  const userMenuBtn = document.getElementById("userMenuBtn");
  const userDropdown = document.getElementById("userDropdown");

  if (userMenuBtn && userDropdown) {
    // Toggle menu on click
    userMenuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle("show");
    });

    // Close menu when clicking ANYWHERE else on the page
    document.addEventListener("click", (e) => {
      if (!userDropdown.contains(e.target) && !userMenuBtn.contains(e.target)) {
        userDropdown.classList.remove("show");
      }
    });
  }
});
