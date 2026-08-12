# ADR 0001 — Backend stack deviations from the original plan

- **Status:** Accepted
- **Date:** 2026-08-12
- **Phase:** 1 (Backend Skeleton)

## Context

The development plan targeted Spring Boot 3.x on Java 21, springdoc-openapi 2.x, and a
Postgres container published on host port 5432. Reality at build time differed on three points.

## Decisions

### 1. Spring Boot 4.1.0 instead of 3.x
Spring Initializr no longer serves 3.x — its compatibility range is now `>= 4.0.0`.
We use **Spring Boot 4.1.0** on Java 21. This is functionally equivalent for this project;
the only visible differences are split starter artifacts (e.g. `spring-boot-starter-webmvc`)
and split test starters.

### 2. springdoc-openapi 3.1.0 instead of 2.x
springdoc-openapi 2.x supports Spring Boot 3 only. The **3.x** line is required for Boot 4,
so the Swagger UI dependency is `springdoc-openapi-starter-webmvc-ui:3.1.0`.

### 3. Postgres published on host port 5433 (container still 5432)
The development machine runs a **native PostgreSQL service on 5432** that shadowed the
container and rejected the container's credentials. To avoid touching the developer's local
install, `docker-compose.yml` maps `5433:5432` and `application.yml` points the datasource at
`localhost:5433` (overridable via `SPRING_DATASOURCE_URL`).

## Consequences

- Anyone cloning the repo connects to Postgres on **5433** locally.
- The datasource URL/credentials are environment-overridable, so production (Neon, Phase 8)
  is unaffected by this local choice.
- No functional impact from the Boot 4 / springdoc 3 upgrades; versions are newer than the
  plan assumed but current and supported.
