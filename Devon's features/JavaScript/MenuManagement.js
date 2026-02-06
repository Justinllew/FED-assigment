/**
 * MenuManagement.js
 * Integrated with Firebase for dynamic menu handling.
 */

// --- 1. FIREBASE IMPORTS & CONFIG ---
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
const MENU_COLLECTION = "menuItems"; // The name of your collection in Firebase

// --- 2. GLOBAL STATE ---
let currentEditingItem = null;
let isAddMode = false;
let storeConfig = {
  isOpen: false,
  isAuto: false,
  openTime: "09:00",
  closeTime: "21:00",
};

// --- 3. INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
  // 1. Load Menu from Firebase
  loadMenuFromFirebase();

  // 2. Load Store Settings from LocalStorage
  const savedConfig = localStorage.getItem("freshEats_storeConfig");
  if (savedConfig) {
    storeConfig = JSON.parse(savedConfig);
  }
  updateStatusUI();

  // 3. Start Auto-Scheduler
  setInterval(checkAutoSchedule, 60000);
  checkAutoSchedule();
});

// --- 4. FIREBASE CRUD FUNCTIONS ---

// READ: Fetch all items from cloud
async function loadMenuFromFirebase() {
  const container = document.querySelector(".menu-list-card");
  // Optional: Add a loading spinner here
  // container.innerHTML = '<p style="text-align:center; padding: 20px;">Loading Menu...</p>';

  const querySnapshot = await getDocs(collection(db, MENU_COLLECTION));

  container.innerHTML = ""; // Clear existing content

  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    renderMenuItem(docSnap.id, data);
  });
}

// CREATE / UPDATE: Save changes to cloud
async function saveChanges() {
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

  // Disable button to prevent double-clicks
  const saveBtn = document.querySelector(".btn-save");
  const originalText = saveBtn.innerText;
  saveBtn.innerText = "Saving...";
  saveBtn.disabled = true;

  try {
    if (isAddMode) {
      // --- Add New to Firebase ---
      await addDoc(collection(db, MENU_COLLECTION), {
        name: name,
        desc: desc,
        price: price,
        imgSrc: imgSrc,
        status: "available", // Default status
        createdAt: new Date(),
      });
    } else {
      // --- Update Existing in Firebase ---
      const docId = currentEditingItem.getAttribute("data-id");
      const itemRef = doc(db, MENU_COLLECTION, docId);

      await updateDoc(itemRef, {
        name: name,
        desc: desc,
        price: price,
        imgSrc: imgSrc,
      });
    }

    // Refresh the UI
    await loadMenuFromFirebase();
    closeModal();
  } catch (error) {
    console.error("Error saving document: ", error);
    alert("Failed to save changes. Check console for details.");
  } finally {
    saveBtn.innerText = originalText;
    saveBtn.disabled = false;
  }
}

// DELETE: Remove from cloud
async function deleteItem() {
  if (
    currentEditingItem &&
    confirm("Are you sure you want to delete this item?")
  ) {
    const docId = currentEditingItem.getAttribute("data-id");

    try {
      await deleteDoc(doc(db, MENU_COLLECTION, docId));
      currentEditingItem.remove(); // Remove from UI immediately
      closeModal();
    } catch (error) {
      console.error("Error deleting document: ", error);
      alert("Failed to delete item.");
    }
  }
}

// HELPER: Render a single item to HTML
function renderMenuItem(docId, item) {
  const container = document.querySelector(".menu-list-card");
  const article = document.createElement("article");
  article.className = "menu-item";
  article.setAttribute("data-id", docId); // Crucial: Store the Firebase ID on the element!

  // Determine status text/color logic
  let statusText = "Available";
  let statusColor = "#68a357";
  if (item.status === "sold-out") {
    statusText = "Sold Out";
    statusColor = "#a35757";
  }
  if (item.status === "promotion") {
    statusText = "Promotion";
    statusColor = "#d97706";
  }

  // Handle Price Display (Promotion Logic)
  let displayPrice = item.price;
  let priceDataset = ""; // To store original price

  if (item.status === "promotion") {
    displayPrice = (item.price * 0.8).toFixed(2);
    priceDataset = `data-original-price="${item.price}"`;
  }

  article.innerHTML = `
      <img src="${item.imgSrc || "https://placehold.co/100"}" alt="${item.name}" class="item-img" />
      <div class="item-info">
        <h3 class="item-name">${item.name}</h3>
        <p class="item-desc">${item.desc}</p>
      </div>
      <div class="item-actions-col">
        <span class="price" ${priceDataset}>$${displayPrice}</span>
        <div class="status-wrapper">
           <button class="status-badge ${item.status || "available"}" onclick="toggleStatusMenu(this)">
             <span class="status-text">${statusText}</span>
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
  container.appendChild(article);
}

// --- 5. UI ACTIONS (STATUS, MODALS) ---

// Note: We also update Firebase when status changes
async function updateStatus(option, status) {
  const wrapper = option.closest(".status-wrapper");
  const menuCard = option.closest("article");
  const docId = menuCard.getAttribute("data-id");

  // 1. Visual Update (Optimistic UI)
  const badge = wrapper.querySelector(".status-badge");
  const text = badge.querySelector(".status-text");
  const priceElement = menuCard.querySelector(".price");

  badge.className = "status-badge " + status;

  if (status === "available") text.innerText = "Available";
  if (status === "sold-out") text.innerText = "Sold Out";
  if (status === "promotion") text.innerText = "Promotion";

  // Price Logic
  if (status === "promotion") {
    if (!priceElement.dataset.originalPrice) {
      priceElement.dataset.originalPrice = priceElement.innerText.replace(
        "$",
        "",
      );
    }
    const originalPrice = parseFloat(priceElement.dataset.originalPrice);
    priceElement.innerText = `$${(originalPrice * 0.8).toFixed(2)}`;
  } else {
    // Revert price
    if (priceElement.dataset.originalPrice) {
      priceElement.innerText = `$${priceElement.dataset.originalPrice}`;
    }
  }

  wrapper.querySelector(".status-menu").classList.remove("active");

  // 2. Database Update
  try {
    const itemRef = doc(db, MENU_COLLECTION, docId);
    await updateDoc(itemRef, { status: status });
  } catch (error) {
    console.error("Failed to update status in DB", error);
    // Optional: Revert UI if DB fails
  }
}

function toggleStatusMenu(btn) {
  document.querySelectorAll(".status-menu").forEach((m) => {
    if (m !== btn.nextElementSibling) m.classList.remove("active");
  });
  btn.nextElementSibling.classList.toggle("active");
}

function openAddModal() {
  isAddMode = true;
  currentEditingItem = null;
  document.getElementById("editName").value = "";
  document.getElementById("editDesc").value = "";
  document.getElementById("editPrice").value = "";
  document.getElementById("previewImage").src =
    "https://placehold.co/100x100/e0e0e0/666?text=Upload";

  document.querySelector(".modal-header h3").innerText = "Add New Item";
  document.querySelector(".btn-save").innerText = "Add Item";
  document.querySelector(".btn-delete").style.display = "none";
  document.getElementById("editModal").style.display = "flex";
}

function openEditModal(button) {
  isAddMode = false;
  const itemRow = button.closest(".menu-item");
  currentEditingItem = itemRow;

  const currentName = itemRow.querySelector(".item-name").innerText;
  const currentDesc = itemRow.querySelector(".item-desc").innerText;
  const currentImg = itemRow.querySelector(".item-img").src;

  // Logic to get raw price regardless of current display (e.g. if discounted)
  const priceSpan = itemRow.querySelector(".price");
  let currentPrice = priceSpan.innerText.replace(/[^0-9.]/g, "");
  if (priceSpan.dataset.originalPrice) {
    currentPrice = priceSpan.dataset.originalPrice;
  }

  document.getElementById("editName").value = currentName;
  document.getElementById("editDesc").value = currentDesc;
  document.getElementById("editPrice").value =
    parseFloat(currentPrice).toFixed(2);
  document.getElementById("previewImage").src = currentImg;

  document.querySelector(".modal-header h3").innerText = "Edit Menu Item";
  document.querySelector(".btn-save").innerText = "Save Changes";
  document.querySelector(".btn-delete").style.display = "block";
  document.getElementById("editModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("editModal").style.display = "none";
  currentEditingItem = null;
}

function previewFile() {
  const preview = document.getElementById("previewImage");
  const file = document.getElementById("itemImageInput").files[0];
  const reader = new FileReader();
  reader.addEventListener(
    "load",
    () => {
      preview.src = reader.result;
    },
    false,
  );
  if (file) reader.readAsDataURL(file);
}

// --- 6. STORE SCHEDULE LOGIC (UNCHANGED) ---
function checkAutoSchedule() {
  if (!storeConfig.isAuto) return;
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const [openH, openM] = storeConfig.openTime.split(":").map(Number);
  const [closeH, closeM] = storeConfig.closeTime.split(":").map(Number);
  const openMins = openH * 60 + openM;
  const closeMins = closeH * 60 + closeM;
  const shouldBeOpen = currentTime >= openMins && currentTime < closeMins;

  if (storeConfig.isOpen !== shouldBeOpen) {
    storeConfig.isOpen = shouldBeOpen;
    updateStatusUI();
    saveConfig();
  }
}

function handleManualToggle(checkbox) {
  storeConfig.isOpen = checkbox.checked;
  if (storeConfig.isAuto) {
    if (confirm("You are in Auto-Schedule mode. Switch to Manual mode?")) {
      storeConfig.isAuto = false;
    } else {
      checkbox.checked = !checkbox.checked;
      storeConfig.isOpen = checkbox.checked;
      return;
    }
  }
  updateStatusUI();
  saveConfig();
}

function updateStatusUI() {
  const toggle = document.getElementById("masterStatusToggle");
  const text = document.getElementById("statusText");
  const dotWrapper = document.querySelector(".status-toggle-group");
  const schedBtn = document.querySelector(".btn-schedule");

  toggle.checked = storeConfig.isOpen;
  text.innerText = storeConfig.isOpen ? "Open" : "Closed";
  dotWrapper.className = `status-toggle-group ${storeConfig.isOpen ? "open-state" : "closed-state"}`;

  if (storeConfig.isAuto) {
    schedBtn.style.color = "#2563eb";
    schedBtn.style.background = "#eff6ff";
    schedBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg><span>Auto On</span>`;
  } else {
    schedBtn.style.color = "";
    schedBtn.style.background = "";
    schedBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg><span>Auto</span>`;
  }
}

function openScheduleModal() {
  document.getElementById("autoScheduleToggle").checked = storeConfig.isAuto;
  document.getElementById("openTimeInput").value = storeConfig.openTime;
  document.getElementById("closeTimeInput").value = storeConfig.closeTime;
  document.getElementById("scheduleModal").style.display = "flex";
}

function closeScheduleModal() {
  document.getElementById("scheduleModal").style.display = "none";
}

function saveSchedule() {
  storeConfig.isAuto = document.getElementById("autoScheduleToggle").checked;
  storeConfig.openTime = document.getElementById("openTimeInput").value;
  storeConfig.closeTime = document.getElementById("closeTimeInput").value;
  saveConfig();
  closeScheduleModal();
  checkAutoSchedule();
  updateStatusUI();
}

function saveConfig() {
  localStorage.setItem("freshEats_storeConfig", JSON.stringify(storeConfig));
}

function toggleSidebar() {
  document.querySelector(".app-container").classList.toggle("collapsed");
}

// --- 7. EXPORT TO HTML ---
// Because we use type="module", these functions are hidden from HTML onclick by default.
// We must attach them to the 'window' object to make them accessible.
window.saveChanges = saveChanges;
window.deleteItem = deleteItem;
window.toggleStatusMenu = toggleStatusMenu;
window.updateStatus = updateStatus;
window.openAddModal = openAddModal;
window.openEditModal = openEditModal;
window.closeModal = closeModal;
window.previewFile = previewFile;
window.handleManualToggle = handleManualToggle;
window.openScheduleModal = openScheduleModal;
window.closeScheduleModal = closeScheduleModal;
window.saveSchedule = saveSchedule;
window.toggleSidebar = toggleSidebar;
window.checkAutoSchedule = checkAutoSchedule; // Useful for debugging
