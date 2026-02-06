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

// 1. LOAD DATA
async function loadOrders(showLoading = true) {
  if (showLoading) {
    const icon = document.getElementById("refresh-icon");
    if (icon) icon.classList.add("fa-spin");
  }

  try {
    // NOTE: Ensure your backend supports this endpoint
    const res = await fetch(`${API_URL}/vendors/${VENDOR_ID}/orders`);
    allOrders = await res.json();

    updateCounts();
    renderOrders();
  } catch (e) {
    console.error("Error loading orders:", e);
  } finally {
    const icon = document.getElementById("refresh-icon");
    if (icon) setTimeout(() => icon.classList.remove("fa-spin"), 500);
  }
}

// 2. RENDER
function renderOrders() {
  const container = document.getElementById("orders-container");
  if (!container) return;

  const filteredOrders = allOrders.filter((o) => o.status === currentTab);

  if (filteredOrders.length === 0) {
    container.innerHTML = `
            <div style="grid-column: 1/-1; text-align:center; padding:60px; color:#999;">
                <i class="fas fa-clipboard-check" style="font-size: 3rem; margin-bottom: 20px; opacity:0.3;"></i>
                <p>No ${currentTab.toLowerCase()} orders.</p>
            </div>`;
    return;
  }

  container.innerHTML = filteredOrders
    .map((order) => {
      const timeAgo = Math.floor(
        (new Date() - new Date(order.timestamp)) / 60000,
      );

      // Generate Items HTML
      const itemsHtml = order.items
        .map(
          (item) => `
            <div class="item-row">
                <span><span class="item-qty">${item.qty}x</span> Item #${item.itemId}</span>
                <span>$${(item.price * item.qty).toFixed(2)}</span>
            </div>
        `,
        )
        .join("");

      // Generate Button based on status
      let actionBtn = "";
      if (order.status === "PENDING") {
        actionBtn = `<button class="btn btn-primary" onclick="updateOrderStatus('${order.id}', 'COOKING')">Start Cooking</button>`;
      } else if (order.status === "COOKING") {
        actionBtn = `<button class="btn btn-success" onclick="updateOrderStatus('${order.id}', 'COMPLETED')">Mark Ready</button>`;
      }

      return `
            <div class="order-card" data-status="${order.status}">
                <div class="card-header">
                    <span class="order-id">#${order.id}</span>
                    <span class="timer-badge">${timeAgo}m ago</span>
                </div>
                <div class="card-body">
                    ${itemsHtml}
                </div>
                <div class="card-footer">
                    ${actionBtn}
                </div>
            </div>`;
    })
    .join("");
}

// 3. ACTIONS
async function updateOrderStatus(orderId, newStatus) {
  try {
    await fetch(`${API_URL}/orders/${orderId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    loadOrders(false);
  } catch (e) {
    console.error("Error updating:", e);
  }
}

function updateCounts() {
  const pending = allOrders.filter((o) => o.status === "PENDING").length;
  const cooking = allOrders.filter((o) => o.status === "COOKING").length;
  const completed = allOrders.filter((o) => o.status === "COMPLETED").length;

  document.getElementById("count-PENDING").innerText = pending;
  document.getElementById("count-COOKING").innerText = cooking;
  document.getElementById("count-COMPLETED").innerText = completed;
}

// 4. TAB SWITCHER
window.switchTab = function (event, tabName) {
  currentTab = tabName;

  // Update visual buttons
  document
    .querySelectorAll(".tab-btn")
    .forEach((btn) => btn.classList.remove("active"));
  event.currentTarget.classList.add("active");

  renderOrders();
};

window.manualRefresh = function () {
  loadOrders(true);
};
