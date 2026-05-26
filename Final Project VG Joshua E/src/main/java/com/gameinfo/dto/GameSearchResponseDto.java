package com.gameinfo.dto;

import java.util.List;

public record GameSearchResponseDto(
        List<GameSummaryDto> results,
        int page,
        int pageSize
) {
}
