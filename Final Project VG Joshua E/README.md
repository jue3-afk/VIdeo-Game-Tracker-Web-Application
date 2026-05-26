# Game Info App

A Spring Boot starter for a video game information web app.

## Stack

- Java 17
- Spring Boot
- REST API integration
- Static frontend served by Spring Boot

## Project Structure

- `src/main/java/com/gameinfo` - Java source
- `src/main/resources/static` - HTML/CSS/JS frontend
- `src/test/java/com/gameinfo` - starter tests

## Endpoints

- `GET /api/games/search?query=zelda&page=1&pageSize=12`
- `GET /api/games/{id}`

## External API Setup

This starter is wired for a RAWG-style games API.

Set your key before running:

```powershell
$env:GAME_API_KEY="your-key-here"
```

Optional overrides:

```powershell
$env:GAME_API_BASE_URL="https://api.rawg.io/api"
$env:GAME_API_SEARCH_PATH="/games"
```

## Run

```powershell
./mvnw spring-boot:run
```

or if Maven is installed:

```powershell
mvn spring-boot:run
```
