package com.gameinfo.controller;

import com.gameinfo.dto.GameDetailDto;
import com.gameinfo.dto.GameSearchResponseDto;
import com.gameinfo.dto.GameSummaryDto;
import com.gameinfo.service.GameService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(GameController.class)
class GameControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private GameService gameService;

    @Test
    void searchGamesReturnsJson() throws Exception {
        GameSummaryDto game = new GameSummaryDto(1L, "Hades", "2020-09-17", null, 4.8, 93, List.of("Roguelike"));
        Mockito.when(gameService.searchGames("hades", 1, 12))
                .thenReturn(new GameSearchResponseDto(List.of(game), 1, 12));

        mockMvc.perform(get("/api/games/search").param("query", "hades"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.results[0].name").value("Hades"));
    }

    @Test
    void getGameByIdReturnsJson() throws Exception {
        GameDetailDto game = new GameDetailDto(
                1L,
                "Hades",
                "2020-09-17",
                null,
                4.8,
                93,
                "Battle out of hell.",
                "https://www.supergiantgames.com/games/hades/",
                List.of("Action"),
                List.of("PC", "Switch")
        );
        Mockito.when(gameService.getGameById(1L)).thenReturn(game);

        mockMvc.perform(get("/api/games/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Hades"));
    }
}
