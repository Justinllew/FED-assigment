import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// --- FIREBASE CONFIG ---
const firebaseConfig = {
  apiKey: "AIzaSyA8zDkXrfnzEE6OpvEAATqNliz9FBYxOPo",
  authDomain: "hawkerbase-fedasg.firebaseapp.com",
  databaseURL:
    "https://hawkerbase-fedasg-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "hawkerbase-fedasg",
  storageBucket: "hawkerbase-fedasg.firebasestorage.app",
  messagingSenderId: "216203478131",
  appId: "1:216203478131:web:cb0ff58ba3f51911de9606",
  measurementId: "G-T2CVBCSMV4",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// --- STATUS CONFIGURATION ---
const statusConfig = {
  confirmed: { label: "Order Placed", color: "#f0ad4e", bg: "#fcf8e3" },
  cooking: { label: "Cooking", color: "#0275d8", bg: "#d9edf7" },
  onway: { label: "On the Way", color: "#5bc0de", bg: "#d9edf7" },
  delivered: { label: "Delivered", color: "#5cb85c", bg: "#dff0d8" },
  cancelled: { label: "Cancelled", color: "#d9534f", bg: "#f2dede" },
};

// --- FETCH & RENDER ORDERS ---
const ordersRef = ref(db, "orders/");

onValue(ordersRef, (snapshot) => {
  const data = snapshot.val();
  const activeContainer = document.getElementById("active-list");
  const historyContainer = document.getElementById("history-list");

  // Clear current content
  activeContainer.innerHTML = "";
  historyContainer.innerHTML = "";

  if (!data) {
    activeContainer.innerHTML = "<p class='empty-msg'>No active orders.</p>";
    historyContainer.innerHTML = "<p class='empty-msg'>No order history.</p>";
    return;
  }

  // Loop through all orders
  Object.keys(data).forEach((orderId) => {
    const order = data[orderId];

    // Fallback values if data is missing in DB
    const status = order.status || "confirmed";
    const storeName = order.storeName || order.vendor || "Store Name";
    const totalPrice = order.total
      ? `$${parseFloat(order.total).toFixed(2)}`
      : "-";
    const itemCount = order.items ? order.items.length : 0;
    const timestamp = order.updatedAt || Date.now();

    // Format Date
    const dateObj = new Date(timestamp);
    const dateString =
      dateObj.toLocaleDateString() +
      " " +
      dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // HTML for the Card
    const cardHTML = `
      <div class="track-card">
        <div class="track-header">
          <div>
            <div class="store-name">${storeName}</div>
            <div class="order-meta">Order #${orderId} • ${dateString}</div>
            <div class="order-meta">${itemCount} Items • Total: ${totalPrice}</div>
          </div>
          <div class="status-badge-container">
            <span class="status-badge" style="
              background-color: ${statusConfig[status]?.bg || "#eee"}; 
              color: ${statusConfig[status]?.color || "#333"};">
              ${statusConfig[status]?.label || status}
            </span>
          </div>
        </div>
        
        ${
          status !== "delivered" && status !== "cancelled"
            ? `
        <div class="stepper" style="margin-top: 20px; zoom: 0.8;">
           <div class="step ${["confirmed", "cooking", "onway", "delivered"].indexOf(status) >= 0 ? "active" : ""}">
             <div class="step-circle"><i class="fas fa-file-invoice"></i></div>
           </div>
           <div class="step ${["cooking", "onway", "delivered"].indexOf(status) >= 0 ? "active" : ""}">
             <div class="step-circle"><i class="fas fa-utensils"></i></div>
           </div>
           <div class="step ${["onway", "delivered"].indexOf(status) >= 0 ? "active" : ""}">
             <div class="step-circle"><i class="fas fa-motorcycle"></i></div>
           </div>
        </div>
        `
            : ""
        }
        
        <div style="text-align: right; margin-top: 15px;">
           <button class="btn-action" onclick="alert('View details for ${orderId}')">
             View Details <i class="fas fa-chevron-right"></i>
           </button>
        </div>
      </div>
    `;

    // Sort into Active or History
    if (status === "delivered" || status === "cancelled") {
      historyContainer.innerHTML += cardHTML;
    } else {
      activeContainer.innerHTML += cardHTML;
    }
  });

  // Handle empty states if no orders match category
  if (activeContainer.innerHTML === "")
    activeContainer.innerHTML = "<p class='empty-msg'>No active orders.</p>";
  if (historyContainer.innerHTML === "")
    historyContainer.innerHTML = "<p class='empty-msg'>No past orders.</p>";
});
