package com.gameinfo.controller;

import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gameinfo.dto.GameDetailDto;
import com.gameinfo.dto.GameRelatedResponseDto;
import com.gameinfo.dto.GameSearchResponseDto;
import com.gameinfo.service.GameService;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

@Validated
@RestController
@RequestMapping("/api/games")
public class GameController {

    private final GameService gameService;

    public GameController(GameService gameService) {
        this.gameService = gameService;
    }

    @GetMapping("/search")
    public GameSearchResponseDto searchGames(
            @RequestParam @NotBlank String query,
            @RequestParam(defaultValue = "1") @Min(1) int page,
            @RequestParam(defaultValue = "12") @Min(1) @Max(40) int pageSize
    ) {
        return gameService.searchGames(query, page, pageSize);
    }

    @GetMapping("/genre")
    public GameSearchResponseDto getGamesByGenre(
            @RequestParam @NotBlank String genre,
            @RequestParam(defaultValue = "12") @Min(1) @Max(40) int pageSize
    ) {
        return gameService.getGamesByGenre(genre, pageSize);
    }

    @GetMapping("/{id}")
    public GameDetailDto getGameById(@PathVariable long id) {
        return gameService.getGameById(id);
    }

    @GetMapping("/{id}/parent-games")
    public GameRelatedResponseDto getParentGamesForDlc(@PathVariable long id) {
        return gameService.getParentGamesForDlc(id);
    }
    @GetMapping("/{id}/dlcs")
    public GameRelatedResponseDto getDlcsForParentGame(@PathVariable long id) {
        return gameService.getParentGamesForDlc(id);
    }
    
    @GetMapping("/trending")
    public GameSearchResponseDto getTrendingGames(){

        return gameService.getTrendingGames(30);
    }
}
