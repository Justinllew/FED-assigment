// State Management
const state = {
  items: [
    { id: 1, name: "Truffle Burger", price: 18.5, qty: 2 },
    { id: 2, name: "Sweet Potato Fries", price: 6.0, qty: 1 },
    { id: 3, name: "Vanilla Shake", price: 5.5, qty: 1 },
  ],
  mode: "delivery", // 'delivery' or 'pickup'
  availablePoints: 200.73,
  usedPoints: 0,
  offerActive: true,
  offerDiscount: 5.0,
  processing: false,
};

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  renderItems();
  calculateTotals();
});

function renderItems() {
  const container = document.getElementById("order-items");
  container.innerHTML = state.items
    .map(
      (item) => `
        <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
                <div class="w-12 h-12 bg-cream rounded-lg flex items-center justify-center text-primary border border-primary/10">
                    <i class="fa-solid fa-burger"></i>
                </div>
                <div>
                    <div class="font-bold text-gray-900">${item.name}</div>
                    <div class="text-sm text-gray-500">Qty: ${item.qty}</div>
                </div>
            </div>
            <div class="font-bold text-gray-900">$${(item.price * item.qty).toFixed(2)}</div>
        </div>
    `,
    )
    .join("");
}

function setMode(mode) {
  state.mode = mode;

  // Update UI
  document
    .getElementById("mode-delivery")
    .classList.toggle("active", mode === "delivery");
  document
    .getElementById("mode-pickup")
    .classList.toggle("active", mode === "pickup");

  document
    .getElementById("mode-delivery")
    .querySelector("i")
    .classList.toggle("text-primary", mode === "delivery");
  document
    .getElementById("mode-delivery")
    .querySelector("i")
    .classList.toggle("text-gray-400", mode !== "delivery");
  document
    .getElementById("mode-pickup")
    .querySelector("i")
    .classList.toggle("text-primary", mode === "pickup");
  document
    .getElementById("mode-pickup")
    .querySelector("i")
    .classList.toggle("text-gray-400", mode !== "pickup");

  // Show/hide address
  const addrSection = document.getElementById("address-section");
  if (mode === "delivery") {
    addrSection.style.display = "block";
    addrSection.classList.add("slide-up");
  } else {
    addrSection.style.display = "none";
  }

  calculateTotals();
}

function toggleOffer() {
  state.offerActive = !state.offerActive;
  const checkbox = document.getElementById("offer-checkbox");

  if (state.offerActive) {
    checkbox.classList.remove("bg-white", "border-gray-300", "text-gray-400");
    checkbox.classList.add("bg-primary", "border-primary", "text-white");
    checkbox.innerHTML = '<i class="fa-solid fa-check"></i>';
    document
      .getElementById("offer-item")
      .classList.add("border-primary", "bg-cream");
    document
      .getElementById("offer-item")
      .classList.remove("border-gray-200", "bg-white");
  } else {
    checkbox.classList.add("bg-white", "border-gray-300");
    checkbox.classList.remove("bg-primary", "border-primary", "text-white");
    checkbox.innerHTML = "";
    document
      .getElementById("offer-item")
      .classList.remove("border-primary", "bg-cream");
    document
      .getElementById("offer-item")
      .classList.add("border-gray-200", "bg-white");
  }

  calculateTotals();
}

function togglePoints() {
  const checkbox = document.getElementById("points-toggle");
  const inputSection = document.getElementById("points-input-section");

  if (checkbox.checked) {
    inputSection.classList.remove("hidden");
    document.getElementById("points-input").focus();
  } else {
    inputSection.classList.add("hidden");
    state.usedPoints = 0;
    document.getElementById("points-input").value = "";
    document.getElementById("points-discount-display").textContent = "0.00";
    calculateTotals();
  }
}

function validatePoints() {
  const input = document.getElementById("points-input");
  let val = parseFloat(input.value) || 0;

  // Max validation
  if (val > state.availablePoints) {
    val = state.availablePoints;
    input.value = val;
  }

  // Max based on order total (can't discount more than total)
  const currentTotal = calculateRawTotal();
  const maxAllowed = Math.min(state.availablePoints, currentTotal * 100); // 1 point = 1 cent

  if (val > maxAllowed) {
    val = Math.floor(maxAllowed);
    input.value = val;
  }

  state.usedPoints = val;
  document.getElementById("points-discount-display").textContent = (
    val / 100
  ).toFixed(2);
  calculateTotals();
}

function applyMaxPoints() {
  const currentTotal = calculateRawTotal();
  const maxPoints = Math.min(state.availablePoints, currentTotal * 100);
  document.getElementById("points-input").value = Math.floor(maxPoints);
  validatePoints();
}

function calculateRawTotal() {
  const subtotal = state.items.reduce(
    (sum, item) => sum + item.price * item.qty,
    0,
  );
  const platformFee = subtotal * 0.05;
  const deliveryFee = state.mode === "delivery" ? subtotal * 0.3 : 0;
  const offerDiscount = state.offerActive ? state.offerDiscount : 0;

  return subtotal + platformFee + deliveryFee - offerDiscount;
}

function calculateTotals() {
  const subtotal = state.items.reduce(
    (sum, item) => sum + item.price * item.qty,
    0,
  );
  const platformFee = subtotal * 0.05;
  const deliveryFee = state.mode === "delivery" ? subtotal * 0.3 : 0;
  const offerDiscount = state.offerActive ? state.offerDiscount : 0;
  const pointsDiscount = state.usedPoints / 100; // 1 point = 1 cent

  let total =
    subtotal + platformFee + deliveryFee - offerDiscount - pointsDiscount;
  if (total < 0) total = 0;

  // Calculate points to earn (1 dollar = 10 points) based on final paid amount
  const pointsToEarn = Math.floor(total * 10);

  // Update UI
  document.getElementById("bill-subtotal").textContent =
    `$${subtotal.toFixed(2)}`;
  document.getElementById("bill-platform").textContent =
    `$${platformFee.toFixed(2)}`;

  const deliveryRow = document.getElementById("bill-delivery-row");
  if (state.mode === "delivery") {
    deliveryRow.style.display = "flex";
    document.getElementById("bill-delivery").textContent =
      `$${deliveryFee.toFixed(2)}`;
  } else {
    deliveryRow.style.display = "none";
  }

  const offerRow = document.getElementById("bill-offer-row");
  if (state.offerActive && offerDiscount > 0) {
    offerRow.classList.remove("hidden");
    document.getElementById("bill-offer").textContent =
      `-$${offerDiscount.toFixed(2)}`;
  } else {
    offerRow.classList.add("hidden");
  }

  const pointsRow = document.getElementById("bill-points-row");
  if (state.usedPoints > 0) {
    pointsRow.classList.remove("hidden");
    document.getElementById("bill-points").textContent =
      `-$${pointsDiscount.toFixed(2)}`;
  } else {
    pointsRow.classList.add("hidden");
  }

  document.getElementById("bill-total").textContent = `$${total.toFixed(2)}`;
  document.getElementById("footer-total").textContent = `$${total.toFixed(2)}`;
  document.getElementById("points-earning").textContent =
    `+${pointsToEarn} pts`;

  return { total, pointsToEarn };
}

function validateAddress() {
  if (state.mode === "pickup") return true;

  const street = document.getElementById("addr-street").value.trim();
  const city = document.getElementById("addr-city").value.trim();
  const postal = document.getElementById("addr-postal").value.trim();

  return street && city && postal;
}

function processPayment() {
  if (state.processing) return;

  // Validation
  if (state.mode === "delivery" && !validateAddress()) {
    // Shake animation on address section instead of alert
    const addrSection = document.getElementById("address-section");
    addrSection.classList.add("shake");
    setTimeout(() => addrSection.classList.remove("shake"), 500);

    // Highlight empty fields
    if (!document.getElementById("addr-street").value.trim())
      document.getElementById("addr-street").classList.add("border-red-500");
    if (!document.getElementById("addr-city").value.trim())
      document.getElementById("addr-city").classList.add("border-red-500");
    if (!document.getElementById("addr-postal").value.trim())
      document.getElementById("addr-postal").classList.add("border-red-500");

    return;
  }

  state.processing = true;
  const btn = document.getElementById("pay-button");
  btn.innerHTML =
    '<div class="loading-spinner border-white border-t-transparent w-5 h-5"></div>';
  btn.classList.add("opacity-75", "cursor-not-allowed");

  // Show modal
  const modal = document.getElementById("payment-modal");
  const loading = document.getElementById("payment-loading");
  const success = document.getElementById("payment-success");
  const failed = document.getElementById("payment-failed");

  modal.classList.remove("hidden");
  loading.classList.remove("hidden");
  success.classList.add("hidden");
  failed.classList.add("hidden");

  // Simulate API call (2 seconds)
  setTimeout(() => {
    loading.classList.add("hidden");

    // 90% success rate simulation
    if (Math.random() > 0.1) {
      // Success
      const { pointsToEarn } = calculateTotals();
      document.getElementById("earned-points-success").textContent =
        pointsToEarn;
      success.classList.remove("hidden");

      // Update available points (subtract used, add earned)
      state.availablePoints =
        state.availablePoints - state.usedPoints + pointsToEarn;
      document.getElementById("available-points").textContent =
        state.availablePoints.toFixed(2);
    } else {
      // Failure
      failed.classList.remove("hidden");
      state.processing = false;
      resetButton();
    }
  }, 2000);
}

function resetButton() {
  const btn = document.getElementById("pay-button");
  btn.innerHTML =
    '<span>Place Order</span><i class="fa-solid fa-arrow-right"></i>';
  btn.classList.remove("opacity-75", "cursor-not-allowed");
}

function retryPayment() {
  document.getElementById("payment-failed").classList.add("hidden");
  document.getElementById("payment-loading").classList.remove("hidden");

  setTimeout(() => {
    document.getElementById("payment-loading").classList.add("hidden");
    const { pointsToEarn } = calculateTotals();
    document.getElementById("earned-points-success").textContent = pointsToEarn;
    document.getElementById("payment-success").classList.remove("hidden");
  }, 1500);
}

function closeModal() {
  document.getElementById("payment-modal").classList.add("hidden");
  state.processing = false;
  resetButton();

  // Reset form for demo purposes
  state.usedPoints = 0;
  state.offerActive = true;
  document.getElementById("points-toggle").checked = false;
  document.getElementById("points-input").value = "";
  document.getElementById("points-input-section").classList.add("hidden");

  // Reset address error states
  document.getElementById("addr-street").classList.remove("border-red-500");
  document.getElementById("addr-city").classList.remove("border-red-500");
  document.getElementById("addr-postal").classList.remove("border-red-500");

  calculateTotals();
}

// Remove red borders on input
document.addEventListener("input", (e) => {
  if (e.target.tagName === "INPUT") {
    e.target.classList.remove("border-red-500");
  }
});
