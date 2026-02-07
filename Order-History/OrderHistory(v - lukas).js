// ==========================================
// 1. IMPORTS
// ==========================================
import { db, auth } from "../firebase.js";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

// ==========================================
// 2. STATE & INIT
// ==========================================
let allOrders = [];
let currentTab = "PENDING";
let currentVendorId = null;

document.addEventListener("DOMContentLoaded", () => {
  // 1. Authenticate
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("👨‍🍳 Vendor Logged In:", user.uid);
      currentVendorId = user.uid;
      initVendorListener(user.uid);
    } else {
      window.location.href = "../Vendor Login Page/vendor-login.html";
    }
  });
});

// ==========================================
// 3. FIRESTORE LISTENER
// ==========================================
function initVendorListener(vendorId) {
  const icon = document.getElementById("refresh-icon");
  if (icon) icon.classList.add("fa-spin"); // Show loading

  // Path: vendors -> {uid} -> orders
  const ordersRef = collection(db, "vendors", vendorId, "orders");

  onSnapshot(
    ordersRef,
    (snapshot) => {
      // Convert Snapshot to Array
      allOrders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort by Time (Newest First)
      allOrders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      // Update UI
      updateCounts();
      renderOrders();

      if (icon) icon.classList.remove("fa-spin");
    },
    (error) => {
      console.error("Error listening to orders:", error);
    },
  );
}

// ==========================================
// 4. RENDER UI
// ==========================================
function renderOrders() {
  const container = document.getElementById("orders-container");
  if (!container) return;

  // Filter by current Tab
  const filteredOrders = allOrders.filter((o) => {
    const status = o.status || "PENDING";
    return status === currentTab;
  });

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
      // Calculate Time Ago
      const orderTime = order.timestamp
        ? new Date(order.timestamp)
        : new Date();
      const diffMs = new Date() - orderTime;
      const timeAgo = Math.floor(diffMs / 60000);

      // Generate Items HTML
      const itemsHtml = (order.items || [])
        .map(
          (item) => `
            <div class="item-row">
                <span><span class="item-qty">${item.qty}x</span> ${item.name || "Item"}</span>
                <span>$${((item.price || 0) * item.qty).toFixed(2)}</span>
            </div>
        `,
        )
        .join("");

      // Generate Action Button
      let actionBtn = "";
      if (order.status === "PENDING") {
        // Pass ID to the global function
        actionBtn = `<button class="btn btn-primary" onclick="window.updateOrderStatus('${order.id}', 'COOKING')">Start Cooking</button>`;
      } else if (order.status === "COOKING") {
        actionBtn = `<button class="btn btn-success" onclick="window.updateOrderStatus('${order.id}', 'ON_WAY')">Mark Ready</button>`;
      } else if (order.status === "ON_WAY") {
        actionBtn = `<button class="btn btn-success" onclick="window.updateOrderStatus('${order.id}', 'COMPLETED')">Complete Order</button>`;
      }

      return `
            <div class="order-card" data-status="${order.status}">
                <div class="card-header">
                    <span class="order-id">#${order.id.slice(-5)}</span>
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

// ==========================================
// 5. ACTIONS
// ==========================================

function updateCounts() {
  const pending = allOrders.filter(
    (o) => (o.status || "PENDING") === "PENDING",
  ).length;
  const cooking = allOrders.filter((o) => o.status === "COOKING").length;
  const completed = allOrders.filter((o) => o.status === "COMPLETED").length;

  if (document.getElementById("count-PENDING"))
    document.getElementById("count-PENDING").innerText = pending;
  if (document.getElementById("count-COOKING"))
    document.getElementById("count-COOKING").innerText = cooking;
  if (document.getElementById("count-COMPLETED"))
    document.getElementById("count-COMPLETED").innerText = completed;
}

// Attach to Window for HTML onclick
window.updateOrderStatus = async function (orderId, newStatus) {
  if (!currentVendorId) return;

  try {
    const orderRef = doc(db, "vendors", currentVendorId, "orders", orderId);
    await updateDoc(orderRef, {
      status: newStatus,
    });
  } catch (e) {
    console.error("Error updating status:", e);
    alert("Failed to update status. Check console.");
  }
};

window.switchTab = function (event, tabName) {
  currentTab = tabName;
  document
    .querySelectorAll(".tab-btn")
    .forEach((btn) => btn.classList.remove("active"));
  event.currentTarget.classList.add("active");

  renderOrders();
};

window.manualRefresh = function () {
  // No-op because onSnapshot is real-time, but we can animate the icon for feedback
  const icon = document.getElementById("refresh-icon");
  if (icon) {
    icon.classList.add("fa-spin");
    setTimeout(() => icon.classList.remove("fa-spin"), 500);
  }
};
