document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.querySelector("form");
  const emailInput = document.querySelector('input[type="email"]');
  const passwordInput = document.querySelector('input[type="password"]');

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) return alert("Please fill in all fields.");

    try {
      // 1. AUTHENTICATE with Firebase
      const userCredential = await window.loginUser(
        window.auth,
        email,
        password,
      );
      const user = userCredential.user;

      // 2. GET USER DETAILS (Name & Role)
      // We look up the 'users/{uid}' path we created during sign up
      const snapshot = await window.dbGet(
        window.dbRef(window.db, "users/" + user.uid),
      );

      if (snapshot.exists()) {
        const userData = snapshot.val();

        // 3. STORE IN LOCAL STORAGE (The "Hybrid" Handshake)
        localStorage.setItem("freshEatsUserName", userData.name);
        localStorage.setItem("freshEatsRole", userData.role);

        alert(`Welcome back, ${userData.name}!`);

        // 4. SMART REDIRECT
        // Even if they log in on the Vendor page, check if they are actually a Vendor!
        if (userData.role === "vendor") {
          window.location.href = "vendor_home.html";
        } else {
          // If a Patron tries to log in here, send them to the main page
          window.location.href = "../index.html";
        }
      } else {
        alert("Error: User profile not found.");
      }
    } catch (error) {
      console.error(error);
      alert("Login Failed: Incorrect email or password.");
    }
  });
});
