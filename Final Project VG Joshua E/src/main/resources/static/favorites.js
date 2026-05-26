//this script manages the favorites page, allowing users to view and remove their favorite games stored in localStorage.

// Key used to store and retrieve the list of favorite games in localStorage.
const FAVORITES_KEY = "game-info-favorites";
//for when a game doesn't have an image, use this placeholder instead
const PLACEHOLDER_IMAGE = "https://placehold.co/640x400/10203a/eaf2ff?text=No+Image";

const statusText = document.getElementById("favorites-status");
const resultsContainer = document.getElementById("favorites-results");
const cardTemplate = document.getElementById("favorite-card-template");

if (statusText && resultsContainer && cardTemplate) {
    renderFavorites();
}
// Renders the list of favorite games from localStorage, or shows a message if there are none.
function renderFavorites() {
    const favorites = getFavorites();
    resultsContainer.innerHTML = "";

    if (!favorites.length) {
        statusText.textContent = "You have not saved any favorites yet.";
        return;
    }

    statusText.textContent = `\n Favorite Games: ${favorites.length} ${favorites.length === 1 ? "" : "s"}.`;
    favorites.forEach((game) => {
        resultsContainer.appendChild(buildCard(game));
    });
}
// Builds a DOM element for a single game card, including image, title, meta info, genres, and action buttons.
function buildCard(game) {
    const fragment = cardTemplate.content.cloneNode(true);
    const image = fragment.querySelector(".game-image");
    const title = fragment.querySelector(".game-title");
    const meta = fragment.querySelector(".game-meta");
    const genres = fragment.querySelector(".game-genres");
    const detailsLink = fragment.querySelector(".favorite-link");
    const favoriteButton = fragment.querySelector(".favorite-button");

    image.src = game.backgroundImage || PLACEHOLDER_IMAGE;
    image.alt = `${game.name} cover art`;
    title.textContent = game.name;
    meta.textContent = `Released: ${game.released || "Unknown"} | Rating: ${game.rating ?? "N/A"}`;
    genres.textContent = game.genres && game.genres.length ? `Genres: ${game.genres.join(", ")}` : "Genres: N/A";
    detailsLink.href = `/game.html?id=${encodeURIComponent(game.id)}`;

    favoriteButton.addEventListener("click", () => {
        removeFavorite(game.id);
        renderFavorites();
    });

    return fragment;
}
//removes a game from the favorites list in localStorage by filtering it out and saving the updated list back to localStorage.
function removeFavorite(id) {
    const updatedFavorites = getFavorites().filter((favorite) => favorite.id !== id);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
}
// Retrieves the list of favorite games from localStorage, parsing the JSON string into an array. If there are no favorites or if parsing fails, it returns an empty array.
function getFavorites() {
    try {
        const rawFavorites = localStorage.getItem(FAVORITES_KEY);
        return rawFavorites ? JSON.parse(rawFavorites) : [];
    } catch (error) {
        return [];
    }
}
