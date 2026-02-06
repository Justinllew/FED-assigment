// CONFIGURATION
const API_URL =
  "https://hawkerbase-fedasg-default-rtdb.asia-southeast1.firebasedatabase.app";
const VENDOR_ID = 101;

// STATE
let allReviews = [];
let currentFilter = "recent"; // recent, highest, lowest
let selectedFormRating = 0;

// User ID Setup
const CURRENT_USER_ID =
  localStorage.getItem("userId") || Math.floor(Math.random() * 10000);
localStorage.setItem("userId", CURRENT_USER_ID);

document.addEventListener("DOMContentLoaded", () => {
  fetchReviews();
  initStarRating();
});

// 1. DATA FETCHING
async function fetchReviews() {
  try {
    const response = await fetch(`${API_URL}/vendors/${VENDOR_ID}/reviews`);
    allReviews = await response.json();
    renderReviews();
  } catch (error) {
    console.error("Error fetching reviews:", error);
    document.getElementById("reviewsList").innerHTML =
      `<div style="text-align:center; padding: 40px; background:white; border-radius:12px; border:1px solid #ddd; color:#888;">
                <i class="fas fa-exclamation-triangle" style="font-size:2rem; margin-bottom:10px;"></i><br>
                Server is offline. Unable to load reviews.
            </div>`;
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
      fetchReviews(); // Refresh list
    }
  } catch (error) {
    // Fallback for demo purposes if server is down
    console.warn("Server unreachable, logging locally:", payload);
    alert("Server is offline, but your review looked perfect!");
  }
}

// 2. RENDERING & FILTERS
function switchFilter(filterType) {
  currentFilter = filterType;

  // Update Button Visuals
  const buttons = document.querySelectorAll(".filter-btn");
  buttons.forEach((btn) => btn.classList.remove("active"));

  // Find the button that was clicked (based on text logic or event)
  // Simpler approach: find based on onclick attr in HTML for now
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
    container.innerHTML = `<p style="text-align:center; color:#888; margin-top:40px;">No reviews yet.</p>`;
    return;
  }

  // Sorting Logic
  let sortedReviews = [...allReviews]; // Copy array
  if (currentFilter === "recent") {
    sortedReviews.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (currentFilter === "highest") {
    sortedReviews.sort((a, b) => b.rating - a.rating);
  } else if (currentFilter === "lowest") {
    sortedReviews.sort((a, b) => a.rating - b.rating);
  }

  sortedReviews.forEach((review) => {
    const dateString = new Date(review.date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const avatarSeed = review.customerName || "User";

    let starsHtml = "";
    for (let i = 1; i <= 5; i++) {
      starsHtml +=
        i <= review.rating
          ? '<i class="fas fa-star"></i>'
          : '<i class="far fa-star"></i>';
    }

    const highlightHtml = review.highlight
      ? `<div class="highlight-badge"><i class="fas fa-thumbs-up"></i> ${review.highlight}</div>`
      : "";

    const card = document.createElement("div");
    card.className = "review-card";
    card.innerHTML = `
            <div class="review-header">
                <div class="user-meta">
                    <div class="review-avatar">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}" />
                    </div>
                    <div>
                        <h4 style="font-weight:700; color:#333;">${review.customerName}</h4>
                        <div style="font-size:0.8rem; color:#888;">${dateString}</div>
                    </div>
                </div>
                <div class="stars-display">${starsHtml}</div>
            </div>
            ${highlightHtml}
            <p style="color:#555; line-height:1.5;">${review.comment}</p>
        `;
    container.appendChild(card);
  });
}

// 3. UI INTERACTIONS
window.toggleReviewForm = function () {
  document.getElementById("reviewFormOverlay").classList.toggle("active");
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
  });
}

function resetStarVisuals() {
  document
    .querySelectorAll("#starRatingInput .star")
    .forEach((s) => s.classList.remove("active"));
  const label = document.getElementById("ratingLabel");
  if (label) label.innerText = "Click stars to rate";
}
