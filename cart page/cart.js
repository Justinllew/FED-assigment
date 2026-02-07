// Cart State
let cartState = {
  items: [
    { id: 1, name: "Truffle Burger", price: 18.5, qty: 2, image: "fa-burger" },
    {
      id: 2,
      name: "Sweet Potato Fries",
      price: 6.0,
      qty: 1,
      image: "fa-fries",
    },
    {
      id: 3,
      name: "Vanilla Shake",
      price: 5.5,
      qty: 1,
      image: "fa-glass-water",
    },
  ],
  itemToRemove: null,
  promoApplied: false,
  discount: 0,
};

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  renderCart();
  updateTotals();

  // Add enter key support for promo code
  document.getElementById("promo-input").addEventListener("keypress", (e) => {
    if (e.key === "Enter") applyPromo();
  });
});

function renderCart() {
  const container = document.getElementById("cart-items");
  const emptyState = document.getElementById("empty-state");
  const cartCount = document.getElementById("cart-count");

  if (cartState.items.length === 0) {
    container.innerHTML = "";
    emptyState.classList.remove("hidden");
    cartCount.textContent = "0";
    document
      .getElementById("checkout-btn")
      .classList.add("opacity-50", "cursor-not-allowed");
    return;
  }

  emptyState.classList.add("hidden");
  document
    .getElementById("checkout-btn")
    .classList.remove("opacity-50", "cursor-not-allowed");
  cartCount.textContent = cartState.items.reduce(
    (sum, item) => sum + item.qty,
    0,
  );

  container.innerHTML = cartState.items
    .map(
      (item, index) => `
        <div class="cart-item flex items-center justify-between py-2 border-b border-gray-100 last:border-0" id="item-${item.id}">
            <div class="flex items-center space-x-4 flex-1">
                <div class="w-16 h-16 bg-cream rounded-xl flex items-center justify-center text-primary border border-primary/10 shadow-sm">
                    <i class="fa-solid ${item.image} text-2xl"></i>
                </div>
                <div class="flex-1">
                    <h3 class="font-bold text-gray-900 text-sm md:text-base">${item.name}</h3>
                    <p class="text-primary font-bold text-sm">$${item.price.toFixed(2)}</p>
                </div>
            </div>
            
            <div class="flex items-center space-x-3">
                <!-- Quantity Controls -->
                <div class="flex items-center bg-cream rounded-lg border border-primary/20 overflow-hidden">
                    <button onclick="updateQuantity(${item.id}, -1)" class="quantity-btn w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 no-select">
                        <i class="fa-solid fa-minus text-xs"></i>
                    </button>
                    <span class="w-8 text-center font-bold text-sm text-gray-900">${item.qty}</span>
                    <button onclick="updateQuantity(${item.id}, 1)" class="quantity-btn w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 no-select">
                        <i class="fa-solid fa-plus text-xs"></i>
                    </button>
                </div>
                
                <!-- Item Total -->
                <div class="w-20 text-right font-bold text-gray-900">
                    $${(item.price * item.qty).toFixed(2)}
                </div>
                
                <!-- Remove Button -->
                <button onclick="showRemoveModal(${item.id})" class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 transition ml-2">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        </div>
    `,
    )
    .join("");
}

function updateQuantity(id, change) {
  const item = cartState.items.find((i) => i.id === id);
  if (!item) return;

  const newQty = item.qty + change;
  if (newQty < 1) {
    showRemoveModal(id);
    return;
  }
  if (newQty > 10) {
    // Optional: Show max limit message
    return;
  }

  item.qty = newQty;
  renderCart();
  updateTotals();

  // Add subtle animation to the updated row
  const row = document.getElementById(`item-${id}`);
  row.style.backgroundColor = "rgba(124, 229, 58, 0.1)";
  setTimeout(() => {
    row.style.backgroundColor = "";
  }, 300);
}

function showRemoveModal(id) {
  const item = cartState.items.find((i) => i.id === id);
  if (!item) return;

  cartState.itemToRemove = id;
  document.getElementById("remove-item-name").textContent = item.name;
  document.getElementById("remove-modal").classList.remove("hidden");
}

function closeRemoveModal() {
  document.getElementById("remove-modal").classList.add("hidden");
  cartState.itemToRemove = null;
}

function confirmRemove() {
  if (!cartState.itemToRemove) return;

  const element = document.getElementById(`item-${cartState.itemToRemove}`);
  element.classList.add("fade-out");

  setTimeout(() => {
    cartState.items = cartState.items.filter(
      (i) => i.id !== cartState.itemToRemove,
    );
    renderCart();
    updateTotals();
    closeRemoveModal();
  }, 300);
}

function updateTotals() {
  const subtotal = cartState.items.reduce(
    (sum, item) => sum + item.price * item.qty,
    0,
  );
  const tax = subtotal * 0.08; // 8% tax example
  const total = subtotal + tax - cartState.discount;

  document.getElementById("summary-subtotal").textContent =
    `$${subtotal.toFixed(2)}`;
  document.getElementById("summary-tax").textContent = `$${tax.toFixed(2)}`;
  document.getElementById("summary-total").textContent = `$${total.toFixed(2)}`;
  document.getElementById("footer-total").textContent = `$${total.toFixed(2)}`;

  // Save to localStorage for checkout page
  localStorage.setItem("cartSubtotal", subtotal.toFixed(2));
  localStorage.setItem("cartItems", JSON.stringify(cartState.items));
}

function applyPromo() {
  const input = document.getElementById("promo-input");
  const code = input.value.trim().toUpperCase();

  if (!code) return;

  if (code === "SAVE5" && !cartState.promoApplied) {
    cartState.discount = 5.0;
    cartState.promoApplied = true;
    input.value = "";
    input.placeholder = "SAVE5 applied!";
    input.classList.add("border-primary", "bg-primary-light");
    updateTotals();

    // Show success feedback
    setTimeout(() => {
      input.classList.remove("border-primary", "bg-primary-light");
      input.placeholder = "Promo code";
    }, 2000);
  } else if (cartState.promoApplied) {
    input.classList.add("border-red-500");
    setTimeout(() => input.classList.remove("border-red-500"), 1000);
  } else {
    input.classList.add("border-red-500", "shake");
    setTimeout(() => input.classList.remove("border-red-500", "shake"), 500);
  }
}

function proceedToCheckout() {
  if (cartState.items.length === 0) return;

  const btn = document.getElementById("checkout-btn");
  btn.classList.add("checkout-loading");
  btn.innerHTML = '<span class="opacity-0">Checkout</span>';

  // Simulate brief loading then navigate
  setTimeout(() => {
    window.location.href = "checkout.html";
  }, 600);
}

function continueShopping() {
  // In a real app, this would navigate to the menu/store page
  window.history.back();
}

// Close modal on backdrop click
document.getElementById("remove-modal").addEventListener("click", (e) => {
  if (e.target === e.currentTarget) {
    closeRemoveModal();
  }
});
