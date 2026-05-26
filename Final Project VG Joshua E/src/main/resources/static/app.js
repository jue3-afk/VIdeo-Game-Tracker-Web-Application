const FAVORITES_KEY = "game-info-favorites";
const PLACEHOLDER_IMAGE = "https://placehold.co/640x400/10203a/eaf2ff?text=No+Image";

let currentMode = "trending";
let lastSearch = "";
let currentGenre = "all";

const GENRE_OPTIONS = [
    { label: "Trending", value: "all" },
    { label: "Action", value: "action" },
    { label: "Adventure", value: "adventure" },
    { label: "RPG", value: "role-playing-games-rpg" },
    { label: "Shooter", value: "shooter" },
    { label: "Sports", value: "sports" },
    { label: "Strategy", value: "strategy" }
];


const searchForm = document.getElementById("search-form");
const queryInput = document.getElementById("query");
const genreBar = document.getElementById("genre-bar");
const resultsTitle = document.getElementById("results-title");
const gamesGrid = document.getElementById("games-grid");
const loadingEl = document.getElementById("loading");
const errorEl = document.getElementById("error");
const errorMessage = document.getElementById("error-message");
const emptyEl = document.getElementById("empty");
const emptyQuery = document.getElementById("empty-query");
const retryBtn = document.getElementById("retry-btn");
const showTrendingBtn = document.getElementById("show-trending");
const clearSearchBtn = document.getElementById("clear-search-btn");
const pageParams = new URLSearchParams(window.location.search);




function formatDate(dateStr) {
    if (!dateStr) {
        return "TBA";
    }

    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}

function getMetacriticClass(score) {
    if (typeof score !== "number") {
        return "metacritic-medium";
    }
    if (score >= 75) {
        return "metacritic-high";
    }
    if (score >= 50) {
        return "metacritic-medium";
    }
    return "metacritic-low";
}

function getFallbackPreviewText(game) {
    return `This game is ${game.name || "a title"} with more story details on the details page.`;
}

function stripHtml(value) {
    const temp = document.createElement("div");
    temp.innerHTML = value || "";
    return (temp.textContent || temp.innerText || "").trim();
}

function truncateText(value, maxLength = 120) {
    if (value.length <= maxLength) {
        return value;
    }

    return `${value.slice(0, maxLength).trimEnd()}...`;
}

function createGameCard(game) {
    const imageUrl = game.backgroundImage || game.background_image || PLACEHOLDER_IMAGE;
    const genres = Array.isArray(game.genres)
        ? game.genres
            .slice(0, 2)
            .map((genre) => typeof genre === "string" ? genre : genre.name)
            .filter(Boolean)
        : [];
    const ratingValue = typeof game.rating === "number" ? game.rating.toFixed(1) : "N/A";
    const metacriticValue = typeof game.metacritic === "number" ? game.metacritic : null;
    const previewText = getFallbackPreviewText(game);

    return `
        <article class="game-card" data-game-id="${game.id}">
            <div class="game-image-container">
                <img src="${imageUrl}" alt="${game.name}" class="game-image">
                ${metacriticValue !== null
                    ? `<span class="metacritic-badge ${getMetacriticClass(metacriticValue)}">${metacriticValue}</span>`
                    : ""}
            </div>
            <div class="game-content">
                <h3 class="game-title">${game.name}</h3>
                <div class="game-meta">
                    <span class="game-meta-item">
                        <svg class="star-icon" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                        ${ratingValue}
                    </span>
                    <span class="game-meta-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M8 2v4"></path>
                            <path d="M16 2v4"></path>
                            <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                            <path d="M3 10h18"></path>
                        </svg>
                        ${formatDate(game.released)}
                    </span>
                </div>
                <div class="game-tags">
                    ${genres.map((genre) => `<span class="game-tag genre">${genre}</span>`).join("")}
                </div>
                <p class="game-preview" data-preview-for="${game.id}">${previewText}</p>
                <div class="game-actions">
                    <a class="details-link" href="/game.html?id=${encodeURIComponent(game.id)}">Open Details</a>
                </div>
            </div>
        </article>
    `;
}

async function loadGamePreviews(games) {
    const previewTasks = games.map(async (game) => {
        const previewEl = gamesGrid ? gamesGrid.querySelector(`[data-preview-for="${game.id}"]`) : null;
        if (!previewEl) {
            return;
        }

        try {
            const response = await fetch(`/api/games/${encodeURIComponent(game.id)}`);
            const detail = await response.json();

            if (!response.ok) {
                throw new Error(detail.error || "Could not load game details.");
            }

            const descriptionText = stripHtml(detail.description || "");
            previewEl.textContent = descriptionText
                ? truncateText(descriptionText)
                : getFallbackPreviewText(game);
        } catch (error) {
            previewEl.textContent = getFallbackPreviewText(game);
        }
    });

    await Promise.all(previewTasks);
}

function renderGenreBar() {
    if (!genreBar) {
        return;
    }

    genreBar.innerHTML = GENRE_OPTIONS.map((genre) => `
        <button
            type="button"
            class="genre-filter${genre.value === currentGenre ? " active" : ""}"
            data-genre="${genre.value}">
            ${genre.label}
        </button>
    `).join("");

    genreBar.querySelectorAll("[data-genre]").forEach((button) => {
        button.addEventListener("click", () => {
            const selectedGenre = button.dataset.genre || "all";
            currentGenre = selectedGenre;
            renderGenreBar();

            if (selectedGenre === "all") {
                loadTrending();
                return;
            }

            fetchGames("genre", selectedGenre);
        });
    });
}

function showLoading() {
    if (!gamesGrid || !errorEl || !emptyEl || !loadingEl) {
        return;
    }

    gamesGrid.classList.add("hidden");
    errorEl.classList.add("hidden");
    emptyEl.classList.add("hidden");
    loadingEl.classList.remove("hidden");
}

function showError(message) {
    if (!loadingEl || !emptyEl || !gamesGrid || !errorMessage || !errorEl) {
        return;
    }

    loadingEl.classList.add("hidden");
    emptyEl.classList.add("hidden");
    gamesGrid.classList.add("hidden");
    errorMessage.textContent = message;
    errorEl.classList.remove("hidden");
}

function showEmpty(query) {
    if (!loadingEl || !errorEl || !gamesGrid || !emptyQuery || !emptyEl) {
        return;
    }

    loadingEl.classList.add("hidden");
    errorEl.classList.add("hidden");
    gamesGrid.classList.add("hidden");
    emptyQuery.textContent = query;
    emptyEl.classList.remove("hidden");
}

function showResults() {
    if (!loadingEl || !errorEl || !emptyEl || !gamesGrid) {
        return;
    }

    loadingEl.classList.add("hidden");
    errorEl.classList.add("hidden");
    emptyEl.classList.add("hidden");
    gamesGrid.classList.remove("hidden");
}

function updateHeader(count) {
    if (!showTrendingBtn || !resultsTitle) {
        return;
    }

    if (currentMode === "search") {
        resultsTitle.textContent = "Search Results";
        showTrendingBtn.classList.remove("hidden");
        return;
    }

    if (currentMode === "genre") {
        const activeGenre = GENRE_OPTIONS.find((genre) => genre.value === currentGenre);
        resultsTitle.textContent = activeGenre ? `${activeGenre.label} Games` : "Genre Results";
        showTrendingBtn.classList.remove("hidden");
        return;
    }

    resultsTitle.textContent = "Trending Games";
    showTrendingBtn.classList.add("hidden");
}

function getFavorites() {
    try {
        const rawFavorites = localStorage.getItem(FAVORITES_KEY);
        return rawFavorites ? JSON.parse(rawFavorites) : [];
    } catch (error) {
        return [];
    }
}

function saveFavorites(favorites) {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

function isFavorite(id) {
    return getFavorites().some((f) => f.id === id);
}

function toggleFavorite(game) {
    const favorites = getFavorites();
    const existingIndex = favorites.findIndex((favorite) => favorite.id === game.id);

    if (existingIndex >= 0) {
        favorites.splice(existingIndex, 1);
    } else {
        favorites.push({
            id: game.id,
            name: game.name,
            released: game.released,
            backgroundImage: game.backgroundImage || game.background_image,
            rating: game.rating,
            genres: Array.isArray(game.genres)
                ? game.genres.map((genre) => typeof genre === "string" ? genre : genre.name).filter(Boolean)
                : []
        });
    }

    saveFavorites(favorites);
}

function syncFavoriteButton(button, gameId) {
    if (isFavorite(gameId)) {
        button.textContent = "Saved";
        button.classList.add("saved");
        return;
    }

    button.textContent = "Save Favorite";
    button.classList.remove("saved");
}

function renderGames(games) {
    if (!gamesGrid) {
        return;
    }

    gamesGrid.innerHTML = games.map(createGameCard).join("");
    showResults();
    loadGamePreviews(games);
}

async function fetchGames(mode, query = "") {
    currentMode = mode;
    lastSearch = mode === "search" ? query : "";
    showLoading();

    let url = "/api/games/trending";
    if (mode === "search") {
        url = `/api/games/search?query=${encodeURIComponent(query)}&page=1&pageSize=30`;
    } else if (mode === "genre") {
        url = `/api/games/genre?genre=${encodeURIComponent(query)}&pageSize=30`;
    }

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to load games.");
        }

        const games = data.results || data.games || [];
        updateHeader(games.length);

        if (!games.length && (mode === "search" || mode === "genre")) {
            showEmpty(query);
            return;
        }

        renderGames(games);
    } catch (error) {
        showError(error.message);
    }
}

function loadTrending() {
    if (!queryInput) {
        return;
    }

    queryInput.value = "";
    currentGenre = "all";
    renderGenreBar();
    fetchGames("trending");
}

function loadInitialResults() {
    const genre = pageParams.get("genre");
    const query = pageParams.get("query");

    if (queryInput && query) {
        queryInput.value = query;
    }

    if (genre && genre !== "all") {
        currentGenre = genre;
        renderGenreBar();
        fetchGames("genre", genre);
        return;
    }

    if (query) {
        currentGenre = "all";
        renderGenreBar();
        fetchGames("search", query);
        return;
    }

    loadTrending();
}

function handleSearchSubmit(event) {
    event.preventDefault();

    if (!queryInput) {
        return;
    }

    const query = queryInput.value.trim();

    if (!query) {
        loadTrending();
        return;
    }

    currentGenre = "all";
    renderGenreBar();
    fetchGames("search", query);
}

if (searchForm && queryInput && gamesGrid
    && loadingEl && errorEl && errorMessage && emptyEl && emptyQuery
    && retryBtn && showTrendingBtn && clearSearchBtn) {
    renderGenreBar();
    searchForm.addEventListener("submit", handleSearchSubmit);
    showTrendingBtn.addEventListener("click", loadTrending);
    clearSearchBtn.addEventListener("click", loadTrending);
    retryBtn.addEventListener("click", () => {
        if (currentMode === "search" && lastSearch) {
            fetchGames("search", lastSearch);
            return;
        }

        if (currentMode === "genre" && currentGenre !== "all") {
            fetchGames("genre", currentGenre);
            return;
        }

        loadTrending();
    });

    document.addEventListener("DOMContentLoaded", loadInitialResults);
}
