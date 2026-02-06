document.addEventListener("DOMContentLoaded", () => {
  // 1. Retrieve the name stored from Jay's Login Page
  const savedName = localStorage.getItem("freshEatsUserName");

  // 2. Update the HTML elements with the name
  if (savedName) {
    // Update Sidebar Name
    const sidebarNameElement = document.getElementById("sidebar-name");
    if (sidebarNameElement) {
      sidebarNameElement.textContent = savedName;
    }

    // Update Sidebar Avatar (First letter)
    const sidebarAvatarElement = document.getElementById("sidebar-avatar");
    if (sidebarAvatarElement) {
      sidebarAvatarElement.textContent = savedName.charAt(0).toUpperCase();
    }

    // Update Header Avatar (First letter)
    const headerAvatarElement = document.getElementById("header-avatar");
    if (headerAvatarElement) {
      headerAvatarElement.textContent = savedName.charAt(0).toUpperCase();
    }
  }
});
