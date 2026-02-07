import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// --- 1. CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyA8zDkXrfnzEE6OpvEAATqNliz9FBYxOPo",
  authDomain: "hawkerbase-fedasg.firebaseapp.com",
  projectId: "hawkerbase-fedasg",
  storageBucket: "hawkerbase-fedasg.firebasestorage.app",
  messagingSenderId: "216203478131",
  appId: "1:216203478131:web:cb0ff58ba3f51911de9606",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// State
let allOrders = [];
let currentTab = "PENDING";
let currentVendorId = null;

// --- 2. AUTH & INIT ---
document.addEventListener("DOMContentLoaded", () => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("👨‍🍳 Vendor Logged In:", user.uid);
      currentVendorId = user.uid;
      initVendorListener(user.uid);
    } else {
      // alert("You must be logged in as a vendor.");
      // Redirect or show login prompt in real app
      // For testing, you can hardcode a vendor ID here to see UI:
      // currentVendorId = "vjzBxXgKGNgS8JzUUckSApQimXt2";
      // initVendorListener(currentVendorId);
    }
  });
});

// --- 3. FIRESTORE LISTENER ---
function initVendorListener(vendorId) {
  const icon = document.getElementById("refresh-icon");
  if (icon) icon.classList.add("fa-spin");

  // Listen to this specific vendor's orders
  const ordersRef = collection(db, "vendors", vendorId, "orders");

  onSnapshot(
    ordersRef,
    (snapshot) => {
      allOrders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort Newest First
      allOrders.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

      updateCounts();
      renderOrders();

      if (icon) icon.classList.remove("fa-spin");
    },
    (error) => {
      console.error("Error listening to orders:", error);
    },
  );
}

// --- 4. RENDER LOGIC ---
function renderOrders() {
  const container = document.getElementById("orders-container");
  if (!container) return;

  // Filter based on the selected tab
  const filteredOrders = allOrders.filter((o) => {
    const status = o.status || "PENDING";
    return status === currentTab;
  });

  if (filteredOrders.length === 0) {
    container.innerHTML = `
        <div style="grid-column: 1/-1; text-align:center; padding:60px; color:#999;">
            <i class="fas fa-clipboard-list" style="font-size: 3rem; margin-bottom: 20px; opacity:0.3;"></i>
            <p>No ${currentTab.toLowerCase()} orders right now.</p>
        </div>`;
    return;
  }

  container.innerHTML = filteredOrders
    .map((order) => {
      // Time Calculation
      const orderTime = order.timestamp
        ? new Date(order.timestamp)
        : new Date();
      const diffMs = new Date() - orderTime;
      const timeAgo = Math.floor(diffMs / 60000); // Minutes ago

      // Items List
      const itemsHtml = (order.items || [])
        .map(
          (item) => `
        <div class="item-row" style="display:flex; justify-content:space-between; margin-bottom:5px; font-size:0.95rem;">
            <span><strong style="color:#68a357;">${item.qty || 1}x</strong> ${item.name || item}</span>
            <span>$${((item.price || 0) * (item.qty || 1)).toFixed(2)}</span>
        </div>
    `,
        )
        .join("");

      // Determine Button Action
      let actionBtn = "";
      if (order.status === "PENDING") {
        actionBtn = `<button class="btn btn-primary" style="width:100%; padding:10px; background:#68a357; color:white; border:none; border-radius:6px; cursor:pointer;" onclick="window.updateOrderStatus('${order.id}', 'COOKING')">Start Cooking</button>`;
      } else if (order.status === "COOKING") {
        actionBtn = `<button class="btn btn-warning" style="width:100%; padding:10px; background:#f59e0b; color:white; border:none; border-radius:6px; cursor:pointer;" onclick="window.updateOrderStatus('${order.id}', 'ON_WAY')">Mark Ready for Delivery</button>`;
      } else if (order.status === "ON_WAY") {
        actionBtn = `<button class="btn btn-success" style="width:100%; padding:10px; background:#10b981; color:white; border:none; border-radius:6px; cursor:pointer;" onclick="window.updateOrderStatus('${order.id}', 'COMPLETED')">Complete Order</button>`;
      }

      return `
        <div class="order-card" style="background:white; border:1px solid #e5e7eb; border-radius:12px; padding:20px; box-shadow:0 2px 4px rgba(0,0,0,0.05);">
            <div class="card-header" style="display:flex; justify-content:space-between; margin-bottom:15px; border-bottom:1px solid #f0f0f0; padding-bottom:10px;">
                <span class="order-id" style="font-weight:700;">#${(order.orderId || order.id).slice(-5)}</span>
                <span class="timer-badge" style="background:#f3f4f6; padding:2px 8px; border-radius:12px; font-size:0.8rem; color:#666;">${timeAgo}m ago</span>
            </div>
            <div class="card-body" style="margin-bottom:20px;">
                ${itemsHtml}
                <div style="text-align:right; margin-top:10px; font-weight:700;">Total: $${Number(order.total || 0).toFixed(2)}</div>
            </div>
            <div class="card-footer">
                ${actionBtn}
            </div>
        </div>`;
    })
    .join("");
}

function updateCounts() {
  // Update the little number badges on the tabs
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

// --- 5. EXPORTED FUNCTIONS (Attached to Window) ---

window.updateOrderStatus = async function (orderId, newStatus) {
  if (!currentVendorId) return;

  // Optimistic UI update (optional, but makes it feel faster)
  // We rely on onSnapshot to actually update the UI, but we can show a loading state if needed.

  try {
    const orderRef = doc(db, "vendors", currentVendorId, "orders", orderId);
    await updateDoc(orderRef, {
      status: newStatus,
      lastUpdated: Date.now(),
    });
    // No need to alert success, the UI will just move the card automatically
  } catch (e) {
    console.error("Error updating status:", e);
    alert("Failed to update status.");
  }
};

window.switchTab = function (tabName) {
  currentTab = tabName;

  // Update Tab Visuals
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("active");
    // Simple check if button text contains the tab name or logic to match your specific HTML structure
    if (
      btn.getAttribute("onclick") &&
      btn.getAttribute("onclick").includes(tabName)
    ) {
      btn.classList.add("active");
    }
  });

  renderOrders();
};

window.manualRefresh = function () {
  const icon = document.getElementById("refresh-icon");
  if (icon) {
    icon.classList.add("fa-spin");
    setTimeout(() => icon.classList.remove("fa-spin"), 500);
  }
};
