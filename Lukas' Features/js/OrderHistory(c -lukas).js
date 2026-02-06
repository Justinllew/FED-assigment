// CONFIGURATION
const API_URL = "http://localhost:3000/api";
// Get the logged-in user (Default to 2/Hungry Jane if missing)
const USER_ID = localStorage.getItem("userId") || 2;

// STATE
let vendorsMap = {}; // To look up Vendor Name by ID (e.g., 101 -> "McDonalds")

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Fetch Vendor details first (so we know names)
  await loadVendors();

  // 2. Load Orders
  await loadOrders();

  // 3. Set User Name
  document.getElementById("user-name-display").innerText =
    `User ID: ${USER_ID}`;
});

// ==========================================
// 1. DATA FETCHING
// ==========================================

async function loadVendors() {
  try {
    const res = await fetch(`${API_URL}/vendors`);
    const vendors = await res.json();
    // Create a quick lookup map: { 101: "Lim's Chicken Rice" }
    vendors.forEach((v) => (vendorsMap[v.id] = v.name));
  } catch (e) {
    console.error("Error loading vendors:", e);
  }
}

async function loadOrders() {
  try {
    const res = await fetch(`${API_URL}/customers/${USER_ID}/history`);
    const orders = await res.json();

    // Clear Loading Text
    const activeContainer = document.getElementById("active-list");
    const historyContainer = document.getElementById("history-list");
    activeContainer.innerHTML = "";
    historyContainer.innerHTML = "";

    // Filter Orders
    // Active = Pending, Cooking, or On the Way
    const activeOrders = orders.filter((o) =>
      ["PENDING", "COOKING", "READY", "ON_WAY"].includes(o.status),
    );
    // History = Completed or Cancelled
    const pastOrders = orders.filter((o) =>
      ["COMPLETED", "CANCELLED"].includes(o.status),
    );

    // --- RENDER ACTIVE ---
    if (activeOrders.length === 0) {
      activeContainer.innerHTML = `<div style="text-align:center; padding:40px; color:#888;">No active orders right now.</div>`;
    } else {
      activeOrders.forEach((order) => {
        activeContainer.innerHTML += createActiveOrderCard(order);
      });
    }

    // --- RENDER HISTORY ---
    if (pastOrders.length === 0) {
      historyContainer.innerHTML = `<div style="text-align:center; padding:40px; color:#888;">No past orders found.</div>`;
    } else {
      pastOrders.forEach((order) => {
        historyContainer.innerHTML += createHistoryCard(order);
      });
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
    document.getElementById("active-list").innerHTML =
      `<p style="color:red; text-align:center;">Error connecting to server. Is 'node server.js' running?</p>`;
  }
}

// ==========================================
// 2. HTML GENERATORS
// ==========================================

function createActiveOrderCard(order) {
  const vendorName = vendorsMap[order.vendorId] || `Vendor #${order.vendorId}`;
  const total = order.total.toFixed(2);

  // Generate Receipt Rows from items array
  const itemsHtml = order.items
    .map(
      (item) => `
        <div class="receipt-row">
            <span>${item.qty}x Item #${item.itemId}</span> <span>$${(item.price * item.qty).toFixed(2)}</span>
        </div>
    `,
    )
    .join("");

  return `
    <div class="track-card">
        <div class="track-header">
            <div>
                <div class="store-name">${vendorName}</div>
                <div class="order-meta">Order #${order.id} • Arriving Soon</div>
            </div>
            <div class="status-badge-container">
                <span class="status-badge">${order.status}</span>
            </div>
        </div>

        <div class="stepper">
            ${generateStepper(order.status)}
        </div>

        <div class="receipt-box">
            ${itemsHtml}
            <div class="receipt-total">
                <span>Total</span> <span>$${total}</span>
            </div>
        </div>
    </div>`;
}

function createHistoryCard(order) {
  const vendorName = vendorsMap[order.vendorId] || `Vendor #${order.vendorId}`;
  const date = new Date(order.timestamp).toLocaleDateString();

  return `
    <div class="track-card">
        <div class="track-header history-header">
            <div>
                <div class="store-name muted">${vendorName}</div>
                <div class="order-meta">Order #${order.id} • ${date} • ${order.status}</div>
            </div>
            <button class="btn-action" onclick="alert('Reorder feature coming soon!')">Reorder</button>
        </div>
    </div>`;
}

// ==========================================
// 3. HELPER LOGIC (The Progress Bar)
// ==========================================

function generateStepper(currentStatus) {
  // Define the sequence of status steps
  const steps = ["PENDING", "COOKING", "ON_WAY", "COMPLETED"];
  const labels = ["Placed", "Cooking", "On Way", "Delivered"];

  // Find where we are in the process (0 to 3)
  let currentIndex = steps.indexOf(currentStatus);
  if (currentIndex === -1) currentIndex = 0; // Default to start if unknown

  let html = "";

  for (let i = 0; i < steps.length; i++) {
    let className = "step";
    let content = i + 1; // Default number (1, 2, 3...)

    if (i < currentIndex) {
      // Steps we have already passed (Green checkmark)
      className += " completed";
      content = "✓";
    } else if (i === currentIndex) {
      // Current step (Green outline)
      className += " active";
    }

    html += `
        <div class="${className}">
            <div class="step-circle">${content}</div>
            <div class="step-label">${labels[i]}</div>
        </div>`;
  }
  return html;
}

// ==========================================
// 4. TAB SWITCHING (Active vs History)
// ==========================================
window.toggleView = function (viewName) {
  const activeList = document.getElementById("active-list");
  const historyList = document.getElementById("history-list");
  const activeBtn = document.getElementById("btn-active");
  const historyBtn = document.getElementById("btn-history");

  if (viewName === "active") {
    activeBtn.classList.add("active");
    historyBtn.classList.remove("active");
    activeList.classList.remove("hidden");
    historyList.classList.add("hidden");
  } else {
    historyBtn.classList.add("active");
    activeBtn.classList.remove("active");
    historyList.classList.remove("hidden");
    activeList.classList.add("hidden");
  }
};
