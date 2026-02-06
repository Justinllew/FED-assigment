// --- Data & Initialization ---

const defaultReviews = [
  {
    id: 1709251200000,
    name: "Tom Harrison",
    date: "12 Jan 2026",
    avatar: "Tom",
    rating: 5,
    lines: [
      "Absolutely loved the food! The pasta was cooked to perfection.",
      "Will definitely order again. Highly recommended.",
    ],
    highlight: "Fast Delivery",
  },
  {
    id: 1709337600000,
    name: "James Tan",
    date: "14 Jan 2026",
    avatar: "James",
    rating: 4,
    lines: [
      "Good quality ingredients, you can taste the freshness.",
      "Portion size is generous for the price.",
    ],
    highlight: "Great Value",
  },
  {
    id: 1709424000000,
    name: "Richard Ng",
    date: "18 Jan 2026",
    avatar: "Richard",
    rating: 3,
    lines: ["Decent meal, but the sauce was a bit too salty for my taste."],
  },
];

const likes = [
  { id: 1, text: "Delicious", count: 72, type: "purple" },
  { id: 2, text: "Great Value", count: 54, type: "green" },
  { id: 3, text: "Too Busy", count: 26, type: "orange" },
  { id: 4, text: "Punctual", count: 14, type: "pink" },
];

let allReviews = [];
let selectedFormRating = 0;

document.addEventListener("DOMContentLoaded", () => {
  loadReviews();
  renderLikes();
  initStarRating();
  updateDashboard();
});

// --- Logic Functions ---

function loadReviews() {
  const stored = localStorage.getItem("vendorReviewsData");
  if (stored) {
    allReviews = JSON.parse(stored);
  } else {
    allReviews = [...defaultReviews];
    saveReviews();
  }
}

function saveReviews() {
  localStorage.setItem("vendorReviewsData", JSON.stringify(allReviews));
  updateDashboard();
}

function updateDashboard() {
  renderReviews();
  updateSidebarStats();
}

function resetData() {
  if (confirm("Reset to default demo data?")) {
    allReviews = [...defaultReviews];
    saveReviews();
    location.reload();
  }
}

// --- Rendering Functions ---

function updateSidebarStats() {
  const total = allReviews.length;
  const sum = allReviews.reduce((acc, r) => acc + r.rating, 0);
  const avg = total === 0 ? 0 : (sum / total).toFixed(1); // One decimal for cleaner look

  document.getElementById("avgRatingDisplay").textContent = avg;
  document.getElementById("totalReviewsDisplay").textContent = total;

  // Header Stars
  const headerStars = document.getElementById("headerStars");
  headerStars.innerHTML = "";
  const roundedAvg = Math.round(avg);
  for (let i = 0; i < 5; i++) {
    const star = document.createElement("i");
    star.className = `fas fa-star star ${i < roundedAvg ? "filled" : "empty"}`;
    headerStars.appendChild(star);
  }

  // Rating Bars
  const container = document.getElementById("ratingBars");
  container.innerHTML = "";

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

function renderLikes() {
  const container = document.getElementById("likesContainer");
  container.innerHTML = ""; // Clear existing first
  likes.forEach((like) => {
    const div = document.createElement("div");
    div.className = "like-tag";
    div.innerHTML = `
      <span>${like.text}</span>
      <span class="like-count ${like.type}">${like.count}</span>
    `;
    container.appendChild(div);
  });
}

function renderReviews() {
  const container = document.getElementById("reviewsList");
  container.innerHTML = "";

  if (allReviews.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding: 40px; color: #999; background:white; border-radius:12px; border:1px solid #e5e5e5">No reviews yet. Be the first!</div>`;
    return;
  }

  allReviews.forEach((review) => {
    const card = document.createElement("div");
    card.className = "review-card";

    // Highlight HTML
    let highlightHtml = "";
    if (review.highlight) {
      highlightHtml = `<div class="highlight-badge"><i class="fas fa-thumbs-up" style="margin-right:4px; color:var(--primary-purple)"></i> ${review.highlight}</div>`;
    }

    // Lines HTML
    const linesHtml = review.lines
      .map((line) => `<div class="review-line">${line}</div>`)
      .join("");

    card.innerHTML = `
      <button class="delete-btn" onclick="deleteReview(${review.id})" title="Delete Review">
        <i class="fas fa-trash-alt"></i>
      </button>
      
      <div class="review-header">
          <div class="user-meta">
            <div class="review-avatar">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${review.avatar}" />
            </div>
            <div class="meta-text">
                <h4>${review.name}</h4>
                <div class="date">${review.date}</div>
            </div>
          </div>
          <div class="stars-display">
              ${'<i class="fas fa-star"></i>'.repeat(review.rating)}
              ${'<i class="far fa-star"></i>'.repeat(5 - review.rating)}
          </div>
      </div>
      
      <div class="review-body">
          ${highlightHtml}
          ${linesHtml}
      </div>
    `;
    container.appendChild(card);
  });
}

// --- Interactions ---

function deleteReview(id) {
  if (confirm("Delete this review?")) {
    allReviews = allReviews.filter((r) => r.id !== id);
    saveReviews();
  }
}

function toggleDropdown() {
  document.getElementById("dropdownMenu").classList.toggle("active");
}

// Close dropdown when clicking outside
window.onclick = function (event) {
  if (!event.target.closest(".user-menu-container")) {
    var dropdowns = document.getElementsByClassName("dropdown-menu");
    for (var i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains("active")) {
        openDropdown.classList.remove("active");
      }
    }
  }
};

function toggleReviewForm() {
  const overlay = document.getElementById("reviewFormOverlay");
  overlay.classList.toggle("active");
}

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

function submitReview(e) {
  e.preventDefault();

  if (selectedFormRating === 0) {
    document.getElementById("ratingError").style.display = "block";
    return;
  }

  const name = document.getElementById("inputName").value;
  const highlight = document.getElementById("inputLike").value;
  const reviewText = document.getElementById("inputReview").value;

  const dateObj = new Date();
  const dateString = `${dateObj.getDate()} ${dateObj.toLocaleString("default", { month: "short" })} ${dateObj.getFullYear()}`;

  const newReview = {
    id: Date.now(),
    name: name,
    date: dateString,
    avatar: name.replace(/\s/g, ""),
    rating: selectedFormRating,
    lines: [reviewText],
    highlight: highlight,
  };

  allReviews.unshift(newReview);
  saveReviews();

  e.target.reset();
  selectedFormRating = 0;
  document
    .querySelectorAll("#starRatingInput .star")
    .forEach((s) => s.classList.remove("active"));
  document.getElementById("ratingLabel").innerText = "Select stars";

  toggleReviewForm();
}
