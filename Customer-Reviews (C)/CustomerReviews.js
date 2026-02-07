import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc, // Added this to allow writing to database
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
let selectedRating = 0; // Tracks the star rating selected by user

document.addEventListener("DOMContentLoaded", () => {
  fetchReviewsFromOrders();
  setupStarRating(); // Initialize star click listeners
});

// --- 1. STAR RATING LOGIC ---
function setupStarRating() {
  const starContainer = document.getElementById("starRatingInput");
  if (!starContainer) return;

  const stars = starContainer.querySelectorAll(".star");
  const ratingLabel = document.getElementById("ratingLabel");
  const errorMsg = document.getElementById("ratingError");

  // Initial state: grey stars
  stars.forEach((s) => {
    s.style.color = "#ccc";
    s.style.cursor = "pointer";
  });

  stars.forEach((star) => {
    star.addEventListener("click", () => {
      // Get value
      const rating = parseInt(star.getAttribute("data-rating"));
      selectedRating = rating;

      // Update Visuals (Gold vs Grey)
      stars.forEach((s) => {
        const sRating = parseInt(s.getAttribute("data-rating"));
        if (sRating <= rating) {
          s.style.color = "#fbbf24"; // Gold
          s.classList.remove("far");
          s.classList.add("fas"); // Solid star
        } else {
          s.style.color = "#ccc"; // Grey
          s.classList.remove("fas");
          s.classList.add("far"); // Outline star
        }
      });

      // Update Label
      if (ratingLabel) {
        ratingLabel.innerText = `You selected: ${rating} Star${rating > 1 ? "s" : ""}`;
        ratingLabel.style.color = "#333";
      }

      // Hide error if visible
      if (errorMsg) errorMsg.style.display = "none";
    });
  });
}

// --- 2. SUBMIT REVIEW LOGIC ---
async function submitReview(event) {
  event.preventDefault(); // Stop page refresh

  // Get input values
  const name = document.getElementById("inputName").value;
  const stall = document.getElementById("inputStall").value;
  const highlight = document.getElementById("inputLike").value;
  const reviewText = document.getElementById("inputReview").value;

  // Validation: Check if stars are clicked
  if (selectedRating === 0) {
    const errorMsg = document.getElementById("ratingError");
    if (errorMsg) errorMsg.style.display = "block";
    return;
  }

  // Create data object
  const newReviewData = {
    customerName: name,
    stallName: stall,
    rating: selectedRating,
    comment: reviewText,
    highlight: highlight, // Optional field
    timestamp: Date.now(),
    orderId: "Manual-" + Math.floor(Math.random() * 10000), // Generate fake ID for demo
  };

  try {
    // Add to Firebase
    const ordersRef = collection(db, "vendors", VENDOR_ID, "orders");
    await addDoc(ordersRef, newReviewData);

    // Success: Alert and Reset
    alert("Review Submitted Successfully!");

    // Reset Form
    document.querySelector("form").reset();
    selectedRating = 0;

    // Reset Stars Visually
    const stars = document.querySelectorAll("#starRatingInput .star");
    stars.forEach((s) => {
      s.style.color = "#ccc";
      s.classList.remove("fas");
      s.classList.add("far");
    });
    document.getElementById("ratingLabel").innerText = "Click stars to rate";

    // Close Modal
    toggleReviewForm();
  } catch (error) {
    console.error("Error adding review: ", error);
    alert("Error submitting review. See console for details.");
  }
}

// --- 3. FETCH & DISPLAY LOGIC (Original) ---
function fetchReviewsFromOrders() {
  const ordersRef = collection(db, "vendors", VENDOR_ID, "orders");

  onSnapshot(ordersRef, (snapshot) => {
    allReviews = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      // Only include documents that actually have a review
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

// --- 4. FILTER LOGIC (Original) ---
function switchFilter(filterType) {
  console.log("Filtering by:", filterType);
  currentFilter = filterType;

  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.toggle(
      "active",
      btn.textContent.toLowerCase().includes(filterType),
    );
  });

  renderReviews();
}

// --- 5. RENDER LOGIC (Original) ---
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

// --- 6. EXPORT TO HTML ---
window.switchFilter = switchFilter;
window.submitReview = submitReview; // Make submit accessible to HTML
window.toggleReviewForm = () => {
  document.getElementById("reviewFormOverlay").classList.toggle("active");
};
