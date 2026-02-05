let currentTab = "new";

function switchTab(event, tabName) {
  currentTab = tabName;

  // Update Tabs UI
  document
    .querySelectorAll(".tab-btn")
    .forEach((btn) => btn.classList.remove("active"));

  // Use event.currentTarget to ensure we get the button
  if (event) {
    event.currentTarget.classList.add("active");
  }

  // Filter Cards
  const cards = document.querySelectorAll(".order-card");
  cards.forEach((card) => {
    if (card.dataset.status === tabName) {
      card.classList.remove("hidden");
    } else {
      card.classList.add("hidden");
    }
  });
}

function moveOrder(orderId, newStatus) {
  const card = document.getElementById(orderId);
  card.dataset.status = newStatus;

  // Update Button Logic dynamically
  const actionBtn =
    card.querySelector(".btn-primary") || card.querySelector(".btn-success");

  const badge = card.querySelector(".order-timer");

  if (newStatus === "cooking") {
    actionBtn.className = "btn btn-success";
    actionBtn.innerText = "Mark Completed";
    actionBtn.onclick = function () {
      moveOrder(orderId, "completed");
    };

    // Update Timer Badge using CSS classes
    badge.className = "order-timer status-cooking";
    badge.innerText = "Cooking...";
  } else if (newStatus === "completed") {
    // Hide action button and update status
    actionBtn.style.display = "none";
    badge.className = "order-timer status-completed";
    badge.innerText = "Ready for Pickup";
  }

  // Refresh View to hide the card from current tab
  // We pass null for the event because we don't need to re-highlight the tab
  switchTab(null, currentTab);
  updateCounts();
}

function updateCounts() {
  const statuses = ["new", "cooking", "completed"];
  statuses.forEach((status) => {
    const count = document.querySelectorAll(
      `.order-card[data-status="${status}"]`,
    ).length;
    document.getElementById(`count-${status}`).innerText = count;
  });
}

// Initial count update on load
updateCounts();
