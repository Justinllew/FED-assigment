document.addEventListener("DOMContentLoaded", () => {
  // 1. SELECT ELEMENTS
  const statusBoxes = document.querySelectorAll(
    '.status-box, [class^="Rectangle 12"], [class^="Rectangle 13"]',
  );
  const statusTextContainer =
    document.querySelector(".live-status") ||
    document.querySelector("div:has(> .dot)");
  const orderIdElement = document.querySelector("h1");

  // 2. STATUS CONFIGURATION
  const statusDetails = {
    1: {
      text: "Order made",
      color: "#5E9D4B",
      subtext: "We have received your order.",
    },
    2: {
      text: "Order Paid",
      color: "#5E9D4B",
      subtext: "Payment confirmed. Preparing items.",
    },
    3: {
      text: "With courier en route",
      color: "#5E9D4B",
      subtext: "Driver is 5 minutes away.",
    },
    4: {
      text: "Order Completed",
      color: "#5E9D4B",
      subtext: "Enjoy your meal!",
    },
  };

  // 3. INTERACTIVE FUNCTION: Update Status
  function updateStatus(stepIndex) {
    statusBoxes.forEach((box, i) => {
      // Apply styles directly to the HTML elements found
      if (i === stepIndex - 1) {
        box.style.backgroundColor = "#5E9D4B";
        box.style.transition = "all 0.4s ease";
        box.style.transform = "scale(1.02)";
        box.style.boxShadow = "0px 4px 10px rgba(0,0,0,0.1)";
      } else if (i < stepIndex - 1) {
        // Past steps
        box.style.backgroundColor = "#C7E5B5";
        box.style.opacity = "0.8";
        box.style.transform = "scale(1)";
      } else {
        // Future steps
        box.style.backgroundColor = "#FFFFFF";
        box.style.opacity = "1";
        box.style.transform = "scale(1)";
      }
    });

    // Update the text dynamically if the element exists
    if (statusTextContainer) {
      statusTextContainer.innerHTML = `<span style="display:inline-block; width:10px; height:10px; background:#5E9D4B; border-radius:50%; margin-right:10px; animation: pulse 1.5s infinite;"></span> ${statusDetails[stepIndex].text}`;
    }
  }

  // 4. ADD CLICK INTERACTION
  // This makes your static boxes "clickable" buttons to test the flow
  statusBoxes.forEach((box, index) => {
    box.style.cursor = "pointer";
    box.addEventListener("click", () => {
      updateStatus(index + 1);
      console.log(`Switched to status: ${index + 1}`);
    });

    // Add Hover Effect
    box.addEventListener("mouseenter", () => {
      if (!box.style.backgroundColor.includes("rgb(94, 157, 75)")) {
        box.style.border = "2px solid #5E9D4B";
      }
    });
    box.addEventListener("mouseleave", () => {
      box.style.border = "1px solid #6F6F6F";
    });
  });

  // 5. ANIMATION KEYFRAMES (Injecting a CSS animation via JS)
  const style = document.createElement("style");
  style.innerHTML = `
        @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.5); opacity: 0.5; }
            100% { transform: scale(1); opacity: 1; }
        }
    `;
  document.head.appendChild(style);

  // 6. INITIALIZE
  // Start at Step 3 (Shipped) as per your design
  updateStatus(3);

  // 7. BONUS: Copy Order ID to Clipboard on Click
  if (orderIdElement) {
    orderIdElement.style.cursor = "copy";
    orderIdElement.addEventListener("click", () => {
      const id = orderIdElement.innerText.split(": ")[1];
      navigator.clipboard.writeText(id);
      alert("Order ID copied to clipboard: " + id);
    });
  }
});
