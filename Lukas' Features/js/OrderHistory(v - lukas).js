// CONFIGURATION
const API_URL = "http://localhost:3000/api";
const VENDOR_ID = 101;

// STATE
let allOrders = [];
let currentTab = "PENDING";

document.addEventListener("DOMContentLoaded", () => {
  loadOrders();
  // Auto-refresh every 5 seconds
  setInterval(() => loadOrders(false), 5000);
});

// ==========================================
// 1. DATA OPERATIONS
// ==========================================

async function loadOrders(showLoading = true) {
  // Show spinner if requested
  if (showLoading) {
    const icon = document.getElementById("refresh-icon");
    if (icon) icon.classList.add("fa-spin");
  }

  try {
    const res = await fetch(`${API_URL}/vendors/${VENDOR_ID}/orders`);
    allOrders = await res.json();

    updateCounts();
    renderOrders();
  } catch (e) {
    console.error("Error loading orders:", e);
  } finally {
    // Stop spinner
    const icon = document.getElementById("refresh-icon");
    if (icon) setTimeout(() => icon.classList.remove("fa-spin"), 500);
  }
}

async function updateOrderStatus(orderId, newStatus) {
  // 1. Optimistic UI update (Instant visual feedback)
  const card = document.getElementById(`card-${orderId}`);
  if (card) {
    card.style.transform = "scale(0.95)";
    card.style.opacity = "0.5";
  }

  // 2. Send to Server
  try {
    const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    const result = await res.json();
    if (result.success) {
      loadOrders(false); // Reload data to move the card
    } else {
      alert("Failed to update order");
      loadOrders(false); // Reset on failure
    }
  } catch (e) {
    console.error("Error updating status:", e);
  }
}

// ==========================================
// 2. RENDERING LOGIC
// ==========================================

function renderOrders() {
  const container = document.getElementById("orders-container");
  if (!container) return;

  const filteredOrders = allOrders.filter((o) => o.status === currentTab);

  // EMPTY STATE
  if (filteredOrders.length === 0) {
    container.innerHTML = `
            <div style="grid-column: 1/-1; text-align:center; padding:60px; color:#9ca3af;">
                <i class="fas fa-clipboard-check" style="font-size: 3rem; margin-bottom: 20px; opacity:0.3;"></i>
                <p>No <strong>${currentTab.toLowerCase()}</strong> orders.</p>
            </div>`;
    return;
  }

  // RENDER CARDS
  container.innerHTML = filteredOrders
    .map((order) => createOrderCard(order))
    .join("");
}

function createOrderCard(order) {
  const itemsHtml = order.items
    .map(
      (item) => `
        <div class="item-row">
            <div><span class="item-qty">${item.qty}x</span> <span class="item-name">Item #${item.itemId}</span></div>
            <span>$${(item.price * item.qty).toFixed(2)}</span>
        </div>
    `,
    )
    .join("");

  const timeAgo = Math.floor((new Date() - new Date(order.timestamp)) / 60000);

  let actionButton = "";
  if (order.status === "PENDING") {
    actionButton = `<button class="btn btn-primary" onclick="updateOrderStatus('${order.id}', 'COOKING')">Start Cooking</button>`;
  } else if (order.status === "COOKING") {
    actionButton = `<button class="btn btn-success" onclick="updateOrderStatus('${order.id}', 'COMPLETED')">Mark Ready</button>`;
  } else {
    actionButton = `<button class="btn btn-outline" disabled>Completed</button>`;
  }

  return `
    <div class="order-card" id="card-${order.id}" data-status="${order.status}">
        <div class="card-header">
            <div>
                <div class="order-id">#${order.id}</div>
                <div class="customer-name">User ${order.customerId}</div>
            </div>
            <div class="timer-badge">${timeAgo}m ago</div>
        </div>
        <div class="card-body">
            <div class="item-list">${itemsHtml}</div>
            <div class="total-price">Total: $${order.total.toFixed(2)}</div>
        </div>
        <div class="card-footer">
            <button class="btn btn-outline"><i class="fas fa-print"></i></button>
            ${actionButton}
        </div>
    </div>`;
}

function updateCounts() {
  const pendingCount = allOrders.filter((o) => o.status === "PENDING").length;
  const cookingCount = allOrders.filter((o) => o.status === "COOKING").length;
  const completedCount = allOrders.filter(
    (o) => o.status === "COMPLETED",
  ).length;

  updateBadge("count-PENDING", pendingCount);
  updateBadge("count-COOKING", cookingCount);
  updateBadge("count-COMPLETED", completedCount);
}

function updateBadge(id, newCount) {
  const el = document.getElementById(id);
  if (el) el.innerText = newCount;
}

// ==========================================
// 3. INTERACTIONS (THE FIX IS HERE)
// ==========================================

window.switchTab = function (arg1, arg2) {
  // SMART DETECTION: Did you pass 'event' or just the name?
  let targetTab = "";
  let clickedBtn = null;

  if (typeof arg1 === "string") {
    // You wrote: onclick="switchTab('COOKING')"
    targetTab = arg1;
    // Find the button manually
    const buttons = document.querySelectorAll(".tab-btn");
    buttons.forEach((btn) => {
      if (btn.getAttribute("onclick").includes(targetTab)) clickedBtn = btn;
    });
  } else {
    // You wrote: onclick="switchTab(event, 'COOKING')"
    targetTab = arg2;
    clickedBtn = arg1.currentTarget;
  }

  currentTab = targetTab;

  // VISUAL UPDATE
  document
    .querySelectorAll(".tab-btn")
    .forEach((btn) => btn.classList.remove("active"));
  if (clickedBtn) clickedBtn.classList.add("active");

  renderOrders();
};

window.manualRefresh = function () {
  loadOrders(true);
};
