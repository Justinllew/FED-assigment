// Data Models
let favorites = [
  {
    id: 1,
    name: "Grilled cheese",
    customizations: ["Add Extra Cheese", "Large"],
    image:
      "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=400&fit=crop",
    price: 12.99,
    isFavorite: true,
  },
  {
    id: 2,
    name: "Grilled cheese",
    customizations: ["Add Extra Cheese", "Large"],
    image:
      "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=400&fit=crop",
    price: 12.99,
    isFavorite: true,
  },
  {
    id: 3,
    name: "Grilled cheese",
    customizations: ["Add Extra Cheese", "Large"],
    image:
      "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=400&fit=crop",
    price: 12.99,
    isFavorite: true,
  },
];

let recommended = [
  {
    id: 101,
    name: "Classic Grilled",
    description: "Golden crispy bread with cheddar",
    image:
      "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=400&fit=crop",
    price: 10.99,
    isFavorite: false,
  },
  {
    id: 102,
    name: "Cheese Delight",
    description: "Triple cheese blend",
    image:
      "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=400&fit=crop",
    price: 11.99,
    isFavorite: false,
  },
  {
    id: 103,
    name: "Spicy Grilled",
    description: "With jalapeños and hot sauce",
    image:
      "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=400&fit=crop",
    price: 13.99,
    isFavorite: false,
  },
  {
    id: 104,
    name: "Veggie Melt",
    description: "Tomato, basil, mozzarella",
    image:
      "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=400&fit=crop",
    price: 11.49,
    isFavorite: false,
  },
  {
    id: 105,
    name: "Bacon Crunch",
    description: "Crispy bacon bits inside",
    image:
      "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=400&fit=crop",
    price: 14.99,
    isFavorite: false,
  },
];

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  renderFavorites();
  renderRecommended();

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    const dropdown = document.getElementById("dropdownMenu");
    const userMenuBtn = document.getElementById("userMenuBtn");
    const overlay = document.getElementById("overlay");

    if (!userMenuBtn.contains(e.target) && !dropdown.contains(e.target)) {
      closeDropdown();
    }
  });
});

// Dropdown Functions
function toggleDropdown() {
  const dropdown = document.getElementById("dropdownMenu");
  const overlay = document.getElementById("overlay");

  if (dropdown.classList.contains("active")) {
    closeDropdown();
  } else {
    dropdown.classList.add("active");
    overlay.classList.add("active");
  }
}

function closeDropdown() {
  const dropdown = document.getElementById("dropdownMenu");
  const overlay = document.getElementById("overlay");
  dropdown.classList.remove("active");
  overlay.classList.remove("active");
}

function renderFavorites() {
  const container = document.getElementById("favorites-grid");
  const emptyState = document.getElementById("favorites-empty");

  if (favorites.length === 0) {
    container.style.display = "none";
    emptyState.style.display = "flex";
    return;
  }

  container.style.display = "grid";
  emptyState.style.display = "none";

  container.innerHTML = favorites
    .map(
      (item) => `
        <div class="food-card">
            <div class="food-img" style="background-image: url('${item.image}')">
                <button onclick="removeFromFavorites(${item.id})" class="heart-btn liked" title="Remove from favorites">
                    <i class="ph-fill ph-heart"></i>
                </button>
            </div>
            
            <div class="food-info">
                <div class="food-header">
                    <h3>${item.name}</h3>
                    <span class="price-tag">$${item.price.toFixed(2)}</span>
                </div>
                
                <div style="margin-bottom: 8px;">
                    ${item.customizations
                      .map(
                        (custom) => `
                        <span class="customization-tag">${custom}</span>
                    `,
                      )
                      .join("")}
                </div>
                
                <div class="food-actions">
                    <button onclick="removeFromFavorites(${item.id})" class="action-btn secondary">
                        <i class="ph ph-trash"></i> Remove
                    </button>
                    <button onclick="addToCart(${item.id})" class="action-btn">
                        <i class="ph ph-shopping-cart"></i> Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `,
    )
    .join("");
}

function renderRecommended() {
  const container = document.getElementById("recommended-grid");

  container.innerHTML = recommended
    .map(
      (item) => `
        <div class="food-card">
            <div class="food-img" style="background-image: url('${item.image}')">
                <button onclick="toggleLikeRecommended(${item.id})" 
                    class="heart-btn ${item.isFavorite ? "liked" : ""}" 
                    title="${item.isFavorite ? "Remove from favorites" : "Add to favorites"}">
                    <i class="${item.isFavorite ? "ph-fill" : "ph"} ph-heart"></i>
                </button>
            </div>
            
            <div class="food-info">
                <div class="food-header">
                    <h3>${item.name}</h3>
                    <span class="price-tag">$${item.price.toFixed(2)}</span>
                </div>
                
                <p class="food-description">${item.description}</p>
                
                <div class="food-actions">
                    <button onclick="addToCart(${item.id})" class="action-btn">
                        <i class="ph ph-plus"></i> Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `,
    )
    .join("");
}

function removeFromFavorites(id) {
  favorites = favorites.filter((f) => f.id !== id);

  // Also update in recommended if exists there
  const recItem = recommended.find((r) => r.id === id);
  if (recItem) recItem.isFavorite = false;

  renderFavorites();
  renderRecommended();
  showToast("Removed from favourites");
}

function toggleLikeRecommended(id) {
  const item = recommended.find((r) => r.id === id);
  if (!item) return;

  item.isFavorite = !item.isFavorite;

  if (item.isFavorite) {
    const newFav = {
      id: Date.now(),
      name: item.name,
      customizations: [item.description],
      image: item.image,
      price: item.price,
      isFavorite: true,
    };
    favorites.push(newFav);
    showToast("Added to favourites");
  } else {
    favorites = favorites.filter((f) => f.name !== item.name);
    showToast("Removed from favourites");
  }

  renderFavorites();
  renderRecommended();
}

function addToCart(id) {
  showToast("Added to cart");
}

function showToast(message) {
  const toast = document.getElementById("toast");
  document.getElementById("toast-message").textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

function scrollToRecommended() {
  document.querySelector(".section-container:last-of-type").scrollIntoView({
    behavior: "smooth",
  });
}

function handleLogout() {
  showToast("Logging out...");
  setTimeout(() => {
    window.location.href = "login.html";
  }, 1000);
}

// Close dropdown on escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeDropdown();
  }
});
