// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onValue,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Firebase Configuration
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

// Initialize Firebase
let app;
let database;

try {
  app = initializeApp(firebaseConfig);
  database = getDatabase(app);
  console.log("✅ Firebase initialized successfully");
} catch (error) {
  console.error("❌ Firebase initialization failed:", error);
  alert("Failed to connect to database. Check console for details.");
}

// Configuration
const VENDOR_ID = "vendor_101";
const REVIEWS_PATH = `vendors/${VENDOR_ID}/reviews`;

// State
let allReviews = [];
let currentFilter = "recent";
let selectedFormRating = 0;

// User ID Setup
const CURRENT_USER_ID =
  localStorage.getItem("userId") || `user_${Math.floor(Math.random() * 10000)}`;
localStorage.setItem("userId", CURRENT_USER_ID);

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("📄 DOM loaded, initializing...");
  fetchReviews();
  initStarRating();
});

// 1. DATA FETCHING - Real-time listener
function fetchReviews() {
  console.log("📡 Fetching reviews from:", REVIEWS_PATH);

  const reviewsRef = ref(database, REVIEWS_PATH);

  onValue(
    reviewsRef,
    (snapshot) => {
      const data = snapshot.val();
      console.log("📥 Received data:", data);

      allReviews = [];

      if (data) {
        Object.keys(data).forEach((key) => {
          allReviews.push({
            id: key,
            ...data[key],
          });
        });
      }

      console.log(`✅ Loaded ${allReviews.length} reviews`);
      renderReviews();
    },
    (error) => {
      console.error("❌ Error fetching reviews:", error);
      console.error("Error details:", error.message, error.code);
      document.getElementById("reviewsList").innerHTML = `
        <div class="empty-state">
          <i class="fas fa-exclamation-triangle" style="color: #dc2626;"></i>
          <h3>Unable to load reviews</h3>
          <p>Error: ${error.message}</p>
          <p style="font-size: 0.8rem; color: #999;">Code: ${error.code}</p>
        </div>
      `;
    },
  );
}

// 2. SUBMIT REVIEW - With detailed error logging
async function submitReview(e) {
  e.preventDefault();

  console.log("📝 Submitting review...");

  if (selectedFormRating === 0) {
    document.getElementById("ratingError").style.display = "block";
    console.warn("⚠️ No rating selected");
    return;
  }

  const name = document.getElementById("inputName").value.trim();
  const highlight = document.getElementById("inputLike").value.trim();
  const reviewText = document.getElementById("inputReview").value.trim();
  const stallName = document.getElementById("inputStall").value.trim();

  console.log("Form data:", {
    name,
    stallName,
    rating: selectedFormRating,
    highlight,
    reviewText,
  });

  const payload = {
    customerId: CURRENT_USER_ID,
    customerName: name,
    rating: selectedFormRating,
    comment: reviewText,
    highlight: highlight || null,
    stallName: stallName,
    date: new Date().toISOString(),
    timestamp: serverTimestamp(), // Use Firebase server timestamp
  };

  console.log("📤 Payload:", payload);
  console.log("🎯 Path:", REVIEWS_PATH);

  try {
    const reviewsRef = ref(database, REVIEWS_PATH);
    console.log("⏳ Pushing to database...");

    const result = await push(reviewsRef, payload);
    console.log("✅ Review submitted successfully! Key:", result.key);

    alert("Review Submitted Successfully!");
    e.target.reset();
    selectedFormRating = 0;
    resetStarVisuals();
    toggleReviewForm();
  } catch (error) {
    console.error("❌ Error submitting review:");
    console.error("Error object:", error);
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    console.error("Error stack:", error.stack);

    alert(
      `Failed to submit review!\n\nError: ${error.message}\nCode: ${error.code || "Unknown"}\n\nCheck console (F12) for more details.`,
    );
  }
}

// 3. RENDERING & FILTERS
function switchFilter(filterType) {
  currentFilter = filterType;

  const buttons = document.querySelectorAll(".filter-btn");
  buttons.forEach((btn) => btn.classList.remove("active"));

  buttons.forEach((btn) => {
    if (btn.getAttribute("onclick").includes(filterType)) {
      btn.classList.add("active");
    }
  });

  renderReviews();
}

function renderReviews() {
  const container = document.getElementById("reviewsList");
  container.innerHTML = "";

  if (allReviews.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-comment-slash"></i>
        <h3>No reviews yet</h3>
        <p>Be the first to share your experience!</p>
      </div>
    `;
    return;
  }

  let sortedReviews = [...allReviews];
  if (currentFilter === "recent") {
    sortedReviews.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  } else if (currentFilter === "highest") {
    sortedReviews.sort((a, b) => b.rating - a.rating);
  } else if (currentFilter === "lowest") {
    sortedReviews.sort((a, b) => a.rating - b.rating);
  }

  sortedReviews.forEach((review) => {
    const dateString = review.date
      ? new Date(review.date).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "Recently";

    const avatarSeed = review.customerName || "User";

    let starsHtml = "";
    for (let i = 1; i <= 5; i++) {
      starsHtml +=
        i <= review.rating
          ? '<i class="fas fa-star"></i>'
          : '<i class="far fa-star"></i>';
    }

    const highlightHtml = review.highlight
      ? `<div class="highlight-badge"><i class="fas fa-thumbs-up"></i> ${escapeHtml(review.highlight)}</div>`
      : "";

    const card = document.createElement("div");
    card.className = "review-card";
    card.innerHTML = `
      <div class="review-header">
        <div class="user-meta">
          <div class="review-avatar">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(avatarSeed)}" alt="${escapeHtml(review.customerName)}" />
          </div>
          <div class="meta-text">
            <h4>${escapeHtml(review.customerName)}</h4>
            <div>${dateString}</div>
          </div>
        </div>
        <div class="stars-display">${starsHtml}</div>
      </div>
      ${highlightHtml}
      <p style="color:#555; line-height:1.5;">${escapeHtml(review.comment)}</p>
    `;
    container.appendChild(card);
  });
}

// 4. UI INTERACTIONS
window.toggleReviewForm = function () {
  const overlay = document.getElementById("reviewFormOverlay");
  overlay.classList.toggle("active");
};

function initStarRating() {
  const stars = document.querySelectorAll("#starRatingInput .star");
  const label = document.getElementById("ratingLabel");
  const labels = ["Poor", "Fair", "Good", "Very Good", "Excellent"];

  stars.forEach((star) => {
    star.addEventListener("click", () => {
      selectedFormRating = parseInt(star.dataset.rating);
      document.getElementById("ratingError").style.display = "none";
      label.innerText = labels[selectedFormRating - 1];

      stars.forEach((s) => s.classList.remove("active"));
      for (let i = 0; i < selectedFormRating; i++) {
        stars[i].classList.add("active");
      }
    });

    star.addEventListener("mouseenter", () => {
      const hoverRating = parseInt(star.dataset.rating);
      stars.forEach((s, index) => {
        if (index < hoverRating) {
          s.style.color = "var(--star-yellow)";
        } else {
          s.style.color = "#e0e0e0";
        }
      });
    });
  });

  document
    .getElementById("starRatingInput")
    .addEventListener("mouseleave", () => {
      stars.forEach((s, index) => {
        if (index < selectedFormRating) {
          s.style.color = "var(--star-yellow)";
        } else {
          s.style.color = "#e0e0e0";
        }
      });
    });
}

function resetStarVisuals() {
  const stars = document.querySelectorAll("#starRatingInput .star");
  stars.forEach((s) => {
    s.classList.remove("active");
    s.style.color = "#e0e0e0";
  });
  const label = document.getElementById("ratingLabel");
  if (label) label.innerText = "Click stars to rate";
}

function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

window.toggleSidebar = function () {
  document.querySelector(".sidebar").classList.toggle("open");
};

window.switchFilter = switchFilter;
window.submitReview = submitReview;
