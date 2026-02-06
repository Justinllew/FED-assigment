document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("signup-form");
  const roleSelect = document.getElementById("role-select");

  // Visual tweak
  roleSelect.addEventListener("change", () => {
    if (roleSelect.value !== "") roleSelect.style.color = "#111111";
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const role = roleSelect.value;
    const inputs = form.querySelectorAll("input");
    const name = inputs[0].value.trim();
    const email = inputs[1].value.trim();
    const password = inputs[2].value.trim();

    // 1. Basic Validation (Keep this!)
    if (!role) return alert("Please select a role.");
    if (name.length < 2) return alert("Please enter a valid name.");
    if (password.length < 6) return alert("Password must be at least 6 chars.");

    // 2. CREATE ACCOUNT ON FIREBASE
    try {
      // A. Create the Auth User
      const userCredential = await window.createAccount(
        window.auth,
        email,
        password,
      );
      const user = userCredential.user;
      console.log("User created:", user.uid);

      // B. Save Profile to Database (Vital for knowing their Role!)
      await window.dbSet(window.dbRef(window.db, "users/" + user.uid), {
        name: name,
        email: email,
        role: role, // "vendor" or "patron"
        createdAt: Date.now(),
      });

      // C. Save to LocalStorage (For your Hybrid approach)
      localStorage.setItem("freshEatsUserName", name);
      localStorage.setItem("freshEatsRole", role);

      alert("Account created successfully!");

      // D. Redirect
      if (role === "vendor") {
        window.location.href = "../Login Page - v/vendor_home.html";
      } else {
        window.location.href = "../index.html";
      }
    } catch (error) {
      console.error(error);
      // Handle common errors gracefully
      if (error.code === "auth/email-already-in-use") {
        alert("That email is already registered. Try logging in.");
      } else {
        alert("Error: " + error.message);
      }
    }
  });
});
