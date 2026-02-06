document.addEventListener("DOMContentLoaded", () => {
  // 1. Retrieve the name stored during Login/Signup
  // (We will save this in the other files next!)
  const savedName = localStorage.getItem("freshEatsUserName");

  // 2. Update the HTML elements with the name
  if (savedName) {
    document.getElementById("display-name").textContent = savedName;
    document.getElementById("hero-name").textContent = savedName;
  }

  // 3. Dropdown Logic
  const userMenuBtn = document.getElementById("userMenuBtn");
  const userDropdown = document.getElementById("userDropdown");

  userMenuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    userDropdown.classList.toggle("show");
  });

  document.addEventListener("click", (e) => {
    if (!userMenuBtn.contains(e.target) && !userDropdown.contains(e.target)) {
      userDropdown.classList.remove("show");
    }
  });
});
