document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("signup-form");
  const roleSelect = document.getElementById("role-select");

  // Visual: Change text color to black once a selection is made
  roleSelect.addEventListener("change", () => {
    if (roleSelect.value !== "") {
      roleSelect.style.color = "#111111";
    }
  });

  form.addEventListener("submit", (e) => {
    // 1. STOP the form from submitting automatically
    e.preventDefault();

    // 2. GET the values
    const role = roleSelect.value;
    const inputs = form.querySelectorAll("input");
    const name = inputs[0].value.trim(); // .trim() removes spaces at start/end
    const email = inputs[1].value.trim();
    const password = inputs[2].value.trim();

    // --- VALIDATION CHECKS (The Safety Gates) ---

    // Check 1: Is a role selected?
    if (!role) {
      alert("Please select a role: Vendor or Patron.");
      return; // STOP HERE! Do not continue.
    }

    // Check 2: Is the name too short?
    if (name.length < 2) {
      alert("Please enter a valid name (at least 2 characters).");
      return; // STOP HERE!
    }

    // Check 3: Is the email valid? (Basic check for @ symbol)
    if (!email.includes("@") || !email.includes(".")) {
      alert("Email must contain an '@' and a dot (.).");
      return;
    }

    // Rule C: The '@' cannot be the first letter (e.g. "@gmail.com" is wrong)
    if (email.indexOf("@") === 0) {
      alert("Invalid email: User name is missing before the '@'.");
      return;
    }

    // Rule D: The '.' must come AFTER the '@' (e.g. "jay@gmail" is wrong, "jay@gmail.com" is right)
    // We look for the LAST dot to be safe
    const atPosition = email.indexOf("@");
    const dotPosition = email.lastIndexOf(".");

    if (dotPosition < atPosition + 2) {
      // We add +2 to ensure there is at least one letter between @ and . (like @g.c)
      alert("Invalid email: The domain seems incomplete.");
      return;
    }

    // Rule E: There must be letters after the last dot (e.g. "jay@gmail." is wrong)
    if (dotPosition === email.length - 1) {
      alert("Invalid email: Domain cannot end with a dot.");
      return;
    }

    // Check 4: Is the password too short? (Security check)
    if (password.length < 6) {
      alert("Password must be at least 6 characters long.");
      return; // STOP HERE!
    }

    // --- SUCCESS! ---
    // If code reaches here, all checks passed.

    console.log("Account created:", { role, name, email });
    alert("Account created successfully!");

    // --- NEW: Save the real name the user typed! ---
    localStorage.setItem("freshEatsUserName", name);

    // Redirect logic
    if (role === "vendor") {
      // GO TO VENDOR HOME
      // We need to go UP (../) out of signup folder, then DOWN into Login folder
      window.location.href = "../home-page-vp-jay/vendor-home.html";
    } else {
      // GO TO PATRON HOME (Index)
      // We need to go UP (../) to the main folder
      window.location.href = "../home-page-vp-jay/patron-home.html";
    }
  });
});
