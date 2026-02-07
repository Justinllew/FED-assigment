import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getFirestore,
  collectionGroup,
  query,
  where,
  onSnapshot,
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

// UI Config for Status Badges
const statusConfig = {
  PENDING: { label: "Order Placed", color: "#856404", bg: "#fff3cd" },
  ACCEPTED: { label: "Accepted", color: "#004085", bg: "#cce5ff" },
  COOKING: { label: "Cooking", color: "#004085", bg: "#cce5ff" },
  ON_WAY: { label: "On the Way", color: "#0c5460", bg: "#d1ecf1" },
  COMPLETED: { label: "Delivered", color: "#155724", bg: "#d4edda" },
  CANCELLED: { label: "Cancelled", color: "#721c24", bg: "#f8d7da" },
};

// --- 2. AUTH LISTENER ---
document.addEventListener("DOMContentLoaded", () => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("👤 Customer Logged In:", user.uid);
      initOrderListener(user.uid);
    } else {
      const activeList = document.getElementById("active-list");
      if (activeList)
        activeList.innerHTML =
          "<p class='empty-msg'>Please log in to view orders.</p>";
      // For testing without login, you can comment the above and force an ID:
      // initOrderListener("TEST_CUSTOMER_ID");
    }
  });
});

// --- 3. FIRESTORE LISTENER (collectionGroup) ---
function initOrderListener(userId) {
  const activeContainer = document.getElementById("active-list");
  const historyContainer = document.getElementById("history-list");

  if (activeContainer) activeContainer.innerHTML = "<p>Loading orders...</p>";

  // "collectionGroup" searches ALL collections named "orders" in the entire database
  // This is how we find the customer's orders across different vendors
  const q = query(
    collectionGroup(db, "orders"),
    where("customerId", "==", userId),
  );

  onSnapshot(
    q,
    (snapshot) => {
      if (activeContainer) activeContainer.innerHTML = "";
      if (historyContainer) historyContainer.innerHTML = "";

      if (snapshot.empty) {
        if (activeContainer)
          activeContainer.innerHTML =
            "<p class='empty-msg'>No active orders found.</p>";
        return;
      }

      const orders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort by timestamp (Newest first)
      orders.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

      orders.forEach((order) => {
        renderOrderCard(order, activeContainer, historyContainer);
      });
    },
    (error) => {
      console.error("Error fetching orders:", error);
      if (error.code === "failed-precondition") {
        console.warn(
          "You might need to create a Firestore Index for this query. Check the console link.",
        );
      }
    },
  );
}

// --- 4. RENDER UI ---
function renderOrderCard(order, activeContainer, historyContainer) {
  // Safe Fallbacks
  const status = order.status || "PENDING";
  const storeName = order.stallName || "Unknown Stall";
  const totalPrice = order.total
    ? `$${parseFloat(order.total).toFixed(2)}`
    : "-";
  const itemCount = order.items ? order.items.length : 0;

  // Date Formatting
  const dateObj = order.timestamp ? new Date(order.timestamp) : new Date();
  const dateString =
    dateObj.toLocaleDateString() +
    " " +
    dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // Get Config
  const config = statusConfig[status] || {
    label: status,
    color: "#333",
    bg: "#eee",
  };

  // Logic: Is this an Active order or History?
  const isHistory = status === "COMPLETED" || status === "CANCELLED";

  // Stepper Active States
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
            <div class="order-meta">Order #${(order.orderId || order.id).slice(-6)} • ${dateString}</div>
            <div class="order-meta">${itemCount} Items • Total: ${totalPrice}</div>
          </div>
          <div class="status-badge-container">
            <span class="status-badge" style="background-color: ${config.bg}; color: ${config.color}; padding: 5px 10px; border-radius: 15px; font-weight: 600; font-size: 0.8rem;">
              ${config.label}
            </span>
          </div>
        </div>
        
        ${
          !isHistory
            ? `
        <div class="stepper" style="margin-top: 20px; display: flex; justify-content: space-between; position: relative;">
           <div class="step ${step1Active}" style="text-align:center; opacity: ${step1Active ? 1 : 0.4}">
             <div class="step-circle"><i class="fas fa-file-invoice"></i></div>
             <div style="font-size:0.7rem;">Placed</div>
           </div>
           <div class="step ${step2Active}" style="text-align:center; opacity: ${step2Active ? 1 : 0.4}">
             <div class="step-circle"><i class="fas fa-utensils"></i></div>
             <div style="font-size:0.7rem;">Cooking</div>
           </div>
           <div class="step ${step3Active}" style="text-align:center; opacity: ${step3Active ? 1 : 0.4}">
             <div class="step-circle"><i class="fas fa-motorcycle"></i></div>
             <div style="font-size:0.7rem;">On Way</div>
           </div>
        </div>
        `
            : ""
        }
        
        <div style="text-align: right; margin-top: 15px;">
           <button class="btn-action" onclick="window.location.href='../Order Tracking/OrderTracking.html?id=${order.id}'" style="background:none; border:none; color: #68a357; cursor: pointer; font-weight:600;">
             Track / View Details <i class="fas fa-chevron-right"></i>
           </button>
        </div>
      </div>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
    `;

  if (isHistory) {
    if (historyContainer)
      historyContainer.insertAdjacentHTML("beforeend", cardHTML);
  } else {
    if (activeContainer)
      activeContainer.insertAdjacentHTML("beforeend", cardHTML);
  }
}

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
