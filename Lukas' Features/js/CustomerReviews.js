// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onValue,
  query,
  orderByChild,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

// Configuration
const VENDOR_ID = "vendor_101";
const REVIEWS_PATH = `vendors/${VENDOR_ID}/reviews`;

// State
let allReviews = [];
let currentFilter = "recent";
let selectedFormRating = 0;
let currentUser = null;
let unsubscribeReviews = null; // Store the unsubscribe function

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  initAuth();
  initStarRating();
});

// 1. AUTHENTICATION
function initAuth() {
  const authOverlay = document.getElementById("authOverlay");

  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in
      currentUser = user;
      authOverlay.style.display = "none";
      updateUserInterface(user);
      setupReviewsListener(); // Setup the real-time listener
    } else {
      // No user is signed in
      currentUser = null;
      authOverlay.style.display = "none";
      updateUserInterface(null);
      setupReviewsListener(); // Still allow viewing reviews as guest
    }
  });

  // Setup logout button
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }
}

function updateUserInterface(user) {
  const sidebarAvatar = document.getElementById("sidebar-avatar");
  const sidebarName = document.getElementById("sidebar-name");
  const headerAvatar = document.getElementById("header-avatar");
  const headerName = document.getElementById("header-name");
  const inputName = document.getElementById("inputName");

  if (user) {
    // Use Firebase user data
    const displayName = user.displayName || user.email?.split("@")[0] || "User";
    const initial = displayName.charAt(0).toUpperCase();
    const avatarUrl =
      user.photoURL ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}&backgroundColor=c0aede`;

    // Update sidebar
    if (sidebarAvatar) sidebarAvatar.textContent = initial;
    if (sidebarName) sidebarName.textContent = displayName;

    // Update header
    if (headerAvatar) headerAvatar.src = avatarUrl;
    if (headerName) headerName.textContent = displayName;

    // Pre-fill review form name
    if (inputName) inputName.value = displayName;
  } else {
    // Guest/Anonymous state
    const guestName = "Guest User";
    const guestInitial = "G";

    if (sidebarAvatar) sidebarAvatar.textContent = guestInitial;
    if (sidebarName) sidebarName.textContent = guestName;
    if (headerAvatar)
      headerAvatar.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=guest&backgroundColor=c0aede`;
    if (headerName) headerName.textContent = guestName;
  }
}

async function handleLogout(e) {
  e.preventDefault();

  // Unsubscribe from reviews listener before logout
  if (unsubscribeReviews) {
    unsubscribeReviews();
    unsubscribeReviews = null;
  }

  try {
    await signOut(auth);
    window.location.href = "../index.html";
  } catch (error) {
    console.error("Logout error:", error);
    alert("Failed to log out. Please try again.");
  }
}

// 2. DATA FETCHING - Real-time listener with proper cleanup
function setupReviewsListener() {
  // Clean up existing listener if any
  if (unsubscribeReviews) {
    unsubscribeReviews();
    unsubscribeReviews = null;
  }

  const reviewsRef = ref(database, REVIEWS_PATH);

  // Set up real-time listener and store unsubscribe function
  unsubscribeReviews = onValue(
    reviewsRef,
    (snapshot) => {
      console.log("Real-time update received:", snapshot.val()); // Debug log
      const data = snapshot.val();
      allReviews = [];

      if (data) {
        // Convert Firebase object to array
        Object.keys(data).forEach((key) => {
          allReviews.push({
            id: key,
            ...data[key],
          });
        });
      }

      console.log("Processed reviews:", allReviews); // Debug log
      renderReviews();
    },
    (error) => {
      console.error("Error fetching reviews:", error);
      document.getElementById("reviewsList").innerHTML = `
        <div class="empty-state">
          <i class="fas fa-exclamation-triangle"></i>
          <h3>Unable to load reviews</h3>
          <p>Please check your internet connection and try again.</p>
          <p style="font-size: 0.85rem; color: #999; margin-top: 10px;">Error: ${error.message}</p>
        </div>
      `;
    },
  );
}

// 3. SUBMIT REVIEW - Optimistic update with immediate reflection
async function submitReview(e) {
  e.preventDefault();

  if (selectedFormRating === 0) {
    document.getElementById("ratingError").style.display = "block";
    return;
  }

  const name = document.getElementById("inputName").value.trim();
  const highlight = document.getElementById("inputLike").value.trim();
  const reviewText = document.getElementById("inputReview").value.trim();
  const stallName = document.getElementById("inputStall").value.trim();

  // Create review object
  const newReview = {
    customerId: currentUser ? currentUser.uid : `guest_${Date.now()}`,
    customerName: name,
    rating: selectedFormRating,
    comment: reviewText,
    highlight: highlight || null,
    date: new Date().toISOString(),
    timestamp: Date.now(),
    stallName: stallName,
    isAnonymous: !currentUser,
  };

  // Optimistic update - add to local array immediately
  const tempId = `temp_${Date.now()}`;
  const optimisticReview = {
    id: tempId,
    ...newReview,
  };

  allReviews.unshift(optimisticReview); // Add to beginning
  renderReviews(); // Re-render immediately

  try {
    const reviewsRef = ref(database, REVIEWS_PATH);
    const newReviewRef = await push(reviewsRef, newReview);

    console.log("Review submitted successfully with key:", newReviewRef.key); // Debug log

    // Update the temporary ID with the real one
    const index = allReviews.findIndex((r) => r.id === tempId);
    if (index !== -1) {
      allReviews[index].id = newReviewRef.key;
    }

    // Success - reset form
    alert("Review Submitted Successfully!");
    e.target.reset();
    selectedFormRating = 0;
    resetStarVisuals();
    toggleReviewForm();
  } catch (error) {
    console.error("Error submitting review:", error);

    // Remove optimistic update on error
    allReviews = allReviews.filter((r) => r.id !== tempId);
    renderReviews();

    alert("Failed to submit review. Please try again.");
  }
}

// 4. RENDERING & FILTERS
function switchFilter(filterType) {
  currentFilter = filterType;

  // Update Button Visuals
  const buttons = document.querySelectorAll(".filter-btn");
  buttons.forEach((btn) => btn.classList.remove("active"));

  // Find the button that matches the filter
  buttons.forEach((btn) => {
    if (btn.getAttribute("onclick").includes(filterType)) {
      btn.classList.add("active");
    }
  });

  renderReviews();
}

function renderReviews() {
  const container = document.getElementById("reviewsList");

  if (!container) {
    console.error("Reviews container not found!");
    return;
  }

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

  // Sorting Logic
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
    card.style.animation = "fadeIn 0.4s ease-out";
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

  console.log(`Rendered ${sortedReviews.length} reviews`); // Debug log
}

// 5. UI INTERACTIONS
window.toggleReviewForm = function () {
  const overlay = document.getElementById("reviewFormOverlay");
  if (overlay) {
    overlay.classList.toggle("active");
  }
};

function initStarRating() {
  const stars = document.querySelectorAll("#starRatingInput .star");
  const label = document.getElementById("ratingLabel");
  const labels = ["Poor", "Fair", "Good", "Very Good", "Excellent"];

  if (stars.length === 0) return;

  stars.forEach((star) => {
    star.addEventListener("click", () => {
      selectedFormRating = parseInt(star.dataset.rating);
      const ratingError = document.getElementById("ratingError");
      if (ratingError) ratingError.style.display = "none";
      if (label) label.innerText = labels[selectedFormRating - 1];

      stars.forEach((s) => s.classList.remove("active"));
      for (let i = 0; i < selectedFormRating; i++) {
        stars[i].classList.add("active");
      }
    });

    // Hover effects
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

  const starContainer = document.getElementById("starRatingInput");
  if (starContainer) {
    starContainer.addEventListener("mouseleave", () => {
      stars.forEach((s, index) => {
        if (index < selectedFormRating) {
          s.style.color = "var(--star-yellow)";
        } else {
          s.style.color = "#e0e0e0";
        }
      });
    });
  }
}

function resetStarVisuals() {
  const stars = document.querySelectorAll("#starRatingInput .star");
  const label = document.getElementById("ratingLabel");

  stars.forEach((s) => {
    s.classList.remove("active");
    s.style.color = "#e0e0e0";
  });

  if (label) label.innerText = "Click stars to rate";
}

// Utility function to prevent XSS
function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Sidebar toggle for mobile
window.toggleSidebar = function () {
  const sidebar = document.querySelector(".sidebar");
  if (sidebar) {
    sidebar.classList.toggle("open");
  }
};

// Make functions available globally for onclick handlers
window.switchFilter = switchFilter;
window.submitReview = submitReview;

// Cleanup on page unload
window.addEventListener("beforeunload", () => {
  if (unsubscribeReviews) {
    unsubscribeReviews();
  }
});
