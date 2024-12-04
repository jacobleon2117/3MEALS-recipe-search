const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const searchSection = document.getElementById("search-section");
const favoritesSection = document.getElementById("favorites-section");
const searchResults = document.getElementById("search-results");
const favoritesContainer = document.getElementById("favorites-container");
const favoritesBtn = document.getElementById("favorites-btn");
const featuredRecipes = document.getElementById("featured-recipes");
const prevPageBtn = document.getElementById("prev-page");
const nextPageBtn = document.getElementById("next-page");
const pageInfo = document.getElementById("page-info");

let currentPage = 1;
const recipesPerPage = 6;
let totalRecipes = 0;
let currentRecipes = [];

document.body.insertAdjacentHTML(
  "beforeend",
  `
    <div class="modal-backdrop">
        <div class="modal-content">
            <div class="modal-header">
                <h2></h2>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body"></div>
        </div>
    </div>
`
);

const modalBackdrop = document.querySelector(".modal-backdrop");
const modalClose = document.querySelector(".modal-close");

document.addEventListener("DOMContentLoaded", loadFeaturedRecipes);
searchBtn.addEventListener("click", handleSearch);
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") handleSearch();
});
favoritesBtn.addEventListener("click", showFavorites);
prevPageBtn.addEventListener("click", () => changePage(-1));
nextPageBtn.addEventListener("click", () => changePage(1));

async function loadFeaturedRecipes() {
  try {
    const keywords = ["dinner", "healthy", "quick"];
    const promises = keywords.map((keyword) =>
      fetch(`/api/search?q=${keyword}`).then((res) => res.json())
    );

    const results = await Promise.all(promises);

    const featuredRecipes = results.map((result) => {
      const randomIndex = Math.floor(Math.random() * result.hits.length);
      return result.hits[randomIndex];
    });

    displayFeaturedRecipes(featuredRecipes);

    loadInitialSearchResults();
  } catch (error) {
    console.error("Error loading featured recipes:", error);
    featuredRecipes.innerHTML =
      '<p class="error">Error loading featured recipes.</p>';
  }
}

async function handleSearch() {
  const query = searchInput.value.trim();
  if (!query) return;

  const cuisineFilter = document.getElementById("cuisine-filter").value;
  const dietFilter = document.getElementById("diet-filter").value;
  const timeFilter = document.getElementById("time-filter").value;

  try {
    let url = `/api/search?q=${encodeURIComponent(query)}`;
    if (cuisineFilter) url += `&cuisineType=${cuisineFilter}`;
    if (dietFilter) url += `&diet=${dietFilter}`;
    if (timeFilter) url += `&time=${timeFilter}`;

    const response = await fetch(url);
    const data = await response.json();

    currentRecipes = data.hits;
    totalRecipes = currentRecipes.length;
    currentPage = 1;
    updatePagination();
    displayPagedRecipes();
  } catch (error) {
    console.error("Error fetching recipes:", error);
    searchResults.innerHTML =
      '<p class="error">Error fetching recipes. Please try again.</p>';
  }
}

function displayFeaturedRecipes(recipes) {
  const container = document.getElementById("featured-recipes");
  container.innerHTML = "";

  recipes.forEach(({ recipe }) => {
    const card = createRecipeCard(recipe);
    container.appendChild(card);
  });
}

async function loadInitialSearchResults() {
  try {
    const popularKeywords = [
      "dinner",
      "lunch",
      "breakfast",
      "snack",
      "dessert",
      "healthy",
    ];
    const randomKeyword =
      popularKeywords[Math.floor(Math.random() * popularKeywords.length)];

    const response = await fetch(`/api/search?q=${randomKeyword}`);
    const data = await response.json();

    currentRecipes = data.hits;
    totalRecipes = currentRecipes.length;
    currentPage = 1;

    updatePagination();
    displayPagedRecipes();
  } catch (error) {
    console.error("Error loading initial recipes:", error);
    searchResults.innerHTML =
      '<p class="error">Error loading recipes. Please try again.</p>';
  }
}

function createRecipeCard(recipe) {
  const card = document.createElement("div");
  card.className = "recipe-card";

  card.innerHTML = `
        <img src="${recipe.image}" alt="${recipe.label}">
        <div class="recipe-meta">
            <h3>${recipe.label}</h3>
            <p class="recipe-source">By ${recipe.source}</p>
            <div class="recipe-details">
                <span>${Math.round(recipe.calories)} calories</span>
                <span>${recipe.totalTime || "N/A"} mins</span>
                <button class="favorite-btn" onclick="event.stopPropagation(); toggleFavorite(this, ${JSON.stringify(
                  recipe
                ).replace(/"/g, "&quot;")})">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
        </div>
    `;

  card.addEventListener("click", () => showRecipeDetails(recipe));

  return card;
}

function displayRecipes(recipes, container) {
  container.innerHTML = "";

  if (recipes.length === 0) {
    container.innerHTML =
      '<p class="no-recipes">No recipes found. Try a different search!</p>';
    return;
  }

  recipes.forEach(({ recipe }) => {
    const card = createRecipeCard(recipe);
    container.appendChild(card);
  });
}

function displayPagedRecipes() {
  const start = (currentPage - 1) * recipesPerPage;
  const end = start + recipesPerPage;
  const pagedRecipes = currentRecipes.slice(start, end);
  displayRecipes(pagedRecipes, searchResults);
}

function showRecipeDetails(recipe) {
  const modalHeader = document.querySelector(".modal-header h2");
  const modalBody = document.querySelector(".modal-body");

  modalHeader.textContent = recipe.label;

  modalBody.innerHTML = `
        <img src="${recipe.image}" alt="${
    recipe.label
  }" class="recipe-image-large">
        
        <div class="modal-meta">
            <span><i class="fas fa-clock"></i> ${
              recipe.totalTime || "N/A"
            } mins</span>
            <span><i class="fas fa-fire"></i> ${Math.round(
              recipe.calories
            )} calories</span>
            <span><i class="fas fa-user"></i> ${
              recipe.yield || "N/A"
            } servings</span>
        </div>

        <div class="recipe-ingredients">
            <h4>Ingredients</h4>
            <ul class="ingredients-list">
                ${
                  recipe.ingredientLines
                    ?.map(
                      (ingredient) => `
                    <li>${ingredient}</li>
                `
                    )
                    .join("") || "No ingredients available"
                }
            </ul>
        </div>

        <div class="recipe-instructions">
            <h4>Instructions</h4>
            <ol>
                ${
                  recipe.instructions
                    ?.map(
                      (step) => `
                    <li>${step}</li>
                `
                    )
                    .join("") ||
                  "<li>Visit the source website for detailed instructions.</li>"
                }
            </ol>
        </div>
    `;

  modalBackdrop.style.display = "flex";
  document.body.style.overflow = "hidden";
}

async function toggleFavorite(button, recipe) {
  try {
    if (button.classList.contains("favorited")) {
      const response = await fetch(`/api/favorites/${recipe._id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        button.classList.remove("favorited");
        if (favoritesSection.classList.contains("active")) {
          loadFavorites();
        }
      }
    } else {
      const response = await fetch("/api/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(recipe),
      });
      if (response.ok) {
        button.classList.add("favorited");
      }
    }
  } catch (error) {
    console.error("Error updating favorites:", error);
    alert("Error updating favorites. Please try again.");
  }
}

function showFavorites() {
  searchSection.classList.add("hidden");
  favoritesSection.classList.remove("hidden");
  document.getElementById("featured-section").classList.add("hidden");
  loadFavorites();
}

async function loadFavorites() {
  try {
    const response = await fetch("/api/favorites");
    const favorites = await response.json();
    displayFavorites(favorites);
  } catch (error) {
    console.error("Error loading favorites:", error);
    favoritesContainer.innerHTML =
      '<p class="error">Error loading favorites. Please try again.</p>';
  }
}

function displayFavorites(favorites) {
  favoritesContainer.innerHTML = "";
  if (favorites.length === 0) {
    favoritesContainer.innerHTML =
      '<p class="no-favorites">No favorite recipes yet. Start exploring and save your favorites!</p>';
    return;
  }

  favorites.forEach((recipe) => {
    const card = createRecipeCard(recipe);
    const favoriteBtn = card.querySelector(".favorite-btn");
    favoriteBtn.classList.add("favorited");
    favoritesContainer.appendChild(card);
  });
}

function updatePagination() {
  const totalPages = Math.ceil(totalRecipes / recipesPerPage);
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled = currentPage === totalPages;
}

function changePage(delta) {
  currentPage += delta;
  displayPagedRecipes();
  updatePagination();
}

function displayPagedRecipes() {
  const start = (currentPage - 1) * recipesPerPage;
  const end = start + recipesPerPage;
  const pagedRecipes = currentRecipes.slice(start, end);
  displayRecipes(pagedRecipes, searchResults);
}

modalClose.addEventListener("click", () => {
  modalBackdrop.style.display = "none";
  document.body.style.overflow = "auto";
});

modalBackdrop.addEventListener("click", (e) => {
  if (e.target === modalBackdrop) {
    modalBackdrop.style.display = "none";
    document.body.style.overflow = "auto";
  }
});

document
  .getElementById("cuisine-filter")
  .addEventListener("change", handleSearch);
document.getElementById("diet-filter").addEventListener("change", handleSearch);
document.getElementById("time-filter").addEventListener("change", handleSearch);

document
  .querySelector('.nav-links a[href="#"]')
  .addEventListener("click", (e) => {
    e.preventDefault();
    showHome();
  });

document.addEventListener("DOMContentLoaded", () => {
  loadFeaturedRecipes();
});

loadFeaturedRecipes();
