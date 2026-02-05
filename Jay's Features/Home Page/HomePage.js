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
      document.querySelector("input").placeholder = "Enter your address";
    } else {
      pickupBtn.classList.add("active");
      pickupBtn.classList.remove("inactive");
      deliveryBtn.classList.add("inactive");
      deliveryBtn.classList.remove("active");

      // Optional: Change placeholder text
      document.querySelector("input").placeholder = "Enter zip code or city";
    }
  }

  deliveryBtn.addEventListener("click", () => toggleMode("delivery"));
  pickupBtn.addEventListener("click", () => toggleMode("pickup"));

  // --- FEATURE 2: Order Button Redirect ---
  const orderBtn = document.querySelector(".order-btn");
  const addressInput = document.querySelector(".address-input-wrapper input");

  orderBtn.addEventListener("click", () => {
    const address = addressInput.value.trim();

    if (address === "") {
      alert("Please enter an address first!");
      return; // Stop here if empty
    }

    // Logic to link to another page (Simulated)
    console.log(`Ordering for address: ${address}`);

    // UNCOMMENT the line below to actually go to a new page:
    // window.location.href = `results.html?location=${encodeURIComponent(address)}`;
    alert(`Redirecting to search results for: ${address}`);
  });

  // --- FEATURE 3: Bag/Cart Click ---
  const bagBtn = document.querySelector(".bag-btn");
  bagBtn.addEventListener("click", () => {
    // Navigate to cart page
    window.location.href = "cart.html";
  });
});
