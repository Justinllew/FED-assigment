document.addEventListener("DOMContentLoaded", () => {
  // --- Elements ---
  const menuTrigger = document.getElementById("menu-trigger");
  const closeMenuBtn = document.getElementById("close-menu-btn");
  const sidebar = document.getElementById("sidebar-menu");

  const addReviewBtn = document.getElementById("add-review-btn");
  const closeFormBtn = document.getElementById("close-form-btn");
  const submitBtn = document.getElementById("submit-btn");

  const viewList = document.getElementById("view-list");
  const viewForm = document.getElementById("view-form");

  const successToast = document.getElementById("success-toast");

  // Inputs
  const stars = document.querySelectorAll("#stars-container i");
  const tagBtns = document.querySelectorAll(".tag-btn");
  const inputName = document.getElementById("input-name");
  const inputText = document.getElementById("input-text");

  let currentRating = 0;
  let selectedTags = [];

  // --- Sidebar Logic ---
  function toggleMenu(show) {
    if (show) sidebar.classList.add("sidebar-open");
    else sidebar.classList.remove("sidebar-open");
  }
  menuTrigger.addEventListener("click", () => toggleMenu(true));
  closeMenuBtn.addEventListener("click", () => toggleMenu(false));

  // --- View Switching Logic ---
  function toggleForm(show) {
    if (show) {
      viewForm.classList.remove("translate-x-[110%]");
      // Optional: Hide list for performance, or keep it for background feel
      // viewList.classList.add('-translate-x-[20%]', 'opacity-50');
    } else {
      viewForm.classList.add("translate-x-[110%]");
      // viewList.classList.remove('-translate-x-[20%]', 'opacity-50');
      resetForm();
    }
  }

  addReviewBtn.addEventListener("click", () => toggleForm(true));
  closeFormBtn.addEventListener("click", () => toggleForm(false));

  // --- Star Rating Interaction ---
  stars.forEach((star) => {
    star.addEventListener("click", () => {
      const val = parseInt(star.dataset.value);
      currentRating = val;
      updateStars();
    });
  });

  function updateStars() {
    stars.forEach((s) => {
      if (parseInt(s.dataset.value) <= currentRating) {
        s.classList.remove("text-gray-200");
        s.classList.add("text-yellow-400");
      } else {
        s.classList.add("text-gray-200");
        s.classList.remove("text-yellow-400");
      }
    });
  }

  // --- Tag Interaction ---
  tagBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.classList.toggle("tag-selected");
      // Toggle visual classes
      if (btn.classList.contains("tag-selected")) {
        btn.classList.remove("text-gray-400", "border-gray-300");
        btn.classList.add("bg-black", "text-white", "border-black");
      } else {
        btn.classList.add("text-gray-400", "border-gray-300");
        btn.classList.remove("bg-black", "text-white", "border-black");
      }
    });
  });

  function resetForm() {
    inputName.value = "";
    inputText.value = "";
    currentRating = 0;
    updateStars();
    tagBtns.forEach((btn) => {
      btn.classList.remove(
        "tag-selected",
        "bg-black",
        "text-white",
        "border-black",
      );
      btn.classList.add("text-gray-400", "border-gray-300");
    });
  }

  // --- Submit Logic ---
  submitBtn.addEventListener("click", () => {
    const name = inputName.value;
    const review = inputText.value;

    if (!name || !review) {
      alert("Please fill in your name and review.");
      return;
    }

    // 1. Create Card HTML
    const card = document.createElement("div");
    card.className =
      "bg-white rounded-[20px] border border-black p-8 shadow-sm new-review-anim mb-6";

    // Convert newlines to bordered divs
    const lines = review
      .split("\n")
      .map(
        (line) =>
          `<div class="border-b border-gray-300 pb-1 italic font-medium text-gray-600">${line}</div>`,
      )
      .join("");

    const randomAvatar = Math.random().toString(36).substring(7);

    card.innerHTML = `
            <div class="flex items-center gap-4 mb-4">
                <div class="w-12 h-12 rounded-full border border-gray-200 bg-gray-50 p-1">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${randomAvatar}" class="w-full h-full rounded-full" />
                </div>
                <div>
                    <h4 class="text-gray-900 font-bold italic">${name}</h4>
                    <span class="text-gray-400 text-xs font-bold italic">Just Now</span>
                </div>
            </div>
            <div class="pl-16 space-y-2">
                ${lines}
            </div>
        `;

    // 2. Insert at Top
    viewList.insertBefore(card, viewList.firstChild);

    // 3. Close Form
    toggleForm(false);

    // 4. Show Toast
    showToast();
  });

  function showToast() {
    successToast.classList.remove("translate-y-20", "opacity-0");
    setTimeout(() => {
      successToast.classList.add("translate-y-20", "opacity-0");
    }, 3000);
  }
});
