document.addEventListener("DOMContentLoaded", () => {
  // 1. Inject Experimental Styles for Animations
  // We inject this via JS so you can keep your CSS file clean during testing
  const style = document.createElement("style");
  style.innerHTML = `
        /* Ripple Effect Styles */
        .role-btn {
            position: relative;
            overflow: hidden;
        }
        
        span.ripple {
            position: absolute;
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 600ms linear;
            background-color: rgba(255, 255, 255, 0.4);
        }

        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }

        /* Page Transition Styles */
        .fade-out {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.5s ease, transform 0.5s ease;
        }
        
        .fade-out-fast {
            opacity: 0;
            transition: opacity 0.3s ease;
        }
    `;
  document.head.appendChild(style);

  // 2. Select Elements
  const buttons = document.querySelectorAll(".role-btn");
  const container = document.querySelector(".right-panel");
  const brandBlock = document.querySelector(".brand-block");

  // 3. Attach Logic to Buttons
  buttons.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      // A. Create Ripple Effect
      createRipple(e, this);

      // B. Determine Role
      // We use textContent to get "Vendor" or "Patron" ignoring the SVG
      const role = this.textContent.trim();
      console.log(`Role Selected: ${role}`);

      // C. Trigger Transition & Redirect Simulation
      handleSelection(role);
    });
  });

  // Helper: Ripple Effect Logic
  function createRipple(event, button) {
    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    const rect = button.getBoundingClientRect();

    // Calculate click position relative to the button
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - rect.left - radius}px`;
    circle.style.top = `${event.clientY - rect.top - radius}px`;
    circle.classList.add("ripple");

    // Remove the ripple element after animation finishes to prevent DOM clutter
    const ripple = button.getElementsByClassName("ripple")[0];
    if (ripple) {
      ripple.remove();
    }

    button.appendChild(circle);
  }

  // Helper: Handle Page Transition
  function handleSelection(role) {
    // Disable buttons to prevent double clicking
    buttons.forEach((b) => (b.style.pointerEvents = "none"));

    // Staggered fade out effect
    container.classList.add("fade-out");

    setTimeout(() => {
      brandBlock.classList.add("fade-out-fast");
    }, 200);

    // Simulate Navigation after animation
    setTimeout(() => {
      // logic to save role for the next page
      localStorage.setItem("currentUserRole", role);

      // Redirect based on role
      if (role === "Vendor") {
        // window.location.href = 'vendor-dashboard.html';
        alert("Redirecting to Vendor Dashboard...");
      } else {
        // window.location.href = 'patron-home.html';
        alert("Redirecting to Patron Home...");
      }
    }, 800);
  }
});
