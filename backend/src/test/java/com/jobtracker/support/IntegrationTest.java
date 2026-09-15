package com.jobtracker.support;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

/**
 * Base class for integration tests: a real PostgreSQL in a container, migrated
 * by Flyway exactly as production is.
 *
 * <p>Two things this buys that an in-memory database would not. The migrations
 * themselves are exercised — {@code V3} splits company out of the position
 * string with {@code split_part}, which H2 does not have — and the tests stop
 * touching the developer's local database. Until now they registered accounts
 * in it and had to clean up after themselves.
 *
 * <p>Spring caches the application context across test classes, so the image
 * starts once per build rather than once per class. The {@code test} profile
 * keeps {@code DataSeeder} out: integration tests create the data they assert on.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestcontainersConfig.class)
public abstract class IntegrationTest {
}
