

/*from app.js *
public const form = document.getElementById("search-form");
const queryInput = document.getElementById("query");
const statusText = document.getElementById("status");
const resultsTitle = document.getElementById("results-title");
const resultsContainer = document.getElementById("results");
const cardTemplate = document.getElementById("game-card-template");
const showTrendingButton = document.getElementById("show-trending");

document.addEventListener("DOMContentLoaded", loadTrendingGames);
showTrendingButton.addEventListener("click", loadTrendingGames);

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const query = queryInput.value.trim();
    if (!query) {
        statusText.textContent = "Enter a game title to search.";
        return;
    }

    statusText.textContent = `Searching for "${query}"...`;
    resultsTitle.textContent = `Search Results for "${query}"`;
    resultsContainer.innerHTML = "";

    try {
        const response = await fetch(`/api/games/search?query=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Search failed.");
        }

        if (!data.results.length) {
            statusText.textContent = "No games matched that search.";
            return;
        }

        statusText.textContent = `Found ${data.results.length} games.`;
        data.results.forEach((game) => {
            resultsContainer.appendChild(buildCard(game));
        });
    } catch (error) {
        statusText.textContent = error.message;
    }
});

function buildCard(game) {
    const fragment = cardTemplate.content.cloneNode(true);
    const image = fragment.querySelector(".game-image");
    const title = fragment.querySelector(".game-title");
    const meta = fragment.querySelector(".game-meta");
    const genres = fragment.querySelector(".game-genres");
    const detailsLink = fragment.querySelector(".details-link");
    const favoriteButton = fragment.querySelector(".favorite-button");

    image.src = game.backgroundImage || PLACEHOLDER_IMAGE;
    image.alt = `${game.name} cover art`;
    title.textContent = game.name;
    meta.textContent = `Released: ${game.released || "Unknown"} | Rating: ${game.rating ?? "N/A"}`;
    genres.textContent = game.genres.length ? `Genres: ${game.genres.join(", ")}` : "Genres: N/A";
    detailsLink.href = `/game.html?id=${encodeURIComponent(game.id)}`;

    syncFavoriteButton(favoriteButton, game);
    favoriteButton.addEventListener("click", () => {
        toggleFavorite(game);
        syncFavoriteButton(favoriteButton, game);
    });

    return fragment;
}

function syncFavoriteButton(button, game) {
    if (isFavorite(game.id)) {
        button.textContent = "Remove Favorite";
        button.dataset.state = "saved";
        return;
    }

    button.textContent = "Save Favorite";
    button.dataset.state = "default";
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

    saveFavorites(favorites);
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

function saveFavorites(favorites) {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

async function loadTrendingGames() {
    statusText.textContent = "Loading trending games...";
    resultsTitle.textContent = "Trending Games";
    resultsContainer.innerHTML = "";
    queryInput.value = "";
    
    try {
        const response = await fetch(`/api/games/trending`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to load trending games.");
        }

        if (!data.results.length) {
            statusText.textContent = "No trending games found.";
            return;
        }

        statusText.textContent = "Showing the most popular trending games right now.";
        data.results.forEach((game) => {
            resultsContainer.appendChild(buildCard(game));
        });
    } catch (error) {
        statusText.textContent = error.message;
    }
}
 {
    
}

*//* This file is just for temporary notes and should be ignored. */