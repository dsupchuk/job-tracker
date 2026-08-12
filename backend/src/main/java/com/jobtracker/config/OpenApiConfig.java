package com.jobtracker.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI metadata shown at the top of the Swagger UI / generated spec.
 */
@Configuration
public class OpenApiConfig {

    @Bean
    OpenAPI jobTrackerOpenApi() {
        return new OpenAPI().info(new Info()
                .title("Job Application Tracker API")
                .description("REST API for tracking job applications.")
                .version("v1"));
    }
}
