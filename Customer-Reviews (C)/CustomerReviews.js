// ==========================================
// 1. IMPORTS
// ==========================================
import { db } from "../firebase.js"; // This now works because firebase.js uses URLs
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ==========================================
// 2. CONFIGURATION
// ==========================================
const VENDOR_ID = "vendor_101";

// State
let allReviews = [];
let currentFilter = "recent";
let selectedFormRating = 0;

const CURRENT_USER_ID =
  localStorage.getItem("userId") || `user_${Math.floor(Math.random() * 10000)}`;
localStorage.setItem("userId", CURRENT_USER_ID);

document.addEventListener("DOMContentLoaded", () => {
  fetchReviews();
  initStarRating();
});

// ==========================================
// 3. DATA FETCHING (Real-Time!)
// ==========================================
function fetchReviews() {
  const reviewsRef = collection(db, "vendors", VENDOR_ID, "reviews");

  // onSnapshot = REAL TIME LISTENER
  // Whenever the database changes, this function runs automatically!
  onSnapshot(
    reviewsRef,
    (snapshot) => {
      allReviews = [];
      snapshot.forEach((doc) => {
        allReviews.push({ id: doc.id, ...doc.data() });
      });
      renderReviews();
    },
    (error) => {
      console.error("Error:", error);
      const list = document.getElementById("reviewsList");
      if (list)
        list.innerHTML = `<p style="text-align:center; color:red">Error loading reviews.</p>`;
    },
  );
}

// ==========================================
// 4. SUBMIT REVIEW
// ==========================================
async function submitReview(e) {
  if (e) e.preventDefault();

  if (selectedFormRating === 0) {
    document.getElementById("ratingError").style.display = "block";
    return;
  }

  const name = document.getElementById("inputName").value;
  const highlight = document.getElementById("inputLike").value;
  const reviewText = document.getElementById("inputReview").value;
  const stallName = document.getElementById("inputStall").value;

  const payload = {
    customerId: CURRENT_USER_ID,
    customerName: name,
    rating: selectedFormRating,
    comment: reviewText,
    highlight: highlight || "",
    stallName: stallName,
    date: new Date().toISOString(),
    timestamp: serverTimestamp(),
  };

  try {
    // This writes to the database immediately
    await addDoc(collection(db, "vendors", VENDOR_ID, "reviews"), payload);

    alert("Review Submitted!");
    document.querySelector("form").reset();
    selectedFormRating = 0;
    resetStarVisuals();
    toggleReviewForm();
    // No need to reload! onSnapshot will see the new data and update the screen.
  } catch (error) {
    console.error("Error submitting:", error);
    alert("Failed to submit review. See console for details.");
  }
}

// ==========================================
// 5. FILTERING & RENDERING
// ==========================================
function switchFilter(filterType) {
  currentFilter = filterType;

  // Update Buttons
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.remove("active");
    if (btn.getAttribute("onclick").includes(filterType)) {
      btn.classList.add("active");
    }
  });

  renderReviews();
}

function renderReviews() {
  const container = document.getElementById("reviewsList");
  if (!container) return;
  container.innerHTML = "";

  if (allReviews.length === 0) {
    container.innerHTML = `<p style="text-align:center; padding:20px;">No reviews yet. Be the first!</p>`;
    return;
  }

  // Local Sorting (Instant)
  let sorted = [...allReviews];
  if (currentFilter === "recent") {
    sorted.sort((a, b) => {
      const timeA = a.timestamp?.seconds
        ? a.timestamp.seconds
        : new Date(a.date).getTime() / 1000;
      const timeB = b.timestamp?.seconds
        ? b.timestamp.seconds
        : new Date(b.date).getTime() / 1000;
      return timeB - timeA;
    });
  } else if (currentFilter === "highest") {
    sorted.sort((a, b) => b.rating - a.rating);
  } else if (currentFilter === "lowest") {
    sorted.sort((a, b) => a.rating - b.rating);
  }

  sorted.forEach((review) => {
    let stars = "";
    for (let i = 1; i <= 5; i++) {
      stars +=
        i <= review.rating
          ? '<i class="fas fa-star"></i>'
          : '<i class="far fa-star"></i>';
    }

    const html = `
      <div class="review-card">
        <div class="review-header">
           <div class="user-meta">
              <h4>${review.customerName || "Customer"}</h4>
              <div style="font-size:0.8em; color:#666">${new Date(review.date).toLocaleDateString()}</div>
           </div>
           <div class="stars-display" style="color:#fbbf24;">${stars}</div>
        </div>
        ${review.highlight ? `<div class="highlight-badge" style="background:#e0f2fe; color:#0369a1; padding:4px 8px; border-radius:4px; display:inline-block; margin:5px 0; font-size:0.85em;"><i class="fas fa-thumbs-up"></i> ${review.highlight}</div>` : ""}
        <p style="margin-top:10px; color:#444;">${review.comment}</p>
      </div>
    `;
    container.innerHTML += html;
  });
}

// ==========================================
// 6. UI HELPERS
// ==========================================
function initStarRating() {
  const stars = document.querySelectorAll("#starRatingInput i");
  const label = document.getElementById("ratingLabel");

  if (!stars.length) return;

  stars.forEach((star, index) => {
    star.style.cursor = "pointer";
    star.onclick = () => {
      selectedFormRating = index + 1;
      updateStars(selectedFormRating);
      if (label)
        label.innerText = ["Poor", "Fair", "Good", "Very Good", "Excellent"][
          index
        ];
      document.getElementById("ratingError").style.display = "none";
    };
  });
}

function updateStars(count) {
  const stars = document.querySelectorAll("#starRatingInput i");
  stars.forEach((s, i) => {
    if (i < count) {
      s.classList.remove("far");
      s.classList.add("fas");
      s.style.color = "#fbbf24";
    } else {
      s.classList.remove("fas");
      s.classList.add("far");
      s.style.color = "#ccc";
    }
  });
}

function resetStarVisuals() {
  updateStars(0);
  const label = document.getElementById("ratingLabel");
  if (label) label.innerText = "Select a rating";
}

window.toggleReviewForm = function () {
  const overlay = document.getElementById("reviewFormOverlay");
  if (overlay) overlay.classList.toggle("active");
};

window.toggleSidebar = function () {
  const sidebar = document.querySelector(".sidebar");
  if (sidebar) sidebar.classList.toggle("collapsed"); // Check if your CSS uses 'collapsed' or 'open'
};

// ==========================================
// 7. EXPOSE TO HTML (Making it Clickable!)
// ==========================================
window.submitReview = submitReview;
window.switchFilter = switchFilter;
