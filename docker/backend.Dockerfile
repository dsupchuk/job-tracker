# Multi-stage: Maven builds the jar, a slim JRE runs it. The build tooling
# never reaches the runtime image.

FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build

# Dependencies resolve in their own layer, so editing source does not re-download
# the world on every build.
COPY backend/pom.xml .
RUN mvn --batch-mode dependency:go-offline

COPY backend/src ./src
# Tests run in CI against Testcontainers; the image build only packages.
RUN mvn --batch-mode -DskipTests package

FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app

# A non-root user: nothing in here needs to write outside /tmp.
RUN addgroup -S app && adduser -S -G app app
USER app

COPY --from=build /build/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
