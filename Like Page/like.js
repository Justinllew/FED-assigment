// ====== Mock data (replace with your real API / database later) ======
const ALL_ITEMS = [
  {
    id: "i1",
    stallName: "Stall Name",
    name: "Grilled cheese (large)",
    desc: "Add Extra Cheese",
    image:
      "https://images.unsplash.com/photo-1550317138-10000687a72b?auto=format&fit=crop&w=800&q=60",
    tags: ["cheese", "toast"],
  },
  {
    id: "i2",
    stallName: "Stall Name",
    name: "Grilled cheese",
    desc: "Add Extra Cheese",
    image:
      "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=60",
    tags: ["cheese"],
  },
  {
    id: "i3",
    stallName: "Stall Name",
    name: "Grilled cheese",
    desc: "Classic",
    image:
      "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=800&q=60",
    tags: ["toast"],
  },
  {
    id: "i4",
    stallName: "Another Stall",
    name: "Chicken rice",
    desc: "Roasted",
    image:
      "https://images.unsplash.com/photo-1604908554027-8a3d0dd7d6fa?auto=format&fit=crop&w=800&q=60",
    tags: ["rice", "chicken"],
  },
  {
    id: "i5",
    stallName: "Another Stall",
    name: "Chicken rice",
    desc: "Steamed",
    image:
      "https://images.unsplash.com/photo-1604908177453-7462950edb33?auto=format&fit=crop&w=800&q=60",
    tags: ["rice", "chicken"],
  },
  {
    id: "i6",
    stallName: "Soup Stall",
    name: "Fishball noodle soup",
    desc: "Extra fishballs",
    image:
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=60",
    tags: ["soup", "noodle"],
  },
];

// ====== localStorage helpers ======
const LS_KEY = "favouriteItemIds";

function getFavourites() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setFavourites(ids) {
  localStorage.setItem(LS_KEY, JSON.stringify(ids));
}

function isFavourited(itemId) {
  return getFavourites().includes(itemId);
}

function toggleFavourite(itemId) {
  const favs = getFavourites();
  const idx = favs.indexOf(itemId);

  if (idx >= 0) {
    favs.splice(idx, 1);
  } else {
    favs.push(itemId);
  }
  setFavourites(favs);
}

// ====== UI render ======
const stallGroupsEl = document.getElementById("stallGroups");
const emptyStateEl = document.getElementById("emptyState");
const seedBtn = document.getElementById("seedBtn");

const recommendedBlock = document.getElementById("recommendedBlock");
const recommendedGrid = document.getElementById("recommendedGrid");

// User menu
const userMenuBtn = document.getElementById("userMenuBtn");
const userMenu = document.getElementById("userMenu");

userMenuBtn.addEventListener("click", () => {
  const isOpen = userMenu.classList.toggle("open");
  userMenuBtn.setAttribute("aria-expanded", String(isOpen));
});

document.addEventListener("click", (e) => {
  const clickedInside =
    userMenu.contains(e.target) || userMenuBtn.contains(e.target);
  if (!clickedInside) {
    userMenu.classList.remove("open");
    userMenuBtn.setAttribute("aria-expanded", "false");
  }
});

// Seed favourites button (for demo)
seedBtn?.addEventListener("click", () => {
  setFavourites(["i1", "i2", "i4", "i6"]);
  render();
});

function createCard(item, liked) {
  const card = document.createElement("div");
  card.className = "card";

  const img = document.createElement("img");
  img.src = item.image;
  img.alt = item.name;

  const heart = document.createElement("button");
  heart.className = `heart ${liked ? "liked" : ""}`;
  heart.setAttribute(
    "aria-label",
    liked ? "Remove from favourites" : "Add to favourites",
  );

  const h = document.createElement("span");
  h.className = "h";
  h.textContent = liked ? "♥" : "♡";
  heart.appendChild(h);

  heart.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleFavourite(item.id);
    render();
  });

  const body = document.createElement("div");
  body.className = "card-body";

  const title = document.createElement("p");
  title.className = "card-title";
  title.textContent = item.name;

  const sub = document.createElement("p");
  sub.className = "card-sub";
  sub.textContent = item.desc;

  body.appendChild(title);
  body.appendChild(sub);

  card.appendChild(img);
  card.appendChild(heart);
  card.appendChild(body);

  return card;
}

function groupByStall(items) {
  const map = new Map();
  for (const item of items) {
    if (!map.has(item.stallName)) map.set(item.stallName, []);
    map.get(item.stallName).push(item);
  }
  return map;
}

// Very simple “recommended”: show items not liked, but share tags with liked items
function getRecommended(likedItems) {
  const likedTags = new Set(likedItems.flatMap((i) => i.tags || []));
  const favIds = new Set(getFavourites());

  const candidates = ALL_ITEMS.filter((i) => !favIds.has(i.id))
    .map((i) => {
      const score = (i.tags || []).reduce(
        (s, t) => s + (likedTags.has(t) ? 1 : 0),
        0,
      );
      return { item: i, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((x) => x.item);

  return candidates;
}

function render() {
  // Always clear first
  stallGroupsEl.innerHTML = "";
  recommendedGrid.innerHTML = "";

  const favIds = getFavourites();
  const favItems = ALL_ITEMS.filter((i) => favIds.includes(i.id));

  // ✅ Empty state ON when no favourites
  if (favItems.length === 0) {
    emptyStateEl.classList.remove("hidden");
    recommendedBlock.classList.add("hidden");
    return; // IMPORTANT: stop here
  }

  // ✅ Empty state OFF when there ARE favourites
  emptyStateEl.classList.add("hidden");

  // Group favourites by stall
  const grouped = groupByStall(favItems);

  for (const [stallName, items] of grouped.entries()) {
    const block = document.createElement("div");
    block.className = "block";

    const titleRow = document.createElement("div");
    titleRow.className = "stall-title";
    titleRow.innerHTML = `<span>${stallName}</span><span class="arrow">→</span>`;

    const grid = document.createElement("div");
    grid.className = "grid";

    for (const item of items) {
      grid.appendChild(createCard(item, true));
    }

    block.appendChild(titleRow);
    block.appendChild(grid);
    stallGroupsEl.appendChild(block);
  }

  // Recommended
  const rec = getRecommended(favItems);

  if (rec.length > 0) {
    recommendedBlock.classList.remove("hidden");
    for (const item of rec) {
      recommendedGrid.appendChild(createCard(item, false));
    }
  } else {
    recommendedBlock.classList.add("hidden");
  }
}

render();
