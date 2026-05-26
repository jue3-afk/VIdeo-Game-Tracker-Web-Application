const FAVORITES_KEY = "game-info-favorites";
const PLACEHOLDER_IMAGE = "https://placehold.co/960x540/10203a/eaf2ff?text=No+Image";
const GENRE_OPTIONS = [
    { label: "All", value: "all" },
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
const title = document.getElementById("game-title");
const statusText = document.getElementById("detail-status");
const detailCard = document.getElementById("detail-card");
const detailImage = document.getElementById("detail-image");
const detailMeta = document.getElementById("detail-meta");
const detailGenres = document.getElementById("detail-genres");
const detailDescription = document.getElementById("detail-description");
const detailMetacritic = document.getElementById("detail-metacritic");
const detailPlatforms = document.getElementById("detail-platforms");
const detailWebsite = document.getElementById("detail-website");
const detailParentGames = document.getElementById("detail-parent-games");
const favoriteButton = document.getElementById("favorite-toggle");

const params = new URLSearchParams(window.location.search);
const gameId = params.get("id");

renderGenreBar();

if (searchForm && queryInput) {
    searchForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const query = queryInput.value.trim();

        if (!query) {
            window.location.href = "/";
            return;
        }

        window.location.href = `/?query=${encodeURIComponent(query)}`;
    });
}

if (!gameId) {
    title.textContent = "Game not found";
    statusText.textContent = "No game id was provided in the page link.";
} else {
    loadGame(gameId);
}

function renderGenreBar() {
    if (!genreBar) {
        return;
    }

    genreBar.innerHTML = GENRE_OPTIONS.map((genre) => `
        <button type="button" class="genre-filter" data-genre="${genre.value}">
            ${genre.label}
        </button>
    `).join("");

    genreBar.querySelectorAll("[data-genre]").forEach((button) => {
        button.addEventListener("click", () => {
            const selectedGenre = button.dataset.genre || "all";
            window.location.href = selectedGenre === "all"
                ? "/"
                : `/?genre=${encodeURIComponent(selectedGenre)}`;
        });
    });
}

async function loadGame(id) {
    try {
        const response = await fetch(`/api/games/${encodeURIComponent(id)}`);
        const game = await response.json();

        if (!response.ok) {
            throw new Error(game.error || "Could not load this game.");
        }

        renderGame(game);
        loadParentGames(id);
    } catch (error) {
        title.textContent = "Game not found";
        statusText.textContent = error.message;
    }
}

function renderGame(game) {
    title.textContent = game.name;
    statusText.textContent = "";
    detailImage.src = game.backgroundImage || PLACEHOLDER_IMAGE;
    detailImage.alt = `${game.name} artwork`;
    detailMeta.textContent = `Released: ${game.released || "Unknown"} | Rating: ${game.rating ?? "N/A"}`;
    detailGenres.textContent = game.genres.length ? `Genres: ${game.genres.join(", ")}` : "Genres: N/A";
    detailDescription.textContent = game.description || "No description available.";
    detailMetacritic.textContent = game.metacritic ?? "N/A";
    detailPlatforms.textContent = game.platforms.length ? game.platforms.join(", ") : "N/A";
    detailWebsite.innerHTML = game.website
        ? `<a href="${game.website}" target="_blank" rel="noreferrer">Visit official site</a>`
        : "N/A";
    detailParentGames.textContent = "Loading...";

    detailCard.classList.remove("hidden");
    syncFavoriteButton(game);
    favoriteButton.addEventListener("click", () => {
        toggleFavorite(game);
        syncFavoriteButton(game);
    });
}

function syncFavoriteButton(game) {
    if (isFavorite(game.id)) {
        favoriteButton.textContent = "Remove Favorite";
        favoriteButton.dataset.state = "saved";
        return;
    }

    favoriteButton.textContent = "Save Favorite";
    favoriteButton.dataset.state = "default";
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
            backgroundImage: game.backgroundImage,
            rating: game.rating,
            genres: game.genres || []
        });
    }

    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

function isFavorite(id) {
    return getFavorites().some((favorite) => favorite.id === id);
}

function getFavorites() {
    try {
        const rawFavorites = localStorage.getItem(FAVORITES_KEY);
        return rawFavorites ? JSON.parse(rawFavorites) : [];
    } catch (error) {
        return [];
    }
}

function clearFavorites() {
    localStorage.removeItem(FAVORITES_KEY);
}

async function loadParentGames(id) {
    try {
        const response = await fetch(`/api/games/${encodeURIComponent(id)}/parent-games`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Could not load parent games.");
        }

        detailParentGames.textContent = getParentGamesForDlc(data);
    } catch (error) {
        detailParentGames.textContent = "N/A";
    }
}

function getParentGamesForDlc(response) {
    if (!response.results || response.results.length === 0) {
        return "N/A";
    }

    return response.results.map((game) => game.name).join(", ");
}
