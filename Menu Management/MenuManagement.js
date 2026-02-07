// ==========================================
// 1. IMPORTS & CONFIGURATION
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyA8zDkXrfnzEE6OpvEAATqNliz9FBYxOPo",
  authDomain: "hawkerbase-fedasg.firebaseapp.com",
  projectId: "hawkerbase-fedasg",
  storageBucket: "hawkerbase-fedasg.firebasestorage.app",
  messagingSenderId: "216203478131",
  appId: "1:216203478131:web:39072e8b25296b8ede9606",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ==========================================
// 2. GLOBAL STATE
// ==========================================
let currentUserUid = null; // Stores the logged-in vendor's ID
let isAddMode = false; // Tracks if we are Adding or Editing
let currentEditingItem = null; // Tracks which HTML row is being edited

// ==========================================
// 3. AUTHENTICATION FLOW (The Logic Start)
// ==========================================
// This listener triggers automatically when the page loads
onAuthStateChanged(auth, (user) => {
  const banner = document.querySelector(".store-name-heading");
  const container = document.querySelector(".menu-list-card");

  if (user) {
    // ✅ User is logged in
    currentUserUid = user.uid;
    console.log("Vendor Logged In:", currentUserUid);

    const storedName = localStorage.getItem("freshEatsUserName") || "Vendor";

    const sidebarName = document.getElementById("sidebar-name");
    const sidebarAvatar = document.getElementById("sidebar-avatar");

    if (sidebarName) sidebarName.textContent = storedName;
    if (sidebarAvatar)
      sidebarAvatar.textContent = storedName.charAt(0).toUpperCase();

    // Optional: Update UI to show we are online
    if (banner) banner.innerText = "FreshEats (Online)";

    // TRIGGER DATA LOADING
    loadMenuFromFirebase();
  } else {
    // ❌ User is logged out
    currentUserUid = null;
    console.log("No user logged in");

    container.innerHTML = `
            <div style="text-align:center; padding: 2rem;">
                <h3>Please Log In</h3>
                <p>You must be signed in to manage your menu.</p>
                <a href="../Vendor-home/vendor-home.html" style="color:green; text-decoration:underline;">Go to Login</a>
            </div>
        `;
  }
});

// ==========================================
// 4. CORE FIREBASE FUNCTIONS
// ==========================================

/**
 * READ: Fetches menu items from vendors/{uid}/menu_items
 */
async function loadMenuFromFirebase() {
  if (!currentUserUid) return;

  const container = document.querySelector(".menu-list-card");
  container.innerHTML = "<p style='padding:1rem'>Loading menu items...</p>";

  try {
    // Point to the SPECIFIC vendor's collection
    const menuRef = collection(db, "vendors", currentUserUid, "menu_items");
    const querySnapshot = await getDocs(menuRef);

    container.innerHTML = ""; // Clear loading message

    if (querySnapshot.empty) {
      container.innerHTML =
        "<p style='padding:1rem'>No items found. Click '+' to add one.</p>";
      return;
    }

    querySnapshot.forEach((docSnap) => {
      renderMenuItem(docSnap.id, docSnap.data());
    });
  } catch (error) {
    console.error("Error loading menu:", error);
    container.innerHTML = "<p style='color:red'>Error loading data.</p>";
  }
}

/**
 * CREATE & UPDATE: Handles saving data to Firebase
 */
async function saveChanges() {
  if (!currentUserUid) {
    alert("Please log in first.");
    return;
  }

  // 1. Capture inputs
  const name = document.getElementById("editName").value;
  const desc = document.getElementById("editDesc").value;
  const price = document.getElementById("editPrice").value;
  const imgSrc = document.getElementById("previewImage").src;

  if (!name || !price) {
    alert("Name and Price are required.");
    return;
  }

  // 2. UI Feedback (Disable button)
  const saveBtn = document.querySelector(".btn-save");
  const originalText = saveBtn.innerText;
  saveBtn.innerText = "Saving...";
  saveBtn.disabled = true;

  try {
    const menuRef = collection(db, "vendors", currentUserUid, "menu_items");

    if (isAddMode) {
      // --- CREATE MODE ---
      await addDoc(menuRef, {
        name: name,
        desc: desc,
        price: parseFloat(price),
        imgSrc: imgSrc, // Note: In a real app, upload image to Storage first
        status: "available",
        createdAt: new Date(),
      });
    } else {
      // --- EDIT MODE ---
      const docId = currentEditingItem.getAttribute("data-id");
      const itemRef = doc(db, "vendors", currentUserUid, "menu_items", docId);

      await updateDoc(itemRef, {
        name: name,
        desc: desc,
        price: parseFloat(price),
        imgSrc: imgSrc,
      });
    }

    // 3. Refresh and Close
    await loadMenuFromFirebase();
    closeModal();
  } catch (error) {
    console.error("Error saving:", error);
    alert("Failed to save changes.");
  } finally {
    saveBtn.innerText = originalText;
    saveBtn.disabled = false;
  }
}

/**
 * DELETE: Removes item from Firebase
 */
async function deleteItem() {
  if (!currentUserUid || !currentEditingItem) return;

  if (!confirm("Are you sure you want to delete this item?")) return;

  const docId = currentEditingItem.getAttribute("data-id");

  try {
    const itemRef = doc(db, "vendors", currentUserUid, "menu_items", docId);
    await deleteDoc(itemRef);

    // Remove from UI immediately without reloading everything
    currentEditingItem.remove();
    closeModal();
  } catch (error) {
    console.error("Error deleting:", error);
    alert("Could not delete item.");
  }
}

// ==========================================
// 5. UI HELPER FUNCTIONS
// ==========================================

function renderMenuItem(docId, data) {
  console.log(`Rendering Item: ${data.name}`);
  console.log(`Status from DB: "${data.status}"`);
  const container = document.querySelector(".menu-list-card");

  const article = document.createElement("article");
  article.className = "menu-item"; // Changed from 'menu-item-row' to match CSS 'menu-item'
  article.setAttribute("data-id", docId);

  // Fallback for missing image
  const image =
    data.imgSrc && data.imgSrc.length > 20
      ? data.imgSrc
      : "https://placehold.co/100";

  // Determine Status Styling
  let statusLabel = "Available";
  let statusClass = "available";
  let originalPrice = Number(data.price);
  let discountedPrice = originalPrice;
  let priceHTML = `<div class="price">$${originalPrice.toFixed(2)}</div>`;

  if (data.status === "sold_out") {
    statusLabel = "Sold Out";
    statusClass = "sold-out";
  } else if (data.status === "promotion") {
    statusLabel = "Promotion";
    statusClass = "promotion";

    discountedPrice = originalPrice * 0.8;
    priceHTML = `
            <div class="price">
                $${originalPrice.toFixed(2)}
                <div style="font-size: 0.75rem; color: #15803d; font-weight: 500; margin-top:2px;">
                    Selling: $${discountedPrice.toFixed(2)}
                </div>
            </div>
        `;
  }

  // Generate HTML (Added the Status Wrapper section)
  article.innerHTML = `
        <img src="${image}" alt="${data.name}" class="item-img">
        <div class="item-info">
            <h4 class="item-name">${data.name}</h4>
            <p class="item-desc">${data.desc || "No description"}</p>
        </div>
        <div class="item-actions-col">
            ${priceHTML}
            <div class="status-wrapper">
                <div class="status-badge ${statusClass}">
                    ${statusLabel} ▾
                </div>
                <div class="status-menu">
                    <div class="status-option" data-val="available"><span class="status-dot" style="background:#22c55e"></span> Available</div>
                    <div class="status-option" data-val="sold_out"><span class="status-dot" style="background:#ef4444"></span> Sold Out</div>
                    <div class="status-option" data-val="promotion"><span class="status-dot" style="background:#eab308"></span> Promotion</div>
                </div>
            </div>
            <button class="btn-text edit-btn">Edit Item</button>
        </div>`;

  // --- EVENT LISTENERS ---

  // 1. Edit Button
  article
    .querySelector(".edit-btn")
    .addEventListener("click", () => openEditModal(article, data));

  // 2. Status Badge Click (Toggle Dropdown)
  const badge = article.querySelector(".status-badge");
  const menu = article.querySelector(".status-menu");

  badge.addEventListener("click", (e) => {
    e.stopPropagation(); // Prevent closing immediately
    // Close all other open menus first
    document.querySelectorAll(".status-menu.active").forEach((m) => {
      if (m !== menu) m.classList.remove("active");
    });
    menu.classList.toggle("active");
  });

  // 3. Status Option Click (Update Firebase)
  article.querySelectorAll(".status-option").forEach((option) => {
    option.addEventListener("click", () => {
      const newStatus = option.getAttribute("data-val");
      updateItemStatus(docId, newStatus);
    });
  });

  container.appendChild(article);
}

// Global Click Listener to close dropdowns when clicking outside
document.addEventListener("click", () => {
  document.querySelectorAll(".status-menu.active").forEach((menu) => {
    menu.classList.remove("active");
  });
});

// --- MODAL CONTROLS ---

function openAddModal() {
  // ... your existing openAddModal logic ...
  console.log("Open Modal Clicked!"); // Add this to test
  isAddMode = true;
  currentEditingItem = null;

  // Reset Form
  document.querySelector(".modal-header h3").innerText = "Add New Item";
  document.getElementById("editName").value = "";
  document.getElementById("editDesc").value = "";
  document.getElementById("editPrice").value = "";

  // Show Modal
  document.getElementById("editModal").classList.add("active");
}

function openEditModal(rowElement, data) {
  isAddMode = false;
  currentEditingItem = rowElement;

  // Populate Form
  document.querySelector(".modal-header h3").innerText = "Edit Menu Item";
  document.getElementById("editName").value = data.name;
  document.getElementById("editDesc").value = data.desc;
  document.getElementById("editPrice").value = data.price;
  document.getElementById("previewImage").src =
    data.imgSrc || "https://placehold.co/100";

  // Show Delete Button in Edit Mode
  document.querySelector(".btn-delete").style.display = "block";

  document.getElementById("editModal").classList.add("active");
}

function closeModal() {
  document.getElementById("editModal").classList.remove("active");
}

function previewFile() {
  const file = document.getElementById("itemImageInput").files[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = function () {
      document.getElementById("previewImage").src = reader.result;
    };
    reader.readAsDataURL(file);
  }
}

function toggleSidebar() {
  document.querySelector(".app-container").classList.toggle("collapsed");
}

/**
 * UPDATE STATUS: Updates just the status field
 */
async function updateItemStatus(docId, newStatus) {
  if (!currentUserUid) return;

  try {
    const itemRef = doc(db, "vendors", currentUserUid, "menu_items", docId);
    await updateDoc(itemRef, {
      status: newStatus,
    });

    // Reload to show changes
    loadMenuFromFirebase();
  } catch (error) {
    console.error("Error updating status:", error);
    alert("Failed to update status");
  }
}

// ==========================================
// 6. EXPOSE FUNCTIONS TO WINDOW
// ==========================================
// Because your HTML uses onclick="saveChanges()", and this is a Module,
// we must explicitly attach these functions to the global window object.

window.openAddModal = openAddModal;
window.saveChanges = saveChanges;
window.deleteItem = deleteItem;
window.openAddModal = openAddModal;
window.closeModal = closeModal;
window.previewFile = previewFile;
window.toggleSidebar = toggleSidebar;
