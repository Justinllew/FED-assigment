document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("nea-login-form");

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault(); // Stop page reload

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    // 1. Basic Validation
    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    // 2. Email Format Check
    if (!email.includes("@") || !email.includes(".")) {
      alert("Please enter a valid government email address.");
      return;
    }

    // 3. Mock Authentication (The "Backdoor")
    // You can tell your grader these are the credentials
    const validEmail = "inspector@nea.gov.sg";
    const validPassword = "admin";

    if (email === validEmail && password === validPassword) {
      alert("Login Successful. Accessing NEA Database...");

      // 4. Redirect to the Eugene's NEA Feature
      // Based on your file structure provided earlier:
      // "NEA Inspection Features/dashboardInspect.html"

      // NOTE: Adjust the '../' depending on where this file is saved.
      // If this file is in "Login Page - v", we need to go up two levels
      window.location.href =
        "../../NEA Inspection Features/dashboardInspect.html";
    } else {
      alert("Access Denied.\nInvalid credentials for NEA Portal.");
    }
  });
});
