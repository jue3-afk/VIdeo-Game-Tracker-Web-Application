//this is the main entry point for the Spring Boot application. 
// It uses the @SpringBootApplication annotation to enable auto-configuration 
// and component scanning, and the @ConfigurationPropertiesScan annotation to allow 
// scanning for configuration properties classes. The main method starts the 
// application by calling SpringApplication.run() with the GameInfoApplication c
// lass and command-line arguments.

package com.gameinfo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class GameInfoApplication {

    public static void main(String[] args) {
        SpringApplication.run(GameInfoApplication.class, args);
    }
}
