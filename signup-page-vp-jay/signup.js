document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("signup-form");
  const roleSelect = document.getElementById("role-select");

  // Handle Dropdown Color Change
  // This makes the text look like a "placeholder" (grey) until a selection is made
  roleSelect.addEventListener("change", () => {
    if (roleSelect.value !== "") {
      roleSelect.style.color = "#333"; // Active color
    }
  });

  // Handle Form Submission
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // 1. Get Values
    const role = roleSelect.value;
    const inputs = form.querySelectorAll("input");
    const name = inputs[0].value;
    const email = inputs[1].value;
    const password = inputs[2].value;

    // 2. Simple Validation (Role is required)
    if (!role) {
      alert("Please select a role (Vendor or Patron).");
      return;
    }

    // 3. Simulate Signup
    console.log("Creating account:", { role, name, email, password });

    alert(`Account created successfully!\n\nRole: ${role}\nName: ${name}`);

    // 4. Redirect based on role (Example logic)
    if (role === "vendor") {
      window.location.href = "vendor_login.html"; // Or vendor_dashboard
    } else {
      window.location.href = "index.html"; // Or patron home
    }
  });
});
