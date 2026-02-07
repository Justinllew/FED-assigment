// ==========================================
// 1. IMPORTS
// ==========================================
import { db, auth } from "../firebase.js";
import {
  collectionGroup,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

// ==========================================
// 2. CONFIGURATION & STATE
// ==========================================
const statusConfig = {
  PENDING: { label: "Order Placed", color: "#f0ad4e", bg: "#fcf8e3" }, // Mapped 'confirmed' to PENDING
  ACCEPTED: { label: "Accepted", color: "#0275d8", bg: "#d9edf7" },
  COOKING: { label: "Cooking", color: "#0275d8", bg: "#d9edf7" },
  ON_WAY: { label: "On the Way", color: "#5bc0de", bg: "#d9edf7" }, // Mapped 'onway' to ON_WAY
  COMPLETED: { label: "Delivered", color: "#5cb85c", bg: "#dff0d8" }, // Mapped 'delivered' to COMPLETED
  CANCELLED: { label: "Cancelled", color: "#d9534f", bg: "#f2dede" },
};

document.addEventListener("DOMContentLoaded", () => {
  // Wait for Login
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("👤 Customer Logged In:", user.uid);
      initOrderListener(user.uid);
    } else {
      document.getElementById("active-list").innerHTML =
        "<p class='empty-msg'>Please log in to view orders.</p>";
    }
  });
});

// ==========================================
// 3. FIRESTORE LISTENER
// ==========================================
function initOrderListener(userId) {
  const activeContainer = document.getElementById("active-list");
  const historyContainer = document.getElementById("history-list");

  if (activeContainer) activeContainer.innerHTML = "<p>Loading...</p>";

  // Query: Find documents in ANY collection named 'orders' where customerId matches
  const q = query(
    collectionGroup(db, "orders"),
    where("customerId", "==", userId),
    // Note: orderBy requires an index. If you get an error, check console for the link to create it.
  );

  // Real-time listener
  onSnapshot(q, (snapshot) => {
    activeContainer.innerHTML = "";
    historyContainer.innerHTML = "";

    if (snapshot.empty) {
      activeContainer.innerHTML = "<p class='empty-msg'>No active orders.</p>";
      historyContainer.innerHTML = "<p class='empty-msg'>No order history.</p>";
      return;
    }

    const orders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // Sort in JS to avoid index issues for now (Newest first)
    orders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    orders.forEach((order) => {
      renderOrderCard(order, activeContainer, historyContainer);
    });

    // Handle empty states after filtering
    if (activeContainer.innerHTML === "")
      activeContainer.innerHTML = "<p class='empty-msg'>No active orders.</p>";
    if (historyContainer.innerHTML === "")
      historyContainer.innerHTML = "<p class='empty-msg'>No past orders.</p>";
  });
}

// ==========================================
// 4. RENDER UI (Your Original Logic)
// ==========================================
function renderOrderCard(order, activeContainer, historyContainer) {
  // Fallback values
  const status = order.status || "PENDING";
  const storeName = order.stallName || "Unknown Stall"; // Changed from order.vendor to match your other files
  const totalPrice = order.total
    ? `$${parseFloat(order.total).toFixed(2)}`
    : "-";
  const itemCount = order.items ? order.items.length : 0;

  // Date Formatting
  const timestamp = order.timestamp || Date.now();
  const dateObj = new Date(timestamp);
  const dateString =
    dateObj.toLocaleDateString() +
    " " +
    dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // Config Lookup
  const config = statusConfig[status] || {
    label: status,
    color: "#333",
    bg: "#eee",
  };

  // Stepper Logic
  const isHistory = status === "COMPLETED" || status === "CANCELLED";

  // Mapping your statuses to the stepper steps
  const step1Active = [
    "PENDING",
    "ACCEPTED",
    "COOKING",
    "ON_WAY",
    "COMPLETED",
  ].includes(status)
    ? "active"
    : "";
  const step2Active = ["COOKING", "ON_WAY", "COMPLETED"].includes(status)
    ? "active"
    : "";
  const step3Active = ["ON_WAY", "COMPLETED"].includes(status) ? "active" : "";

  const cardHTML = `
      <div class="track-card">
        <div class="track-header">
          <div>
            <div class="store-name">${storeName}</div>
            <div class="order-meta">Order #${order.id.slice(-6)} • ${dateString}</div>
            <div class="order-meta">${itemCount} Items • Total: ${totalPrice}</div>
          </div>
          <div class="status-badge-container">
            <span class="status-badge" style="background-color: ${config.bg}; color: ${config.color};">
              ${config.label}
            </span>
          </div>
        </div>
        
        ${
          !isHistory
            ? `
        <div class="stepper" style="margin-top: 20px; zoom: 0.8;">
           <div class="step ${step1Active}">
             <div class="step-circle"><i class="fas fa-file-invoice"></i></div>
           </div>
           <div class="step ${step2Active}">
             <div class="step-circle"><i class="fas fa-utensils"></i></div>
           </div>
           <div class="step ${step3Active}">
             <div class="step-circle"><i class="fas fa-motorcycle"></i></div>
           </div>
        </div>
        `
            : ""
        }
        
        <div style="text-align: right; margin-top: 15px;">
           <button class="btn-action" onclick="alert('Viewing Order: ${order.id}')">
             View Details <i class="fas fa-chevron-right"></i>
           </button>
        </div>
      </div>
    `;

  if (isHistory) {
    historyContainer.insertAdjacentHTML("beforeend", cardHTML);
  } else {
    activeContainer.insertAdjacentHTML("beforeend", cardHTML);
  }
}
