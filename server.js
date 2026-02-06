const express = require("express");
const cors = require("cors");

const app = express();

// MIDDLEWARE
app.use(express.json()); // Built-in body parser (replaces body-parser)
app.use(cors()); // Allows your frontend (port 5500) to talk to backend (port 3000)

// ==========================================
// 1. MOCK DATABASE
// ==========================================

// Users
const users = [
  {
    id: 1,
    username: "uncle_lim",
    role: "vendor",
    storeId: 101,
    password: "password123",
  },
  {
    id: 2,
    username: "hungry_jane",
    role: "customer",
    points: 50,
    password: "password123",
  },
  { id: 3, username: "nea_officer", role: "admin", password: "securepassword" },
];

// Vendors
const vendors = [
  {
    id: 101,
    name: "Lim's Hainanese Chicken Rice",
    hawkerCentre: "Maxwell Food Centre",
    unitNo: "#01-10",
    licenseNo: "W9612345A",
    cuisine: "Chinese",
    rating: 4.8,
    description: "Best chicken rice since 1986.",
    image: "https://example.com/chicken_rice.jpg",
    isOpen: true,
  },
];

// Menu Items
const menuItems = [
  {
    id: 1,
    vendorId: 101,
    name: "Roasted Chicken Rice",
    price: 5.5,
    likes: 1240,
    category: "Main",
  },
  {
    id: 2,
    vendorId: 101,
    name: "Steamed Chicken Rice",
    price: 5.5,
    likes: 980,
    category: "Main",
  },
  {
    id: 3,
    vendorId: 101,
    name: "Braised Egg",
    price: 1.0,
    likes: 200,
    category: "Side",
  },
];

// Orders (With Fake History)
const orders = [];
const generatePastOrders = () => {
  const now = new Date();
  for (let i = 0; i < 50; i++) {
    // Generate a random past date within the last year
    const pastDate = new Date(now.getTime() - Math.random() * 31536000000);
    orders.push({
      id: `ORD-${1000 + i}`,
      vendorId: 101,
      customerId: 2,
      items: [{ itemId: 1, qty: 1, price: 5.5 }],
      total: 5.5,
      status: "COMPLETED",
      paymentMethod: "PayNow",
      timestamp: pastDate,
    });
  }
};
generatePastOrders();

// NEA Inspections
const inspections = [
  {
    id: 501,
    vendorId: 101,
    date: "2025-11-20",
    officer: "Officer Tan",
    majorLapses: 0,
    score: 95,
    comments: "Grease trap well maintained. Food handlers wearing masks.",
  },
];

// Reviews
const reviews = [
  {
    id: 1,
    vendorId: 101,
    customerId: 2,
    customerName: "Hungry Jane",
    rating: 5,
    comment: "Chilli is power!",
    highlight: "Spicy Chilli",
    date: new Date("2026-02-01").toISOString(),
  },
];

// Helper Function: Hygiene Grade
const calculateHygieneGrade = (vendorId) => {
  const vendorInspections = inspections.filter(
    (i) => i.vendorId === parseInt(vendorId),
  );
  if (vendorInspections.length === 0) return "New";
  const latest = vendorInspections[0];
  if (latest.majorLapses > 0) return "C";
  if (latest.score >= 85) return "A";
  return "B";
};

// ==========================================
// 2. API ENDPOINTS
// ==========================================

// --- CUSTOMER REVIEWS ---

// 1. Submit Review
app.post("/api/vendors/:id/review", (req, res) => {
  console.log(`[POST] Review received for Vendor ${req.params.id}`);
  const { customerId, customerName, rating, comment, highlight } = req.body;

  const newReview = {
    id: reviews.length + 1,
    vendorId: parseInt(req.params.id),
    customerId,
    customerName: customerName || "Anonymous",
    rating,
    comment,
    highlight,
    date: new Date().toISOString(),
  };

  reviews.push(newReview);
  res.json({ success: true, message: "Review posted" });
});

// 2. Get Reviews
app.get("/api/vendors/:id/reviews", (req, res) => {
  console.log(`[GET] Fetching reviews for Vendor ${req.params.id}`);
  const vendorReviews = reviews.filter(
    (r) => r.vendorId === parseInt(req.params.id),
  );
  res.json(vendorReviews);
});

// --- VENDOR DASHBOARD ---

// 3. Get Vendor Dashboard Stats
app.get("/api/vendors/:id/dashboard", (req, res) => {
  const vendorId = parseInt(req.params.id);

  // Filter Data
  const vendorOrders = orders.filter((o) => o.vendorId === vendorId);
  const vendorReviews = reviews.filter((r) => r.vendorId === vendorId);

  // Calculate Last Year Revenue
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const recentOrders = vendorOrders.filter(
    (o) => new Date(o.timestamp) >= oneYearAgo,
  );

  const totalRevenue = recentOrders.reduce((acc, curr) => acc + curr.total, 0);
  const totalOrders = recentOrders.length;

  // Calculate Avg Rating
  const avgRating =
    vendorReviews.length > 0
      ? vendorReviews.reduce((acc, curr) => acc + curr.rating, 0) /
        vendorReviews.length
      : 0;

  res.json({
    period: "Last 1 Year",
    totalRevenue: totalRevenue.toFixed(2),
    totalOrders: totalOrders,
    averageRating: avgRating.toFixed(1),
    hygieneGrade: calculateHygieneGrade(vendorId),
    recentOrders: recentOrders.slice(0, 5), // Send top 5 recent
  });
});

// 4. List Vendors
app.get("/api/vendors", (req, res) => {
  const enrichedVendors = vendors.map((v) => ({
    ...v,
    hygieneGrade: calculateHygieneGrade(v.id),
  }));
  res.json(enrichedVendors);
});

// --- ORDERING SYSTEM ---

// 5. Get Menu
app.get("/api/vendors/:id/menu", (req, res) => {
  const vendorMenu = menuItems.filter(
    (m) => m.vendorId === parseInt(req.params.id),
  );
  res.json(vendorMenu);
});

// 6. Like Menu Item
app.post("/api/menu/:itemId/like", (req, res) => {
  const item = menuItems.find((m) => m.id === parseInt(req.params.itemId));
  if (item) {
    item.likes++;
    res.json({ success: true, newLikes: item.likes });
  } else {
    res.status(404).json({ error: "Item not found" });
  }
});

// 7. Place Order
app.post("/api/orders", (req, res) => {
  console.log("[POST] New Order Received");
  const { customerId, vendorId, items, paymentMethod } = req.body;

  let total = 0;
  items.forEach((i) => (total += i.price * i.qty));

  const newOrder = {
    id: `ORD-${Date.now()}`,
    vendorId: parseInt(vendorId),
    customerId,
    items,
    total,
    status: "PENDING",
    paymentMethod,
    paymentStatus: "PAID",
    timestamp: new Date(),
  };
  orders.unshift(newOrder); // Add to beginning of array

  // Update Loyalty Points
  const customer = users.find((u) => u.id === parseInt(customerId));
  if (customer) {
    customer.points += Math.floor(total);
  }

  res.json({
    success: true,
    orderId: newOrder.id,
    loyaltyPointsEarned: Math.floor(total),
  });
});

// 8. Order History (Customer)
app.get("/api/customers/:id/history", (req, res) => {
  // Note: Since mock IDs are numbers but params are strings, we accept both for the customer check
  const history = orders
    .filter((o) => o.customerId == req.params.id)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  res.json(history);
});

// --- KITCHEN DISPLAY SYSTEM ---

// 9. Get Orders for Kitchen
app.get("/api/vendors/:id/orders", (req, res) => {
  const vendorOrders = orders.filter(
    (o) => o.vendorId === parseInt(req.params.id),
  );
  // Sort by newest first
  vendorOrders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  res.json(vendorOrders);
});

// 10. Update Order Status (Cooking -> Completed)
app.put("/api/orders/:id/status", (req, res) => {
  console.log(
    `[PUT] Update Status for Order ${req.params.id} -> ${req.body.status}`,
  );
  const { status } = req.body;
  const order = orders.find((o) => o.id == req.params.id); // Order IDs are strings (ORD-123)

  if (order) {
    order.status = status;
    res.json({ success: true, order });
  } else {
    res.status(404).json({ error: "Order not found" });
  }
});

// --- NEA FEATURES ---

// 11. Log Inspection
app.post("/api/nea/inspection", (req, res) => {
  const { vendorId, officer, majorLapses, score, comments } = req.body;
  const newInspection = {
    id: inspections.length + 500,
    vendorId: parseInt(vendorId),
    date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
    officer,
    majorLapses,
    score,
    comments,
  };
  inspections.unshift(newInspection);
  res.json({ success: true, message: "Inspection logged" });
});

// 12. Public Hygiene Status
app.get("/api/nea/status/:vendorId", (req, res) => {
  const grade = calculateHygieneGrade(req.params.vendorId);
  const lastInspection = inspections.find(
    (i) => i.vendorId === parseInt(req.params.vendorId),
  );

  res.json({
    vendorId: req.params.vendorId,
    safeGrade: grade, // A, B, C, New
    lastInspectionDate: lastInspection ? lastInspection.date : "N/A",
    officerComments: lastInspection ? lastInspection.comments : "N/A",
  });
});

// ==========================================
// START SERVER
// ==========================================
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Hawker Centre API running on http://localhost:${PORT}`);
  console.log(`-----------------------------------------------------`);
  console.log(
    `- Vendor Dashboard:  http://localhost:${PORT}/api/vendors/101/dashboard`,
  );
  console.log(
    `- Vendor Reviews:    http://localhost:${PORT}/api/vendors/101/reviews`,
  );
  console.log(
    `- Kitchen Display:   http://localhost:${PORT}/api/vendors/101/orders`,
  );
  console.log(`-----------------------------------------------------\n`);
});
