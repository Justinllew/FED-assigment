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
                <a href="/login-page-vp-jay/role_selection.html" style="color:green; text-decoration:underline;">Go to Login</a>
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
  const container = document.querySelector(".menu-list-card");

  const article = document.createElement("article");
  article.className = "menu-item-row";
  article.setAttribute("data-id", docId);

  // Fallback for missing image
  const image =
    data.imgSrc && data.imgSrc.length > 20
      ? data.imgSrc
      : "https://placehold.co/100";

  article.innerHTML = `
        <div class="item-info">
            <img src="${image}" alt="${data.name}" class="item-thumb">
            <div>
                <h4 class="item-name">${data.name}</h4>
                <p class="item-desc">${data.desc || "No description"}</p>
                <span class="item-price">$${Number(data.price).toFixed(2)}</span>
            </div>
        </div>
        <div class="item-actions">
            <button class="icon-btn edit-btn" title="Edit">
                ✏️
            </button>
        </div>
    `;

  // Attach Edit Listener directly to the button we just created
  article
    .querySelector(".edit-btn")
    .addEventListener("click", () => openEditModal(article, data));

  container.appendChild(article);
}

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
  document.querySelector(".sidebar").classList.toggle("collapsed");
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
