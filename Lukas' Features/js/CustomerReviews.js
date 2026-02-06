// CONFIGURATION
const API_URL = "http://localhost:3000/api";
// We default to 101, but you can change this to test other vendors
const VENDOR_ID = 101;

// STATE
let allReviews = [];
let selectedFormRating = 0;
// Generate a random ID for this session to simulate a user
const CURRENT_USER_ID =
  localStorage.getItem("userId") || Math.floor(Math.random() * 10000);
localStorage.setItem("userId", CURRENT_USER_ID);

document.addEventListener("DOMContentLoaded", () => {
  // 1. Load Data from Server
  fetchDashboardData();
  fetchReviews();

  // 2. Initialize UI interactions
  initStarRating();

  // 3. Keep the static tags cloud (since server doesn't calculate this yet)
  renderLikesStatic();
});

// --- API FUNCTIONS (The Bridge to Server) ---

async function fetchDashboardData() {
  try {
    const response = await fetch(`${API_URL}/vendors/${VENDOR_ID}/dashboard`);
    const data = await response.json();

    // Update Sidebar Numbers
    document.getElementById("avgRatingDisplay").textContent =
      data.averageRating || "0.0";
    document.getElementById("totalReviewsDisplay").textContent =
      data.totalOrders || "0";

    // Update Header Stars
    renderHeaderStars(Number(data.averageRating));

    // Update Rating Bars (Client-side calculation based on fetched reviews)
    // Note: We'll update bars after fetching the full review list for accuracy
  } catch (error) {
    console.error("Server down?", error);
  }
}

async function fetchReviews() {
  try {
    const response = await fetch(`${API_URL}/vendors/${VENDOR_ID}/reviews`);
    allReviews = await response.json();

    renderReviews();
    updateRatingBars(); // Update bars based on real data
  } catch (error) {
    console.error("Error fetching reviews:", error);
    document.getElementById("reviewsList").innerHTML =
      `<div style="text-align:center; padding:20px;">Check if server is running (node server.js)</div>`;
  }
}

async function submitReview(e) {
  e.preventDefault();

  if (selectedFormRating === 0) {
    document.getElementById("ratingError").style.display = "block";
    return;
  }

  const name = document.getElementById("inputName").value;
  const highlight = document.getElementById("inputLike").value;
  const reviewText = document.getElementById("inputReview").value;

  // Prepare data for Server
  const payload = {
    customerId: CURRENT_USER_ID,
    customerName: name,
    rating: selectedFormRating,
    comment: reviewText,
    highlight: highlight,
  };

  try {
    const response = await fetch(`${API_URL}/vendors/${VENDOR_ID}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (result.success) {
      alert("Review Submitted!");
      e.target.reset();
      selectedFormRating = 0;
      resetStarVisuals();
      toggleReviewForm();

      // Refresh Data
      fetchReviews();
      fetchDashboardData();
    }
  } catch (error) {
    alert("Error submitting review. Is server running?");
  }
}

// --- RENDERING FUNCTIONS (UI Logic) ---

function renderReviews() {
  const container = document.getElementById("reviewsList");
  container.innerHTML = "";

  if (allReviews.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding: 40px; color: #999; background:white; border-radius:12px; border:1px solid #e5e5e5">No reviews yet. Be the first!</div>`;
    return;
  }

  // Sort by newest first
  const sortedReviews = allReviews.sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );

  sortedReviews.forEach((review) => {
    const card = document.createElement("div");
    card.className = "review-card";

    // Handle Highlight Badge
    let highlightHtml = "";
    if (review.highlight) {
      highlightHtml = `<div class="highlight-badge"><i class="fas fa-thumbs-up" style="margin-right:4px; color:var(--primary-purple)"></i> ${review.highlight}</div>`;
    }

    // Format Date
    const dateObj = new Date(review.date);
    const dateString = dateObj.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    // Generate Avatar Seed from Name
    const avatarSeed = review.customerName || "User";

    card.innerHTML = `
      <div class="review-header">
          <div class="user-meta">
            <div class="review-avatar">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}" />
            </div>
            <div class="meta-text">
                <h4>${review.customerName || "Anonymous"}</h4>
                <div class="date">${dateString}</div>
            </div>
          </div>
          <div class="stars-display">
              ${'<i class="fas fa-star"></i>'.repeat(review.rating)}
              ${'<i class="far fa-star"></i>'.repeat(5 - review.rating)}
          </div>
      </div>
      
      <div class="review-body">
          ${highlightHtml}
          <div class="review-line">${review.comment}</div>
      </div>
    `;
    container.appendChild(card);
  });
}

function updateRatingBars() {
  const container = document.getElementById("ratingBars");
  container.innerHTML = "";
  const total = allReviews.length;

  for (let i = 5; i >= 1; i--) {
    const count = allReviews.filter((r) => r.rating === i).length;
    const percentage = total === 0 ? 0 : Math.round((count / total) * 100);

    const row = document.createElement("div");
    row.className = "rating-bar-row";
    row.innerHTML = `
        <div class="rating-label">${i} <i class="fas fa-star" style="font-size:10px; color:#999"></i></div>
        <div class="progress-container">
            <div class="progress-fill" style="width: ${percentage}%"></div>
        </div>
        <span class="percentage-label">${percentage}%</span>
      `;
    container.appendChild(row);
  }
}

function renderHeaderStars(avg) {
  const headerStars = document.getElementById("headerStars");
  headerStars.innerHTML = "";
  const roundedAvg = Math.round(avg);
  for (let i = 0; i < 5; i++) {
    const star = document.createElement("i");
    star.className = `fas fa-star star ${i < roundedAvg ? "filled" : "empty"}`;
    headerStars.appendChild(star);
  }
}

function renderLikesStatic() {
  // Keeping this static for now as requested
  const likes = [
    { text: "Delicious", count: 72, type: "purple" },
    { text: "Great Value", count: 54, type: "green" },
    { text: "Too Busy", count: 26, type: "orange" },
    { text: "Punctual", count: 14, type: "pink" },
  ];
  const container = document.getElementById("likesContainer");
  container.innerHTML = "";
  likes.forEach((like) => {
    const div = document.createElement("div");
    div.className = "like-tag";
    div.innerHTML = `<span>${like.text}</span><span class="like-count ${like.type}">${like.count}</span>`;
    container.appendChild(div);
  });
}

// --- INTERACTIONS ---

window.toggleDropdown = function () {
  document.getElementById("dropdownMenu").classList.toggle("active");
};

window.toggleReviewForm = function () {
  const overlay = document.getElementById("reviewFormOverlay");
  overlay.classList.toggle("active");
};

// Star Rating Logic
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
  });
}

function resetStarVisuals() {
  document
    .querySelectorAll("#starRatingInput .star")
    .forEach((s) => s.classList.remove("active"));
  document.getElementById("ratingLabel").innerText = "Select stars";
}

// Make submitReview global so HTML can see it
window.submitReview = submitReview;
window.resetData = function () {
  alert(
    "Cannot reset server data from client (Restricted). Restart node server to reset.",
  );
};
