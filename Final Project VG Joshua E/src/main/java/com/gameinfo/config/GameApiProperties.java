package com.gameinfo.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "game.api")
public record GameApiProperties(
        String baseUrl,
        String key,
        String searchPath
) {
}
