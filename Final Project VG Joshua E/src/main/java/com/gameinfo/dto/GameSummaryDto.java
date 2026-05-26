package com.gameinfo.dto;

import java.util.List;

public record GameSummaryDto(
        long id,
        String name,
        String released,
        String backgroundImage,
        Double rating,
        Integer metacritic,
        List<String> genres
) {
}
