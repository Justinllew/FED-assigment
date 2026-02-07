import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getFirestore,
  collection,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

const VENDOR_ID = "vjzBxXgKGNgS8JzUUckSApQimXt2";
let allReviews = [];
let currentFilter = "recent";

document.addEventListener("DOMContentLoaded", () => {
  fetchReviewsFromOrders();
});

// 1. Fetching from the 'orders' collection seen in your screenshot
function fetchReviewsFromOrders() {
  const ordersRef = collection(db, "vendors", VENDOR_ID, "orders");

  onSnapshot(ordersRef, (snapshot) => {
    allReviews = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      // Only include documents that actually have a review (comment + rating)
      if (data.rating !== undefined && data.comment) {
        allReviews.push({
          id: doc.id,
          customerName: data.customerName || "Customer",
          rating: Number(data.rating),
          comment: data.comment,
          timestamp: data.timestamp || 0,
          orderId: data.orderId || "N/A",
        });
      }
    });
    renderReviews();
  });
}

// 2. This is the function your HTML buttons call
function switchFilter(filterType) {
  console.log("Filtering by:", filterType);
  currentFilter = filterType;

  // Update button visuals
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.toggle(
      "active",
      btn.textContent.toLowerCase().includes(filterType),
    );
  });

  renderReviews();
}

// 3. Sorting and displaying the data
function renderReviews() {
  const container = document.getElementById("reviewsList");
  if (!container) return;

  let sorted = [...allReviews];

  if (currentFilter === "recent") {
    sorted.sort((a, b) => b.timestamp - a.timestamp);
  } else if (currentFilter === "highest") {
    sorted.sort((a, b) => b.rating - a.rating);
  } else if (currentFilter === "lowest") {
    sorted.sort((a, b) => a.rating - b.rating);
  }

  if (sorted.length === 0) {
    container.innerHTML = `<p style="text-align:center; padding:20px;">No reviews found in your orders history.</p>`;
    return;
  }

  container.innerHTML = sorted
    .map((review) => {
      let stars = "";
      for (let i = 1; i <= 5; i++) {
        stars +=
          i <= review.rating
            ? '<i class="fas fa-star"></i>'
            : '<i class="far fa-star"></i>';
      }

      return `
      <div class="review-card" style="background: white; padding: 20px; border-radius: 12px; margin-bottom: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
            <h4 style="margin:0 0 5px 0;">${review.customerName}</h4>
            <div style="font-size:0.8rem; color:#666; margin-bottom:10px;">Order: ${review.orderId}</div>
          </div>
          <div style="color:#fbbf24;">${stars}</div>
        </div>
        <p style="margin:0; color:#444; line-height:1.5;">"${review.comment}"</p>
      </div>
    `;
    })
    .join("");
}

// Global exposure for the HTML onclick events
window.switchFilter = switchFilter;
window.toggleReviewForm = () => {
  document.getElementById("reviewFormOverlay").classList.toggle("active");
};
