document.addEventListener("DOMContentLoaded", () => {
  // Select the form and inputs
  const loginForm = document.querySelector("form");
  // If you haven't added IDs to your inputs yet, we can select them by type:
  const emailInput = document.querySelector('input[type="email"]');
  const passwordInput = document.querySelector('input[type="password"]');

  loginForm.addEventListener("submit", (e) => {
    // 1. Stop the form from refreshing the page
    e.preventDefault();

    // 2. Get the values
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // --- VALIDATION (School-Friendly Logic) ---

    // Check A: Are they empty?
    if (email === "" || password === "") {
      alert("Please fill in both email and password.");
      return;
    }

    // Check B: Basic Email Structure (Same logic as Signup)
    if (!email.includes("@") || !email.includes(".")) {
      alert("Invalid email format. Must contain '@' and '.'");
      return;
    }

    // --- MOCK LOGIN (The "Fake" Database) ---
    // Since we don't have a real backend yet, we check against a specific string.
    // You can tell your grader: "Use 'vendor@fresh.com' and '123456' to log in."
    //!!! Make sure to link to our firebase Database.

    const validEmail = "vendor@fresh.com";
    const validPassword = "123456";

    if (email === validEmail && password === validPassword) {
      // SUCCESS
      alert("Welcome back, Vendor!");

      // --- NEW: Save the name for the next page ---
      // In a real app, this comes from the database.
      // Here we just hardcode "Jay" or take it from input if available.
      localStorage.setItem("freshEatsUserName", "Jay");

      // --- NEW: Redirect to Vendor Home ---
      // Since we are in the same folder, just use the filename
      window.location.href = "../home-page-vp-jay/vendor-home.html";
    } else {
      // FAILURE
      alert(
        "Wrong email or password.\n(Hint: Try 'vendor@fresh.com' and '123456')",
      );
    }
  });
});
