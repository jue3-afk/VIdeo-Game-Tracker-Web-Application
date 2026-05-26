package com.gameinfo.dto;

import java.util.List;

public record GameDetailDto(
        long id,
        String name,
        String released,
        String backgroundImage,
        Double rating,
        Integer metacritic,
        String description,
        String website,
        List<String> genres,
        List<String> platforms
) {
}
