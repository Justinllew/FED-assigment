// ======================================================
// 1. FIREBASE SETUP
// ======================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  update,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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
const ORDER_ID = "ORD-8829";
const orderRef = ref(db, "orders/" + ORDER_ID);

// ======================================================
// 2. CONFIGURATION
// ======================================================

// CHANGED: Removed 'sub' property. Only one label now.
const steps = [
  { id: "confirmed", label: "Order Placed", icon: "fa-file-invoice" },
  { id: "cooking", label: "Cooking", icon: "fa-utensils" },
  { id: "onway", label: "On the Way", icon: "fa-motorcycle" },
  { id: "delivered", label: "Delivered", icon: "fa-smile" },
];

const contentData = {
  confirmed: {
    title: "Order Received",
    desc: "The restaurant has received your order and is preparing to accept it.",
    visual: "fa-clipboard-check",
    isDelivered: false,
  },
  cooking: {
    title: "In the Kitchen",
    desc: "Chef Lim is currently preparing your Chicken Rice. It smells great!",
    visual: "fa-fire",
    isDelivered: false,
  },
  onway: {
    title: "On the Move",
    desc: "Your rider (Ahmad) has picked up the order and is 5 mins away.",
    visual: "fa-motorcycle",
    isDelivered: false,
  },
  delivered: {
    title: "Order Completed",
    desc: "Delivered to your doorstep.",
    visual: "fa-box-open",
    isDelivered: true,
  },
};

// ======================================================
// 3. LISTEN FOR REAL-TIME UPDATES
// ======================================================
onValue(orderRef, (snapshot) => {
  const data = snapshot.val();

  if (data) {
    const timeString = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    // 1. Update Header
    const activeStepObj = steps.find((s) => s.id === data.status);
    const labelText = activeStepObj ? activeStepObj.label : data.status;
    document.getElementById("status-pill").innerText = labelText;
    document.getElementById("last-updated").innerText = "Updated " + timeString;

    // 2. Render Steps
    renderSteps(data.status);

    // 3. Render Detail View
    updateDetailView(data.status, timeString);
  } else {
    update(orderRef, { status: "confirmed", timestamp: Date.now() });
  }
});

// ======================================================
// 4. RENDERING FUNCTIONS
// ======================================================

function renderSteps(activeId) {
  const container = document.getElementById("steps-container");
  const fillLine = document.querySelector(".progress-line-fill");

  const activeIndex = steps.findIndex((s) => s.id === activeId);

  if (fillLine && activeIndex !== -1) {
    const percent = (activeIndex / (steps.length - 1)) * 100;
    fillLine.style.width = `${percent}%`;
  }

  // CHANGED: Generating HTML without the subtitle div
  container.innerHTML = steps
    .map((step, index) => {
      let className = "step-card";
      if (index < activeIndex) className += " completed";
      if (index === activeIndex) className += " active";

      return `
            <div class="${className}" onclick="window.handleStepClick('${step.id}')">
                <div class="step-icon"><i class="fas ${step.icon}"></i></div>
                <div class="step-title">${step.label}</div>
            </div>
        `;
    })
    .join("");
}

function updateDetailView(id, time) {
  const data = contentData[id];
  const container = document.getElementById("detail-view");
  if (!data) return;

  // Render logic remains similar, just cleaner
  if (data.isDelivered) {
    container.innerHTML = `
            <div class="status-banner">
                <i class="fas fa-check-circle" style="font-size:2rem; margin-bottom:10px;"></i>
                <h2>Delivered!</h2>
                <p>Enjoy your food</p>
            </div>
            <div class="delivered-body">
                <i class="fas ${data.visual} big-icon" style="font-size:4rem; color:#68a357; margin-bottom:20px;"></i>
                <p style="color:#666; font-size:1.1rem;">This order was completed at <strong>${time}</strong>.</p>
                <button class="btn-primary" style="margin-top:20px;">Leave a Review</button>
            </div>
        `;
  } else {
    container.innerHTML = `
            <div class="detail-content-wrapper detail-body-grid">
                <div class="detail-content">
                    <h2 style="margin-top:0;">${data.title}</h2>
                    <p style="color:#666; line-height:1.6; margin-bottom:20px; font-size:1.05rem;">${data.desc}</p>
                    
                    <div style="display:inline-flex; align-items:center; background:#f5f5f5; padding:8px 16px; border-radius:8px;">
                        <i class="fas fa-clock" style="margin-right:8px; color:#666;"></i>
                        <span style="color:#444; font-weight:500;">Last Update: ${time}</span>
                    </div>
                </div>
                <div class="detail-visual">
                    <i class="fas ${data.visual} moving-icon"></i>
                </div>
            </div>
        `;
  }
}

// ======================================================
// 5. EVENT HANDLERS
// ======================================================

// Receipt Modal Logic
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("receipt-modal");
  const btn = document.getElementById("btn-receipt");
  const close = document.getElementById("close-modal");

  if (btn && modal) {
    btn.onclick = () => {
      modal.classList.remove("hidden");
    };
  }

  if (close && modal) {
    close.onclick = () => {
      modal.classList.add("hidden");
    };
  }

  // Close on clicking outside
  window.onclick = (event) => {
    if (event.target === modal) {
      modal.classList.add("hidden");
    }
  };
});

// Demo Controller
window.handleStepClick = function (newStatus) {
  update(orderRef, {
    status: newStatus,
    updatedAt: Date.now(),
  }).catch((err) => console.error(err));
};

// ======================================================
// 6. RECEIPT MODAL LOGIC
// ======================================================

// Function to open the modal
function openReceipt() {
  const modal = document.getElementById("receipt-modal");
  if (modal) {
    modal.classList.remove("hidden"); // Shows the modal
  }
}

// Function to close the modal
window.closeReceipt = function () {
  // Exposed to window for HTML onclick
  const modal = document.getElementById("receipt-modal");
  if (modal) {
    modal.classList.add("hidden"); // Hides the modal
  }
};

// Event Listeners (Wait for page to load)
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("btn-receipt");
  const closeBtn = document.getElementById("close-modal");
  const modal = document.getElementById("receipt-modal");

  // 1. Click "View Receipt" Button
  if (btn) {
    btn.addEventListener("click", openReceipt);
  }

  // 2. Click "X" Button
  if (closeBtn) {
    closeBtn.addEventListener("click", window.closeReceipt);
  }

  // 3. Click Outside the modal (Background) to close
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      window.closeReceipt();
    }
  });
});
