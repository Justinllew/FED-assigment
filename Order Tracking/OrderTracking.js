import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// --- 1. FIREBASE CONFIGURATION ---
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

// The Vendor ID whose orders we are tracking
const VENDOR_ID = "vjzBxXgKGNgS8JzUUckSApQimXt2";

// --- 2. UI CONFIGURATION (Steps & Statuses) ---
const stepsDefinition = [
  {
    id: "created",
    title: "Order Placed",
    subtitle: "Waiting for Vendor",
    // These strings must match what you save in the database
    statusMatch: ["PENDING"],
    icon: '<i class="fas fa-file-invoice"></i>',
    getDetails: (order) => ({
      title: "Order Received",
      subtitle: `Order #${order.orderId || order.id}`,
      visual: `<div style="text-align:center; color:#68a357;"><i class="fas fa-check-circle" style="font-size:5rem; margin-bottom:20px;"></i><h3>Order Sent!</h3></div>`,
      content: `
        <div style="background:#f9f9f9; padding:20px; border-radius:8px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                <span style="color:#666;">Total Items</span>
                <span style="font-weight:600;">${order.items ? order.items.length : 0} Items</span>
            </div>
            <div style="display:flex; justify-content:space-between;">
                <span style="color:#666;">Total Cost</span>
                <span style="font-weight:600;">$${order.total ? Number(order.total).toFixed(2) : "0.00"}</span>
            </div>
        </div>
        <div style="margin-top:20px; font-size:0.9rem; color:#666;">
            Waiting for the vendor to accept your order.
        </div>`,
    }),
  },
  {
    id: "cooking",
    title: "Preparing",
    subtitle: "Kitchen is working",
    statusMatch: ["ACCEPTED", "COOKING"],
    icon: '<i class="fas fa-utensils"></i>',
    getDetails: (order) => ({
      title: "Kitchen is Cooking",
      subtitle: "Preparing your meal",
      visual: `<div style="text-align:center; color:#f59e0b;"><i class="fas fa-fire-alt" style="font-size:5rem; margin-bottom:20px; animation: pulse 2s infinite;"></i><h3>Cooking Now</h3></div>`,
      content: `
        <div style="background:#ecfdf5; padding:15px; border-radius:8px; margin-bottom:20px; display:flex; gap:15px; align-items:center;">
            <i class="fas fa-fire" style="color:#166534; font-size:1.5rem;"></i>
            <div>
                <strong style="color:#166534;">Chef is working!</strong>
                <div style="font-size:0.8rem; color:#166534;">Estimated prep time: ~15 mins</div>
            </div>
        </div>
        <div style="border:1px solid #eee; padding:15px; border-radius:8px;">
            <strong>Items being prepared:</strong>
            <ul style="margin-top:5px; padding-left:20px; font-size:0.9rem; color:#555;">
               ${order.items ? order.items.map((i) => `<li>${i.qty || 1}x ${i.name || i}</li>`).join("") : "<li>Loading items...</li>"}
            </ul>
        </div>`,
    }),
  },
  {
    id: "shipped",
    title: "On the Way",
    subtitle: "Rider picked up",
    statusMatch: ["READY", "ON_WAY", "SHIPPED"],
    icon: '<i class="fas fa-motorcycle"></i>',
    getDetails: (order) => ({
      title: "Rider En Route",
      subtitle: "Heading to you",
      visual: `<div style="text-align:center; color:#3b82f6;"><i class="fas fa-motorcycle" style="font-size:5rem; margin-bottom:20px;"></i><h3>On the Move</h3></div>`,
      content: `
        <div style="border:1px solid #eee; padding:15px; border-radius:8px; margin-bottom:20px;">
            <div style="display:flex; justify-content:space-between;">
                <span><strong>Status:</strong> Picked Up</span>
                <span style="color:#68a357; font-family:monospace;">TRACKING-ACTIVE</span>
            </div>
            <div style="width:100%; background:#eee; height:6px; border-radius:3px; margin-top:10px;">
                <div style="width:70%; background:#68a357; height:6px; border-radius:3px;"></div>
            </div>
        </div>
        <p style="color:#666; font-size:0.9rem;">The rider has picked up your food and is heading to your delivery address.</p>`,
    }),
  },
  {
    id: "completed",
    title: "Delivered",
    subtitle: "Enjoy your food!",
    statusMatch: ["COMPLETED"],
    icon: '<i class="fas fa-smile-beam"></i>',
    getDetails: (order) => ({
      title: "Order Delivered",
      subtitle: "Completed successfully",
      visual: `<div style="text-align:center; color:#68a357;"><i class="fas fa-box-open" style="font-size:5rem; margin-bottom:20px;"></i><h3>Enjoy!</h3></div>`,
      content: `<p style="text-align:center; padding:30px; color:#666;">This order has been marked as delivered. Enjoy your meal!</p>`,
    }),
  },
];

let currentOrderData = null;

// --- 3. INIT ---
document.addEventListener("DOMContentLoaded", () => {
  listenToLatestOrder();
});

// --- 4. REAL-TIME LISTENER ---
function listenToLatestOrder() {
  const ordersRef = collection(db, "vendors", VENDOR_ID, "orders");

  // Get the most recent order (Sort by timestamp Descending, Limit to 1)
  const q = query(ordersRef, orderBy("timestamp", "desc"), limit(1));

  // 'onSnapshot' runs every time the database changes
  onSnapshot(
    q,
    (snapshot) => {
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        currentOrderData = { id: doc.id, ...doc.data() };
        console.log("Live Update Received:", currentOrderData);
        updateUI(currentOrderData);
      } else {
        console.log("No orders found.");
        document.querySelector(".content-area").innerHTML =
          "<h2 style='text-align:center'>No Active Orders</h2>";
      }
    },
    (error) => {
      console.error("Error listening to tracking:", error);
    },
  );
}

// --- 5. UI UPDATES ---
function updateUI(order) {
  // Update Header
  const orderIdEl = document.getElementById("order-id-display");
  const statusPillEl = document.getElementById("status-pill");
  const lastUpdatedEl = document.getElementById("last-updated");

  // Handle ID display (use orderId field if exists, else doc ID)
  if (orderIdEl) orderIdEl.innerText = `Order #${order.orderId || order.id}`;

  if (statusPillEl) {
    statusPillEl.innerText = order.status
      ? order.status.replace("_", " ")
      : "UNKNOWN";
    // Change pill color based on status
    if (order.status === "COMPLETED") {
      statusPillEl.style.backgroundColor = "#d1fae5";
      statusPillEl.style.color = "#065f46";
    } else if (order.status === "PENDING") {
      statusPillEl.style.backgroundColor = "#fff7ed";
      statusPillEl.style.color = "#9a3412";
    }
  }

  if (lastUpdatedEl) {
    const time = order.timestamp
      ? new Date(order.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "--:--";
    lastUpdatedEl.innerText = `Updated at ${time}`;
  }

  // Calculate active step
  let activeIndex = 0;
  // Loop through steps to find which one matches current status
  stepsDefinition.forEach((step, index) => {
    if (order.status && step.statusMatch.includes(order.status)) {
      activeIndex = index;
    }
  });

  // Special Case: If completed, ensure all steps look done
  if (order.status === "COMPLETED") activeIndex = 3;

  renderSteps(activeIndex, order);
  updateDetailView(stepsDefinition[activeIndex], order);
}

function renderSteps(activeIndex, order) {
  const container = document.getElementById("steps-container");
  if (!container) return;

  container.innerHTML = "";

  stepsDefinition.forEach((step, index) => {
    const isActive = index === activeIndex;
    // A step is "completed" if it's before the active one
    const isCompleted = index < activeIndex;

    const div = document.createElement("div");
    div.className = `step-card ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`;

    const iconColor = isActive
      ? "text-white"
      : isCompleted
        ? "text-green-600"
        : "text-gray-400";

    div.innerHTML = `
        <div class="step-icon ${iconColor}">${step.icon}</div>
        <div class="step-title">${step.title}</div>
        <div class="step-subtitle">${step.subtitle}</div>
    `;

    // Allow clicking past steps to see details
    div.onclick = () => {
      document
        .querySelectorAll(".step-card")
        .forEach((c) => c.classList.remove("active"));
      div.classList.add("active");
      updateDetailView(step, order);
    };

    container.appendChild(div);
  });

  // Animate Progress Line
  const fillLine = document.querySelector(".progress-line-fill");
  if (fillLine) {
    // 0 = 12%, 1 = 38%, 2 = 63%, 3 = 88% (Approximate percentages for visual alignment)
    const percentages = ["12%", "38%", "63%", "88%"];
    fillLine.style.width = percentages[activeIndex] || "0%";
  }
}

function updateDetailView(stepData, order) {
  const container = document.getElementById("detail-view");
  if (!container) return;

  container.style.opacity = "0.6";
  setTimeout(() => {
    const details = stepData.getDetails(order);
    container.innerHTML = `
        <div class="detail-body-grid">
            <div class="detail-content">
                <h2 style="margin-top:0">${details.title}</h2>
                <p style="color:#666; margin-bottom:20px;">${details.subtitle}</p>
                ${details.content}
            </div>
            <div class="detail-visual">
                ${details.visual}
            </div>
        </div>
    `;
    container.style.opacity = "1";
  }, 150);
}

// --- 6. GLOBAL FUNCTIONS (For HTML Buttons) ---
window.toggleSidebar = () => {
  // Simple sidebar toggle if you haven't implemented it in CSS yet
  const sidebar = document.querySelector(".sidebar");
  if (sidebar)
    sidebar.style.display = sidebar.style.display === "none" ? "flex" : "none";
};

window.viewReceipt = function () {
  if (!currentOrderData) return;
  const modal = document.getElementById("receipt-modal");

  // Populate Modal Data
  const itemsContainer = modal.querySelector(".receipt-items");
  const totalEl = modal.querySelector(".receipt-total span:last-child");
  const orderIdEl = modal.querySelector(".receipt-footer p:first-child");

  if (itemsContainer) {
    itemsContainer.innerHTML = currentOrderData.items
      ? currentOrderData.items
          .map(
            (i) => `
            <div class="item-row">
              <span>${i.qty || 1}x ${i.name || i}</span>
              <span>$${i.price || "-"}</span>
            </div>`,
          )
          .join("")
      : "No items found";
  }

  if (totalEl)
    totalEl.innerText = `$${currentOrderData.total ? Number(currentOrderData.total).toFixed(2) : "0.00"}`;
  if (orderIdEl)
    orderIdEl.innerText = `Order #${currentOrderData.orderId || currentOrderData.id}`;

  // Show Modal
  modal.classList.remove("hidden");
};

// --- MOBILE SIDEBAR TOGGLE ---
window.toggleSidebar = function () {
  const sidebar = document.querySelector(".sidebar");
  // This adds/removes the 'open' class defined in the CSS media query
  sidebar.classList.toggle("open");

  // Optional: Click outside to close (Simple version)
  const content = document.querySelector(".main-content-wrapper");
  if (sidebar.classList.contains("open")) {
    content.addEventListener("click", closeSidebarOnClick);
  }
};

function closeSidebarOnClick() {
  const sidebar = document.querySelector(".sidebar");
  const content = document.querySelector(".main-content-wrapper");
  sidebar.classList.remove("open");
  content.removeEventListener("click", closeSidebarOnClick);
}
