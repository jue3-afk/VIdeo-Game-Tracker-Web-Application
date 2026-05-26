package com.gameinfo.dto;

import java.util.List;

public record GameRelatedResponseDto(
        int count,
        List<GameSummaryDto> results
) {
}
