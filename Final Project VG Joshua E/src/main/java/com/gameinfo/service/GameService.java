//this is the service layer of the application, responsible for handling business logic related to games.
// It uses the GameApiClient to fetch data from the external game API, 
// and transforms the API responses into DTOs that can be returned to the controller layer.


package com.gameinfo.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.gameinfo.dto.GameDetailDto;
import com.gameinfo.dto.GameRelatedResponseDto;
import com.gameinfo.dto.GameSearchResponseDto;
import com.gameinfo.dto.GameSummaryDto;
import com.gameinfo.integration.GameApiClient;

@Service
public class GameService {

    private final GameApiClient gameApiClient;

    public GameService(GameApiClient gameApiClient) {
        this.gameApiClient = gameApiClient;
    }

    public GameSearchResponseDto searchGames(String query, int page, int pageSize) {
        GameApiClient.GameSearchApiResponse response = gameApiClient.searchGames(query, page, pageSize);
        return new GameSearchResponseDto(mapResults(response), page, pageSize);
    }

    public GameRelatedResponseDto getParentGamesForDlc(long id) {
        GameApiClient.GameSearchApiResponse response = gameApiClient.getParentGamesForDlc(id);
        List<GameSummaryDto> results = response.results() == null ? List.of() : response.results()
                .stream()
                .map(game -> new GameSummaryDto(
                        game.id(),
                        game.name(),
                        game.released(),
                        game.backgroundImage(),
                        game.rating(),
                        game.metacritic(),
                        game.genres() == null ? List.of() : game.genres().stream()
                                .map(GameApiClient.GenreApiItem::name)
                                .toList()
                ))
                .toList();

        return new GameRelatedResponseDto(response.count() == null ? results.size() : response.count(), results);
    }

    public GameDetailDto getGameById(long id) {
        GameApiClient.GameDetailApiResponse game = gameApiClient.getGameById(id);

        return new GameDetailDto(
                game.id(),
                game.name(),
                game.released(),
                game.backgroundImage(),
                game.rating(),
                game.metacritic(),
                game.description(),
                game.website(),
                game.genres() == null ? List.of() : game.genres().stream()
                        .map(GameApiClient.GenreApiItem::name)
                        .toList(),
                game.platforms() == null ? List.of() : game.platforms().stream()
                        .map(GameApiClient.PlatformEntryApiItem::platform)
                        .filter(platform -> platform != null && platform.name() != null)
                        .map(GameApiClient.PlatformApiItem::name)
                        .toList()
        );
    }


    public GameSearchResponseDto getTrendingGames(int pageSize) {
        GameApiClient.GameSearchApiResponse response = gameApiClient.getTrendingGames(pageSize);
        return new GameSearchResponseDto(mapResults(response), 1, pageSize);
    }

    public GameSearchResponseDto getGamesByGenre(String genre, int pageSize) {
        GameApiClient.GameSearchApiResponse response = gameApiClient.getGamesByGenre(genre, pageSize);
        return new GameSearchResponseDto(mapResults(response), 1, pageSize);
    }

    private List<GameSummaryDto> mapResults(GameApiClient.GameSearchApiResponse response) {
        return response.results() == null ? List.of() : response.results()
                .stream()
                .map(game -> new GameSummaryDto(
                        game.id(),
                        game.name(),
                        game.released(),
                        game.backgroundImage(),
                        game.rating(),
                        game.metacritic(),
                        game.genres() == null ? List.of() : game.genres().stream()
                                .map(GameApiClient.GenreApiItem::name)
                                .toList()
                ))
                .toList();
    }
}
