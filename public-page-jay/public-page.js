document.addEventListener("DOMContentLoaded", () => {
  // --- Helper function to handle navigation ---
  function navigateTo(url) {
    window.location.href = url;
  }

  // 1. Select Navigation Buttons (NEA Inspector & Login)
  // We select the container first, then the specific buttons inside
  const navButtons = document.querySelectorAll(".nav-right .btn-primary");
  const neaButton = navButtons[0]; // The first button (NEA Inspector)
  const loginButton = navButtons[1]; // The second button (Login)

  // 2. Select Tab Buttons (Delivery & Pickup)
  const tabButtons = document.querySelectorAll(".tabs .tab-btn");
  const deliveryBtn = tabButtons[0];
  const pickupBtn = tabButtons[1];

  // 3. Select Order Button
  const orderBtn = document.querySelector(".order-btn");

  // --- Add Click Events ---

  // NEA Inspector Button
  if (neaButton) {
    neaButton.addEventListener("click", () => {
      // Replace with your actual URL
      navigateTo("https://www.nea.gov.sg");
    });
  }

  // Login Button
  if (loginButton) {
    loginButton.addEventListener("click", () => {
      navigateTo("../login-page-vp-jay\role_selection.html");
    });
  }

  // Delivery Tab
  if (deliveryBtn) {
    deliveryBtn.addEventListener("click", () => {
      navigateTo("https://example.com/delivery");
    });
  }

  // Pickup Tab
  if (pickupBtn) {
    pickupBtn.addEventListener("click", () => {
      navigateTo("https://example.com/pickup");
    });
  }

  // Order Button
  if (orderBtn) {
    orderBtn.addEventListener("click", () => {
      // You can also grab the value of the input before redirecting
      const address = document.querySelector(".location-input").value;
      if (address) {
        // Example: sending address as a query parameter
        navigateTo(
          `https://example.com/order?location=${encodeURIComponent(address)}`,
        );
      } else {
        navigateTo("https://example.com/order");
      }
    });
  }
});
