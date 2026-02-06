document.addEventListener("DOMContentLoaded", () => {
  // Helper function
  function navigateTo(url) {
    window.location.href = url;
  }

  // 1. Select The New Footer Button
  const neaButton = document.getElementById("nea-inspector-btn");

  // 2. Select Tabs (Using IDs is safer than index [0] or [1])
  const deliveryBtn = document.getElementById("delivery-tab");
  const pickupBtn = document.getElementById("pickup-tab");

  // 3. Select Order Button
  const orderBtn = document.querySelector(".order-btn");

  // --- Click Events ---

  // NEA Inspector (Now at the bottom)
  if (neaButton) {
    neaButton.addEventListener("click", () => {
      // Replace with your actual NEA login page
      // Assuming you might build a page later or link to external site
      navigateTo("https://www.nea.gov.sg");
    });
  }

  // Delivery Tab
  if (deliveryBtn) {
    deliveryBtn.addEventListener("click", () => {
      // Toggle visual state (simple logic)
      deliveryBtn.classList.add("active");
      pickupBtn.classList.remove("active");
      // navigateTo(...) // Add link if needed
    });
  }

  // Pickup Tab
  if (pickupBtn) {
    pickupBtn.addEventListener("click", () => {
      pickupBtn.classList.add("active");
      deliveryBtn.classList.remove("active");
      // navigateTo(...) // Add link if needed
    });
  }

  // Order Button
  if (orderBtn) {
    orderBtn.addEventListener("click", () => {
      const address = document.querySelector(".location-input").value;
      if (address) {
        alert(`Ordering for: ${address}`);
        // navigateTo(...)
      } else {
        alert("Please enter an address first!");
      }
    });
  }
});
