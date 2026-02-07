// State Management
function switchTab(tabId) {
  // Hide all views
  const views = ["home", "history", "redeem", "card", "faq"];
  views.forEach((v) => {
    document.getElementById(`view-${v}`).classList.add("hidden");
  });

  // Show selected view
  document.getElementById(`view-${tabId}`).classList.remove("hidden");

  // Update Sidebar Nav
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach((item) => {
    item.classList.remove("active", "text-gray-900", "bg-primary-light");
    item.classList.add("text-gray-600");
  });

  const activeNav = document.getElementById(`nav-${tabId}`);
  if (activeNav) {
    activeNav.classList.add("active", "bg-primary-light", "text-gray-900");
    activeNav.classList.remove("text-gray-600");
  }

  // Update Mobile Nav styling
  const mobileItems = document.querySelectorAll(".nav-mobile-item");
  mobileItems.forEach((item) => {
    item.classList.remove("text-primary");
    item.classList.add("text-gray-400");
  });

  // Highlight active mobile nav item
  const activeMobile = document.querySelector(
    `button[onclick="switchTab('${tabId}')"]`,
  );
  if (activeMobile && window.innerWidth < 768) {
    activeMobile.classList.remove("text-gray-400");
    activeMobile.classList.add("text-primary");
  }

  // Update Title
  const titles = {
    home: "Home",
    history: "History",
    redeem: "Redeem Rewards",
    card: "My Card",
    faq: "Help Center",
  };
  document.getElementById("page-title").innerText = titles[tabId];
}

// FAQ Toggle Logic
function toggleFaq(button) {
  const answer = button.nextElementSibling;
  const icon = button.querySelector(".fa-chevron-down");

  // Close others
  document.querySelectorAll(".faq-answer").forEach((a) => {
    if (a !== answer) {
      a.classList.remove("open");
      a.previousElementSibling.querySelector(
        ".fa-chevron-down",
      ).style.transform = "rotate(0deg)";
    }
  });

  // Toggle current
  answer.classList.toggle("open");
  if (answer.classList.contains("open")) {
    icon.style.transform = "rotate(180deg)";
  } else {
    icon.style.transform = "rotate(0deg)";
  }
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  switchTab("home");
});
