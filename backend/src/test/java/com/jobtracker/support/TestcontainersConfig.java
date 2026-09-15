package com.jobtracker.support;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.utility.DockerImageName;

/**
 * The database every integration test runs against.
 *
 * <p>Deliberately a top-level class rather than one nested in
 * {@link IntegrationTest}: a nested {@code @TestConfiguration} is also picked up
 * as a default configuration class, so importing it as well would register it
 * twice. Spring currently ignores the duplicate and warns; from Framework 7.1
 * it will not.
 */
@TestConfiguration(proxyBeanMethods = false)
public class TestcontainersConfig {

    @Bean
    @ServiceConnection
    PostgreSQLContainer<?> postgres() {
        return new PostgreSQLContainer<>(DockerImageName.parse("postgres:16"));
    }
}
