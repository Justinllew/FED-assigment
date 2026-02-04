document.addEventListener("DOMContentLoaded", () => {
  const starContainer = document.getElementById("starInput");
  const stars = starContainer.querySelectorAll("span");
  let selectedRating = 0;

  // Star Selection Logic
  stars.forEach((star) => {
    star.addEventListener("click", () => {
      selectedRating = star.getAttribute("data-value");

      // Update UI
      stars.forEach((s) => s.classList.remove("active"));
      star.classList.add("active");
      console.log(`User rated: ${selectedRating} stars`);
    });
  });

  // Form Submission Logic
  const reviewForm = document.getElementById("reviewForm");
  reviewForm.addEventListener("submit", (e) => {
    e.preventDefault(); // Stop page reload

    const reviewData = {
      user: document.getElementById("userName").value,
      stall: document.getElementById("stallName").value,
      rating: selectedRating,
      comment: document.getElementById("comment").value,
      date: new Date().toLocaleDateString(),
    };

    if (selectedRating === 0) {
      alert("Please select a star rating!");
      return;
    }

    console.log("Saving Review to Database...", reviewData);
    alert(
      `Thank you, ${reviewData.user}! Your review for ${reviewData.stall} has been submitted.`,
    );

    reviewForm.reset();
    stars.forEach((s) => s.classList.remove("active"));
  });
});
