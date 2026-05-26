//this class is responsible for communicating with the external game API.
// It uses Spring's RestClient to make HTTP requests to the API, and maps the JSON
// responses into Java record classes. It also handles errors that may occur during API calls,
// throwing custom exceptions with meaningful messages when something goes wrong.



package com.gameinfo.integration;

import java.net.URI;
import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.gameinfo.config.GameApiProperties;
import com.gameinfo.exception.ExternalApiException;

@Component
public class GameApiClient {

    private final RestClient restClient;
    private final GameApiProperties properties;

    public GameApiClient(RestClient restClient, GameApiProperties properties) {
        this.restClient = restClient;
        this.properties = properties;
    }

    public GameSearchApiResponse searchGames(String query, int page, int pageSize) {
        URI uri = UriComponentsBuilder.fromHttpUrl(properties.baseUrl())
                .path(properties.searchPath())
                .queryParam("key", requireApiKey())
                .queryParam("search", query)
                .queryParam("page", page)
                .queryParam("page_size", pageSize)
                .build()
                .toUri();

        try {
            GameSearchApiResponse response = restClient.get()
                    .uri(uri)
                    .retrieve()
                    .body(GameSearchApiResponse.class);

            if (response == null) {
                throw new ExternalApiException("The game API returned an empty search response.");
            }

            return response;
        } catch (Exception exception) {
            throw new ExternalApiException("Unable to search the external game API.");
        }
    }

    public GameSearchApiResponse getGamesByGenre(String genre, int pageSize) {
        URI uri = UriComponentsBuilder.fromHttpUrl(properties.baseUrl())
                .path(properties.searchPath())
                .queryParam("key", requireApiKey())
                .queryParam("genres", genre)
                .queryParam("ordering", "-added")
                .queryParam("page_size", pageSize)
                .build()
                .toUri();

        try {
            GameSearchApiResponse response = restClient.get()
                    .uri(uri)
                    .retrieve()
                    .body(GameSearchApiResponse.class);

            if (response == null) {
                throw new ExternalApiException("The game API returned an empty genre response.");
            }

            return response;
        } catch (Exception exception) {
            throw new ExternalApiException("Unable to load games for the selected genre.");
        }
    }

    public GameDetailApiResponse getGameById(long id) {
        URI uri = UriComponentsBuilder.fromHttpUrl(properties.baseUrl())
                .path(properties.searchPath())
                .pathSegment(String.valueOf(id))
                .queryParam("key", requireApiKey())
                .build()
                .toUri();

        try {
            GameDetailApiResponse response = restClient.get()
                    .uri(uri)
                    .retrieve()
                    .body(GameDetailApiResponse.class);

            if (response == null) {
                throw new ExternalApiException("The game API returned an empty game details response.");
            }

            return response;
        } catch (Exception exception) {
            throw new ExternalApiException("Unable to load game details from the external game API.");
        }
    }

    public GameSearchApiResponse getParentGamesForDlc(long id) {
        URI uri = UriComponentsBuilder.fromHttpUrl(properties.baseUrl())
                .path(properties.searchPath())
                .pathSegment(String.valueOf(id), "parent-games")
                .queryParam("key", requireApiKey())
                .build()
                .toUri();

        try {
            GameSearchApiResponse response = restClient.get()
                    .uri(uri)
                    .retrieve()
                    .body(GameSearchApiResponse.class);

            if (response == null) {
                throw new ExternalApiException("The game API returned an empty parent games response.");
            }

            return response;
        } catch (Exception exception) {
            throw new ExternalApiException("Unable to load parent games from the external game API.");
        }
    }

    private String requireApiKey() {
        if (!StringUtils.hasText(properties.key())) {
            throw new ExternalApiException("Missing API key. Set GAME_API_KEY before starting the app.");
        }
        return properties.key();
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record GameSearchApiResponse(
            @JsonProperty("count") Integer count,
            List<GameApiItem> results
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record GameDetailApiResponse(
            long id,
            String name,
            String released,
            @JsonProperty("background_image") String backgroundImage,
            Double rating,
            Integer metacritic,
            @JsonProperty("description_raw") String description,
            String website,
            List<GenreApiItem> genres,
            List<PlatformEntryApiItem> platforms
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record GameApiItem(
            long id,
            String name,
            String released,
            @JsonProperty("background_image") String backgroundImage,
            Double rating,
            Integer metacritic,
            List<GenreApiItem> genres
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record GenreApiItem(String name) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record PlatformEntryApiItem(PlatformApiItem platform) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record PlatformApiItem(String name) {
    }


    public GameSearchApiResponse getTrendingGames(int pageSize) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusMonths(6);

        URI uri = UriComponentsBuilder.fromHttpUrl(properties.baseUrl())
                .path(properties.searchPath())
                .queryParam("key", requireApiKey())
                .queryParam("dates", startDate + "," + endDate)
                .queryParam("ordering", "-added")
                .queryParam("page_size", pageSize)
                .build()
                .toUri();

        try {
            GameSearchApiResponse response = restClient.get()
                    .uri(uri)
                    .retrieve()
                    .body(GameSearchApiResponse.class);

            if (response == null) {
                throw new ExternalApiException("The game API returned an empty trending games response.");
            }

            return response;
        } catch (Exception exception) {
            throw new ExternalApiException("Unable to load trending games from the external game API: "
                    + exception.getMessage());
        }
    }
}
