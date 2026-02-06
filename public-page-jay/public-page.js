document.addEventListener("DOMContentLoaded", () => {
  // Helper function
  function navigateTo(url) {
    window.location.href = url;
  }

  // 1. Select The Footer Button (Using ID for specificity)
  const neaButton = document.getElementById("nea-inspector-btn");

  // 2. Select Tabs
  const deliveryBtn = document.getElementById("delivery-tab");
  const pickupBtn = document.getElementById("pickup-tab");

  // 3. Select Order Button
  const orderBtn = document.querySelector(".order-btn");

  // 4. Select Store Cards
  const storeCards = document.querySelectorAll(".store-card");

  // --- Click Events ---

  // Note: neaButton is now an <a> tag, so standard href navigation works.
  // We don't necessarily need a JS listener unless you want to preventDefault()
  // or add analytics. Leaving it clean for standard navigation.

  // Delivery Tab
  if (deliveryBtn) {
    deliveryBtn.addEventListener("click", () => {
      deliveryBtn.classList.add("active");
      pickupBtn.classList.remove("active");
    });
  }

  // Pickup Tab
  if (pickupBtn) {
    pickupBtn.addEventListener("click", () => {
      pickupBtn.classList.add("active");
      deliveryBtn.classList.remove("active");
    });
  }

  // Order Button
  if (orderBtn) {
    orderBtn.addEventListener("click", () => {
      const addressInput = document.querySelector(".location-input");
      const address = addressInput ? addressInput.value : "";

      if (address) {
        alert(`Ordering for: ${address}`);
      } else {
        alert("Please enter an address first!");
      }
    });
  }

  // Store Cards Interactivity
  storeCards.forEach((card) => {
    card.addEventListener("click", () => {
      const storeName = card.querySelector("h3").innerText;
      console.log(`Clicked on ${storeName}`);
      // navigateTo(...)
    });
  });
});
