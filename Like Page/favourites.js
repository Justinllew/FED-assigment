// Data Models
let favorites = [
  {
    id: 1,
    name: "Grilled cheese",
    size: "large",
    customizations: ["Add Extra Cheese"],
    image:
      "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=400&fit=crop",
    price: 12.99,
    isFavorite: true,
  },
  {
    id: 2,
    name: "Grilled cheese",
    size: "large",
    customizations: ["Add Extra Cheese"],
    image:
      "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=400&fit=crop",
    price: 12.99,
    isFavorite: true,
  },
  {
    id: 3,
    name: "Grilled cheese",
    size: "large",
    customizations: ["Add Extra Cheese"],
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
    description: "Golden crispy",
    image:
      "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=400&fit=crop",
    price: 10.99,
    isFavorite: false,
  },
  {
    id: 102,
    name: "Cheese Delight",
    description: "Triple cheese",
    image:
      "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=400&fit=crop",
    price: 11.99,
    isFavorite: false,
  },
  {
    id: 103,
    name: "Spicy Grilled",
    description: "With jalapeños",
    image:
      "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=400&fit=crop",
    price: 13.99,
    isFavorite: false,
  },
  {
    id: 104,
    name: "Veggie Melt",
    description: "Tomato & basil",
    image:
      "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=400&fit=crop",
    price: 11.49,
    isFavorite: false,
  },
  {
    id: 105,
    name: "Bacon Crunch",
    description: "Crispy bacon",
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
  updateFavCount();

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    const dropdown = document.getElementById("dropdownMenu");
    const userMenuBtn = e.target.closest("button");
    if (!userMenuBtn && !dropdown.contains(e.target)) {
      dropdown.classList.add("hidden");
    }
  });
});

function toggleDropdown() {
  const dropdown = document.getElementById("dropdownMenu");
  dropdown.classList.toggle("hidden");
}

function renderFavorites() {
  const container = document.getElementById("favorites-grid");
  const emptyState = document.getElementById("favorites-empty");

  if (favorites.length === 0) {
    container.innerHTML = "";
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  container.innerHTML = favorites
    .map(
      (item, index) => `
        <div class="food-card bg-white rounded-2xl overflow-hidden border border-primary/10 shadow-sm group relative" style="animation-delay: ${index * 0.1}s">
            <div class="relative overflow-hidden aspect-square">
                <img src="${item.image}" alt="${item.name}" class="food-image w-full h-full object-cover">
                
                <!-- Remove from favorites button -->
                <button onclick="removeFromFavorites(${item.id})" class="absolute top-3 right-3 w-10 h-10 bg-primary text-gray-900 rounded-full flex items-center justify-center shadow-lg hover:bg-primary-dark transition transform hover:scale-110">
                    <i class="ph-fill ph-heart text-lg"></i>
                </button>
                
                <!-- Quick add button -->
                <button onclick="addToCart(${item.id})" class="absolute bottom-3 right-3 w-10 h-10 bg-white text-gray-900 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition transform translate-y-2 group-hover:translate-y-0 hover:bg-cream">
                    <i class="ph ph-plus text-lg"></i>
                </button>
            </div>
            
            <div class="p-4">
                <div class="flex justify-between items-start mb-1">
                    <h3 class="font-bold text-gray-900 text-lg">${item.name}</h3>
                    <span class="font-bold text-primary">$${item.price.toFixed(2)}</span>
                </div>
                <p class="text-sm text-gray-500 mb-2">${item.size}</p>
                ${item.customizations
                  .map(
                    (custom) => `
                    <span class="inline-block bg-cream text-gray-700 text-xs px-2 py-1 rounded-lg border border-primary/20 mb-1">${custom}</span>
                `,
                  )
                  .join("")}
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
      (item, index) => `
        <div class="food-card bg-white rounded-2xl overflow-hidden border border-primary/10 shadow-sm group" style="animation-delay: ${index * 0.1}s">
            <div class="relative overflow-hidden aspect-square">
                <img src="${item.image}" alt="${item.name}" class="food-image w-full h-full object-cover">
                
                <!-- Like button -->
                <button onclick="toggleLikeRecommended(${item.id})" 
                    class="heart-btn absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm border-2 ${item.isFavorite ? "border-primary bg-primary text-gray-900" : "border-gray-200 text-gray-400"} rounded-full flex items-center justify-center shadow-sm hover:border-primary hover:text-primary transition">
                    <i class="ph-fill ph-heart text-lg"></i>
                </button>
            </div>
            
            <div class="p-3">
                <h3 class="font-bold text-gray-900 text-sm mb-1">${item.name}</h3>
                <p class="text-xs text-gray-500 mb-2">${item.description}</p>
                <div class="flex justify-between items-center">
                    <span class="font-bold text-primary text-sm">$${item.price.toFixed(2)}</span>
                    <button onclick="addToCart(${item.id})" class="w-8 h-8 bg-cream rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-gray-900 transition">
                        <i class="ph ph-plus"></i>
                    </button>
                </div>
            </div>
        </div>
    `,
    )
    .join("");
}

function removeFromFavorites(id) {
  const item = favorites.find((f) => f.id === id);
  if (!item) return;

  // Animate removal
  const cards = document.querySelectorAll("#favorites-grid > div");
  const index = favorites.findIndex((f) => f.id === id);
  if (cards[index]) {
    cards[index].style.transform = "scale(0.9) opacity(0)";
  }

  setTimeout(() => {
    favorites = favorites.filter((f) => f.id !== id);
    renderFavorites();
    updateFavCount();
    showToast("Removed from favorites");
  }, 300);
}

function toggleLikeRecommended(id) {
  const item = recommended.find((r) => r.id === id);
  if (!item) return;

  item.isFavorite = !item.isFavorite;

  if (item.isFavorite) {
    // Add to favorites
    const newFav = {
      id: Date.now(), // Generate new ID
      name: item.name,
      size: "Regular",
      customizations: [item.description],
      image: item.image,
      price: item.price,
      isFavorite: true,
    };
    favorites.push(newFav);
    showToast("Added to favorites");
  } else {
    // Remove from favorites if exists
    favorites = favorites.filter((f) => f.name !== item.name);
    showToast("Removed from favorites");
  }

  renderFavorites();
  renderRecommended();
  updateFavCount();
}

function addToCart(id) {
  // Find item in either array
  const item =
    favorites.find((f) => f.id === id) || recommended.find((r) => r.id === id);
  if (!item) return;

  showToast("Added to cart");

  // Animation feedback on cart icon (if accessible)
  const cartBadge = document
    .querySelector(".ph-shopping-bag")
    .parentElement.querySelector("span");
  if (cartBadge) {
    cartBadge.style.transform = "scale(1.3)";
    setTimeout(() => (cartBadge.style.transform = "scale(1)"), 200);
  }
}

function updateFavCount() {
  const count = favorites.length;
  document.getElementById("fav-count").textContent = count;

  // Hide badge if 0
  const badge = document.getElementById("fav-count");
  if (count === 0) {
    badge.classList.add("hidden");
  } else {
    badge.classList.remove("hidden");
  }
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
  document.querySelector("section:last-of-type").scrollIntoView({
    behavior: "smooth",
    block: "start",
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
    document.getElementById("dropdownMenu").classList.add("hidden");
  }
});
