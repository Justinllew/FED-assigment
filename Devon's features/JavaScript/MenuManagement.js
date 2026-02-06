function toggleStatusMenu(btn) {
  // Close others
  document.querySelectorAll(".status-menu").forEach((m) => {
    if (m !== btn.nextElementSibling) m.classList.remove("active");
  });
  // Toggle current
  const menu = btn.nextElementSibling;
  menu.classList.toggle("active");
}

function updateStatus(option, status) {
  const wrapper = option.closest(".status-wrapper");
  const badge = wrapper.querySelector(".status-badge");
  const text = badge.querySelector(".status-text");

  // Find the price element related to this specific item
  // Note: Adjust the selector '.price-amount' to match your actual HTML class for the price
  const menuCard = option.closest("article");
  const priceElement = menuCard.querySelector(".price");

  // Reset classes
  badge.className = "status-badge";
  badge.classList.add(status);

  // Default values
  if (status === "available") text.innerText = "Available";
  if (status === "sold-out") text.innerText = "Sold Out";

  // Promotion Logic: Apply 10% discount
  if (status === "promotion") {
    text.innerText = "Promotion";

    if (priceElement) {
      // Store the original price if not already stored to allow reverting
      if (!priceElement.dataset.originalPrice) {
        priceElement.dataset.originalPrice = priceElement.innerText.replace(
          "$",
          "",
        );
      }

      const originalPrice = parseFloat(priceElement.dataset.originalPrice);
      const discountedPrice = (originalPrice * 0.8).toFixed(2);
      priceElement.innerText = `$${discountedPrice}`;
    }
  } else {
    // Revert to original price if status is no longer 'promotion'
    if (priceElement && priceElement.dataset.originalPrice) {
      priceElement.innerText = `$${priceElement.dataset.originalPrice}`;
    }
  }

  // Close menu
  wrapper.querySelector(".status-menu").classList.remove("active");
}

// Close when clicking outside
document.addEventListener("click", (e) => {
  if (!e.target.closest(".status-wrapper")) {
    document
      .querySelectorAll(".status-menu")
      .forEach((m) => m.classList.remove("active"));
  }
});

let currentEditingItem = null; // Stores the HTML element we are currently editing

function openEditModal(button) {
  // 1. Identify which row was clicked
  // We look for the closest 'article' tag which holds the item data
  const itemRow = button.closest(".menu-item");
  currentEditingItem = itemRow;

  // 2. Extract current data from the HTML
  // Note: These class names must match your HTML structure
  const currentName = itemRow.querySelector(".item-name").innerText;
  const currentDesc = itemRow.querySelector(".item-desc").innerText;

  // For price, we just want the number, not the logic logic we added before
  const priceSpan = itemRow.querySelector(".price");
  // If we stored original price in dataset (from promotion logic), use that. Otherwise use innerText
  const currentPrice =
    priceSpan.dataset.originalPrice ||
    priceSpan.innerText.replace(/[^0-9.]/g, "");

  // 3. Populate the Modal Inputs
  document.getElementById("editName").value = currentName;
  document.getElementById("editDesc").value = currentDesc;
  document.getElementById("editPrice").value =
    parseFloat(currentPrice).toFixed(2);

  // 4. Show the Modal
  const modal = document.getElementById("editModal");
  modal.style.display = "flex";
}

function saveChanges() {
  if (!currentEditingItem) return;

  // 1. Get values from inputs
  const newName = document.getElementById("editName").value;
  const newDesc = document.getElementById("editDesc").value;
  const newPrice = parseFloat(
    document.getElementById("editPrice").value,
  ).toFixed(2);

  // 2. Update the HTML
  currentEditingItem.querySelector(".item-name").innerText = newName;
  currentEditingItem.querySelector(".item-desc").innerText = newDesc;

  // 3. Update Price & Reset Promotion Data
  // We reset the 'originalPrice' dataset so any future promotions calculate off the NEW price
  const priceSpan = currentEditingItem.querySelector(".price");
  priceSpan.innerText = newPrice;
  priceSpan.dataset.originalPrice = newPrice;

  // 4. Close Modal
  closeModal();
}

function deleteItem() {
  if (currentEditingItem) {
    // Optional: Add a confirmation check
    if (confirm("Are you sure you want to delete this item?")) {
      currentEditingItem.remove(); // Removes the element from the page
      closeModal();
    }
  }
}

let isAddMode = false; // Track if we are adding or editing

// 1. Open Modal for ADDING (Clean Slate)
function openAddModal() {
  isAddMode = true;
  currentEditingItem = null;

  // Reset fields
  document.getElementById("editName").value = "";
  document.getElementById("editDesc").value = "";
  document.getElementById("editPrice").value = "";
  document.getElementById("previewImage").src =
    "https://placehold.co/100x100/e0e0e0/666?text=Upload";

  // Update Title and Button Text
  document.querySelector(".modal-header h3").innerText = "Add New Item";
  document.querySelector(".btn-save").innerText = "Add Item";
  document.querySelector(".btn-delete").style.display = "none"; // Hide delete button for new items

  document.getElementById("editModal").style.display = "flex";
}

// 2. Open Modal for EDITING (Populate Data)
function openEditModal(button) {
  isAddMode = false;
  const itemRow = button.closest(".menu-item");
  currentEditingItem = itemRow;

  // Get current data
  const currentName = itemRow.querySelector(".item-name").innerText;
  const currentDesc = itemRow.querySelector(".item-desc").innerText;
  const currentPrice = itemRow
    .querySelector(".price")
    .innerText.replace(/[^0-9.]/g, "");
  const currentImg = itemRow.querySelector(".item-img").src;

  // Populate fields
  document.getElementById("editName").value = currentName;
  document.getElementById("editDesc").value = currentDesc;
  document.getElementById("editPrice").value =
    parseFloat(currentPrice).toFixed(2);
  document.getElementById("previewImage").src = currentImg;

  // Update UI texts
  document.querySelector(".modal-header h3").innerText = "Edit Menu Item";
  document.querySelector(".btn-save").innerText = "Save Changes";
  document.querySelector(".btn-delete").style.display = "block";

  document.getElementById("editModal").style.display = "flex";
}

// 3. Handle File Preview (Show image immediately)
function previewFile() {
  const preview = document.getElementById("previewImage");
  const file = document.getElementById("itemImageInput").files[0];
  const reader = new FileReader();

  reader.addEventListener(
    "load",
    function () {
      preview.src = reader.result; // Converts image to base64 string
    },
    false,
  );

  if (file) {
    reader.readAsDataURL(file);
  }
}

// 4. Save Changes (Handle both Add and Edit)
function saveChanges() {
  const name = document.getElementById("editName").value;
  const desc = document.getElementById("editDesc").value;
  const price = parseFloat(document.getElementById("editPrice").value).toFixed(
    2,
  );
  const imgSrc = document.getElementById("previewImage").src;

  if (!name || !price) {
    alert("Please enter a name and price");
    return;
  }

  if (isAddMode) {
    // --- CREATE NEW ITEM ---
    const newItemHTML = `
      <img src="${imgSrc}" alt="${name}" class="item-img" />
      <div class="item-info">
        <h3 class="item-name">${name}</h3>
        <p class="item-desc">${desc}</p>
        <span class="item-meta">New Item</span>
      </div>
      <div class="item-actions-col">
        <span class="price">$${price}</span>
        <div class="status-wrapper">
           <button class="status-badge available" onclick="toggleStatusMenu(this)">
             <span class="status-text">Available</span>
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
           </button>
           <div class="status-menu">
             <div class="status-option" onclick="updateStatus(this, 'available')"><span style="color: #68a357">●</span> Available</div>
             <div class="status-option" onclick="updateStatus(this, 'sold-out')"><span style="color: #a35757">●</span> Sold Out</div>
             <div class="status-option" onclick="updateStatus(this, 'promotion')"><span style="color: #d97706">●</span> Promotion</div>
           </div>
        </div>
        <div class="manage-actions">
          <button class="btn-text" onclick="openEditModal(this)">Edit</button>
        </div>
      </div>
    `;

    const article = document.createElement("article");
    article.className = "menu-item";
    article.innerHTML = newItemHTML;

    // Append to the list
    document.querySelector(".menu-list-card").appendChild(article);
  } else {
    // --- UPDATE EXISTING ITEM ---
    if (currentEditingItem) {
      currentEditingItem.querySelector(".item-name").innerText = name;
      currentEditingItem.querySelector(".item-desc").innerText = desc;
      currentEditingItem.querySelector(".item-img").src = imgSrc;

      const priceSpan = currentEditingItem.querySelector(".price");
      priceSpan.innerText = price;
      priceSpan.dataset.originalPrice = price; // Update base price for promotions
    }
  }

  closeModal();
}

// Keep your existing closeModal, deleteItem, toggleStatusMenu, etc.

function closeModal() {
  const modal = document.getElementById("editModal");
  modal.style.display = "none";
  currentEditingItem = null;
}

// Close modal if user clicks outside the white box
window.onclick = function (event) {
  const modal = document.getElementById("editModal");
  if (event.target === modal) {
    closeModal();
  }
};
