// ==========================================
// 1. IMPORTS & CONFIG
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA8zDkXrfnzEE6OpvEAATqNliz9FBYxOPo",
  authDomain: "hawkerbase-fedasg.firebaseapp.com",
  projectId: "hawkerbase-fedasg",
  storageBucket: "hawkerbase-fedasg.firebasestorage.app",
  messagingSenderId: "216203478131",
  appId: "1:216203478131:web:39072e8b25296b8ede9606",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ==========================================
// 🚨 CRITICAL VARIABLES (DO NOT DELETE)
// ==========================================
let currentUserUid = null;
let allOrdersCache = []; // <--- THIS IS THE MISSING LINE! IT MUST BE HERE.
let salesChartInstance = null;

// ==========================================
// 2. AUTHENTICATION & INITIALIZATION
// ==========================================
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUserUid = user.uid;
    console.log("Dashboard: Logged in as", currentUserUid);

    // Update Sidebar UI
    const userName = localStorage.getItem("freshEatsUserName") || "Vendor";
    const sidebarName = document.getElementById("sidebar-name");
    const sidebarAvatar = document.getElementById("sidebar-avatar");
    const headerName = document.querySelector("header div");

    if (sidebarName) sidebarName.textContent = userName;
    if (sidebarAvatar)
      sidebarAvatar.textContent = userName.charAt(0).toUpperCase();

    // LOAD REAL DATA
    fetchDashboardData();
  } else {
    window.location.href = "../../login-page-vp-jay/vendor-login.html";
  }
});

// ==========================================
// 3. CORE DASHBOARD LOGIC
// ==========================================

function fetchDashboardData() {
  if (!currentUserUid) return;

  const ordersRef = collection(db, "vendors", currentUserUid, "orders");

  // 📡 REAL-TIME LISTENER
  // This code runs immediately, AND runs again automatically whenever the DB changes.
  onSnapshot(
    ordersRef,
    (snapshot) => {
      const orders = [];
      snapshot.forEach((doc) => orders.push(doc.data()));

      // 1. Handle Empty State
      if (orders.length === 0) {
        console.log("No orders found.");
        allOrdersCache = [];
        updateList("feedback-list", ["No data available"]);
        updateList("realtime-list", []);
        // Clear charts
        calculateAndRender([]);
        return;
      }

      // 2. Update Cache
      allOrdersCache = orders;
      console.log("Real-time update: ", orders.length, " orders found.");

      // 3. Refresh the View
      // We check which button is currently active so we don't switch the user's view unexpectedly
      const isPreviousActive = document
        .getElementById("btn-previous")
        .classList.contains("active");
      if (isPreviousActive) {
        setView("previous");
      } else {
        setView("current");
      }
    },
    (error) => {
      console.error("Error fetching real-time data:", error);
    },
  );
}

function updateCharts(viewMode) {
  // Ensure cache exists before filtering
  if (!allOrdersCache) allOrdersCache = [];

  const now = new Date();
  let targetMonth = now.getMonth();
  let targetYear = now.getFullYear();

  if (viewMode === "previous") {
    targetMonth = targetMonth - 1;
    if (targetMonth < 0) {
      targetMonth = 11;
      targetYear = targetYear - 1;
    }
  }

  const filteredOrders = allOrdersCache.filter((order) => {
    if (!order.timestamp) return false;

    const orderDate = new Date(order.timestamp);
    return (
      orderDate.getMonth() === targetMonth &&
      orderDate.getFullYear() === targetYear
    );
  });

  console.log(
    `Showing ${viewMode} data: ${filteredOrders.length} orders found.`,
  );
  calculateAndRender(filteredOrders);
}

function calculateAndRender(orders) {
  // Empty State
  if (!orders || orders.length === 0) {
    updatePieChart(1, 0);
    updatePieChart(2, 0);
    updatePieChart(3, 0);
    updateList("feedback-list", ["No data for this month"]);
    updateList("realtime-list", []);
    return;
  }

  //1. Determine Month & Year from the first order
  const sampleDate =
    orders.length > 0 ? new Date(orders[0].timestamp) : new Date();
  const year = sampleDate.getFullYear();
  const month = sampleDate.getMonth(); // 0 = Jan, 1 = Feb...

  // 2. ✅ FIXED: Correct formula for days in month
  // (year, month + 1, 0) gets the last day of the CURRENT month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // 3. Create Buckets
  const labels = Array.from({ length: daysInMonth }, (_, i) => `Day ${i + 1}`);
  const dailyTotals = new Array(daysInMonth).fill(0);

  // 4. Fill Buckets (With Safety Checks)
  orders.forEach((order) => {
    const date = new Date(order.timestamp);
    const day = date.getDate(); // 1 to 31

    // ✅ SAFETY CHECK 1: Ensure 'total' is a valid number
    const orderTotal = parseFloat(order.total) || 0;

    // ✅ SAFETY CHECK 2: Ensure day fits in our array
    // (Arrays are 0-indexed, so Day 1 is Index 0)
    if (day > 0 && day <= daysInMonth) {
      dailyTotals[day - 1] += orderTotal;
    }
  });

  // 5. Draw Chart
  renderSalesChart(labels, dailyTotals);

  // 6. Calculate Big Numbers
  const totalRevenue = dailyTotals.reduce((a, b) => a + b, 0);
  const totalOrderCount = orders.length;
  const avgOrderValue =
    totalOrderCount > 0 ? totalRevenue / totalOrderCount : 0;

  // Update HTML
  const revEl = document.getElementById("stat-revenue");
  const ordEl = document.getElementById("stat-orders");
  const avgEl = document.getElementById("stat-avg");

  if (revEl) revEl.textContent = `$${totalRevenue.toFixed(2)}`;
  if (ordEl) ordEl.textContent = totalOrderCount;
  if (avgEl) avgEl.textContent = `$${avgOrderValue.toFixed(2)}`;

  // --- A. CALCULATE METRICS ---
  const totalOrders = orders.length;
  const completedOrders = orders.filter((o) => o.status === "completed").length;
  const onTimeOrders = orders.filter((o) => o.isLate === false).length;

  // 1. Satisfaction
  const ratings = orders.filter((o) => o.rating > 0).map((o) => o.rating);
  const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length || 0;
  const satisfactionPct = Math.round((avgRating / 5) * 100);

  // 2. Completion Rate
  const completionPct = Math.round((completedOrders / totalOrders) * 100) || 0;

  // 3. On-Time Rate
  const onTimePct = Math.round((onTimeOrders / totalOrders) * 100) || 0;

  // --- B. UPDATE CHARTS ---
  updatePieChart(1, satisfactionPct);
  updatePieChart(2, completionPct);
  updatePieChart(3, onTimePct);

  // --- C. UPDATE LISTS ---
  const feedbackItems = orders
    .filter((o) => o.comment && o.comment.length > 0)
    .sort((a, b) => b.timestamp - a.timestamp) // Newest first
    .slice(0, 3)
    .map((o) => `"${o.comment}" - ${o.rating}⭐`);

  updateList("feedback-list", feedbackItems);

  const realtimeItems = orders
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 3)
    .map((o) => {
      // ✅ SAFETY CHECK: If status is missing, use "N/A"
      const safeStatus = o.status ? o.status.toUpperCase() : "N/A";
      const safeId = o.orderId ? o.orderId.substring(0, 4) : "???";

      return `Order #${safeId}: ${safeStatus}`;
    });

  updateList("realtime-list", realtimeItems);
}

// Helper to draw the pie chart
function updatePieChart(chartId, percent) {
  const degrees = (percent / 100) * 360;
  const pie = document.getElementById(`chart${chartId}-pie`);
  const bar = document.getElementById(`chart${chartId}-bar`);

  if (pie) {
    pie.style.background = `conic-gradient(var(--primary-green) ${degrees}deg, #eee 0deg)`;
    pie.setAttribute("data-percent", percent + "%");
  }
  if (bar) {
    bar.style.width = percent + "%";
  }
}

function updateList(elementId, items) {
  const container = document.getElementById(elementId);
  if (!container) return;
  container.innerHTML = "";
  if (!items || items.length === 0) {
    container.innerHTML = "<p>No data available</p>";
    return;
  }

  items.forEach((item) => {
    const p = document.createElement("p");
    p.textContent = item;
    container.appendChild(p);
  });
}

// ==========================================
// 4. DATA SEEDER (RUN ONCE TO FILL DB)
// ==========================================
window.generateDummyData = async function () {
  if (!currentUserUid) return alert("Must be logged in!");
  if (!confirm("Generate 20 dummy orders?")) return;

  const ordersRef = collection(db, "vendors", currentUserUid, "orders");
  const statuses = ["completed", "completed", "completed", "cancelled"];
  const comments = ["Great food!", "Cold when arrived", "Loved it", "", ""];

  console.log("Seeding data...");
  for (let i = 0; i < 20; i++) {
    const randomDaysAgo = Math.floor(Math.random() * 60);
    const timestamp = Date.now() - randomDaysAgo * 24 * 60 * 60 * 1000;

    await addDoc(ordersRef, {
      orderId: "ORD-" + Math.random().toString(36).substr(2, 9),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      total: (Math.random() * 20 + 5).toFixed(2),
      rating: Math.floor(Math.random() * 2) + 4,
      comment: comments[Math.floor(Math.random() * comments.length)],
      isLate: Math.random() > 0.8,
      timestamp: timestamp,
    });
  }
  alert("Data Generated! Refreshing...");
  fetchDashboardData();
};

// Sidebar Toggle
window.toggleSidebar = function () {
  document.querySelector(".app-container").classList.toggle("collapsed");
};

// Handle Logout
const logoutLink = document.querySelector(".logout-link");
if (logoutLink) {
  logoutLink.addEventListener("click", (e) => {
    e.preventDefault();
    signOut(auth).then(
      () =>
        (window.location.href = "../../login-page-vp-jay/vendor-login.html"),
    );
  });
}

// Function called by HTML Buttons
window.setView = function (view) {
  document.getElementById("btn-current").classList.remove("active");
  document.getElementById("btn-previous").classList.remove("active");
  document.getElementById(`btn-${view}`).classList.add("active");

  updateCharts(view);
};

function renderSalesChart(labels, dataPoints) {
  const context = document.getElementById("SalesChart").getContext("2d");

  const existingChart = Chart.getChart("SalesChart");
  if (existingChart) {
    existingChart.destroy();
  }

  new Chart(context, {
    type: "line",

    data: {
      labels: labels,
      datasets: [
        {
          label: "Sales ($)",
          data: dataPoints,
          borderColor: "#68a357",
          backgroundColor: "rgba(104,163,87,0.1)",
          fill: true,
          tension: 0.4,
        },
      ],
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}
