// ==========================================
// 1. CONFIGURATION & MOCK DATA
// ==========================================
const API_URL =
  "https://hawkerbase-fedasg-default-rtdb.asia-southeast1.firebasedatabase.app";

// Fallback data in case DB is empty or fails
const MOCK_ORDER = {
  id: "ORD-8829",
  status: "ON_WAY",
  timestamp: new Date().toISOString(),
  total: 18.5,
  items: [
    { name: "Roasted Chicken Rice", qty: 2, price: 5.5 },
    { name: "Braised Egg", qty: 2, price: 1.0 },
    { name: "Ice Lemon Tea", qty: 2, price: 2.75 },
  ],
};

// ==========================================
// 2. STEP DEFINITIONS
// ==========================================
const stepsDefinition = [
  {
    id: "created",
    title: "Order Placed",
    subtitle: "Order Received",
    statusMatch: ["PENDING"],
    icon: '<i class="fas fa-file-invoice"></i>',
    getDetails: (order) => ({
      title: "Order Received",
      subtitle: `Order #${order.id}`,
      visual: `<div style="text-align:center; color:#68a357;"><i class="fas fa-check-circle" style="font-size:5rem; margin-bottom:20px;"></i><h3>We have your order!</h3></div>`,
      content: `
        <div style="background:#f9f9f9; padding:20px; border-radius:8px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                <span style="color:#666;">Total Items</span>
                <span style="font-weight:600;">${order.items ? order.items.length : 0} Items</span>
            </div>
            <div style="display:flex; justify-content:space-between;">
                <span style="color:#666;">Total Cost</span>
                <span style="font-weight:600;">$${order.total ? order.total.toFixed(2) : "0.00"}</span>
            </div>
        </div>
        <div style="margin-top:20px; font-size:0.9rem; color:#666;">
            Your order has been sent to the vendor. Waiting for acceptance.
        </div>`,
    }),
  },
  {
    id: "cooking",
    title: "Cooking",
    subtitle: "Preparing Food",
    statusMatch: ["COOKING", "ACCEPTED"],
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
               ${order.items ? order.items.map((i) => `<li>${i.qty}x ${i.name || "Item"}</li>`).join("") : "<li>Loading items...</li>"}
            </ul>
        </div>`,
    }),
  },
  {
    id: "shipped",
    title: "On the Way",
    subtitle: "Courier Picked Up",
    statusMatch: ["ON_WAY", "SHIPPED"],
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

// ==========================================
// 3. MAIN LOGIC
// ==========================================

let currentOrderData = null; // Store for interactivity

document.addEventListener("DOMContentLoaded", () => {
  fetchTrackingInfo();
});

async function fetchTrackingInfo() {
  try {
    const res = await fetch(`${API_URL}/orders.json`);
    const data = await res.json();

    // If API works, use it. If not, use MOCK.
    if (data) {
      const allOrders = Object.keys(data).map((key) => ({
        id: key,
        ...data[key],
      }));
      // Sort newest first
      allOrders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      currentOrderData = allOrders[0];
    } else {
      console.warn("No data in DB, using Mock Data");
      currentOrderData = MOCK_ORDER;
    }

    updateUI(currentOrderData);
  } catch (error) {
    console.error("Error fetching data, using Mock:", error);
    currentOrderData = MOCK_ORDER;
    updateUI(currentOrderData);
  }
}

function updateUI(order) {
  // Update Header
  document.getElementById("order-id-display").innerText = `Order #${order.id}`;
  document.getElementById("status-pill").innerText = order.status.replace(
    "_",
    " ",
  );

  const time = new Date(order.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  document.getElementById("last-updated").innerText = `Updated at ${time}`;

  // Find Active Step Index
  let activeIndex = 0;
  stepsDefinition.forEach((step, index) => {
    if (step.statusMatch.includes(order.status)) {
      activeIndex = index;
    }
  });

  renderSteps(activeIndex, order);

  // Show details for the active step immediately
  updateDetailView(stepsDefinition[activeIndex], order);
}

function renderSteps(activeIndex, order) {
  const container = document.getElementById("steps-container");
  container.innerHTML = "";

  stepsDefinition.forEach((step, index) => {
    const isActive = index === activeIndex;
    const isCompleted = index < activeIndex;

    const div = document.createElement("div");
    div.className = `step-card ${isActive ? "active" : ""}`;

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

    // CLICK INTERACTIVITY
    div.onclick = () => {
      // 1. Update Visuals
      document
        .querySelectorAll(".step-card")
        .forEach((c) => c.classList.remove("active"));
      div.classList.add("active");

      // 2. Update Details Box
      updateDetailView(step, order);
    };

    container.appendChild(div);
  });
}

function updateDetailView(stepData, order) {
  const container = document.getElementById("detail-view");
  // Quick fade animation
  container.style.opacity = "0.6";

  setTimeout(() => {
    const details = stepData.getDetails(order);

    document.getElementById("detail-title").innerText = details.title;
    document.getElementById("detail-subtitle").innerText = details.subtitle;

    const dateObj = new Date(order.timestamp);
    document.getElementById("detail-timestamp").innerText = isNaN(dateObj)
      ? "--:--"
      : dateObj.toLocaleTimeString();

    document.getElementById("detail-content-left").innerHTML = details.content;
    document.getElementById("detail-visual-container").innerHTML =
      details.visual;

    container.style.opacity = "1";
  }, 150);
}

// ==========================================
// 4. BUTTON INTERACTIVITY
// ==========================================

window.viewReceipt = function () {
  if (!currentOrderData) return;

  const itemsList = currentOrderData.items
    .map((i) => `• ${i.qty}x ${i.name || "Item"} - $${i.price}`)
    .join("\n");

  alert(
    `🧾 RECEIPT for ${currentOrderData.id}\n\n${itemsList}\n\nTotal: $${currentOrderData.total.toFixed(2)}`,
  );
};

window.contactDriver = function () {
  const drivers = ["James Tan", "Ahmad Ali", "Peter Lim"];
  const randomDriver = drivers[Math.floor(Math.random() * drivers.length)];
  alert(
    `📞 Calling Driver: ${randomDriver}...\n\n(Connecting to virtual phone system)`,
  );
};
