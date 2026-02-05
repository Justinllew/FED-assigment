/**
 * Toggles between 'Active Orders' and 'Order History' views.
 * @param {string} viewName - The name of the view to display ('active' or 'history')
 */
function toggleView(viewName) {
  const activeList = document.getElementById("active-list");
  const historyList = document.getElementById("history-list");
  const activeBtn = document.getElementById("btn-active");
  const historyBtn = document.getElementById("btn-history");

  // Toggle Button Classes
  if (viewName === "active") {
    activeBtn.classList.add("active");
    historyBtn.classList.remove("active");

    activeList.classList.remove("hidden");
    historyList.classList.add("hidden");
  } else {
    historyBtn.classList.add("active");
    activeBtn.classList.remove("active");

    historyList.classList.remove("hidden");
    activeList.classList.add("hidden");
  }
}
