package com.jobtracker.bootstrap;

import static org.assertj.core.api.Assertions.assertThat;

import com.jobtracker.application.ApplicationRepository;
import com.jobtracker.application.StatusHistoryRepository;
import com.jobtracker.support.IntegrationTest;
import com.jobtracker.user.User;
import com.jobtracker.user.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * The public demo is reset on a schedule, so the reset has to be correct without
 * anyone watching it. Cron cannot be triggered by hand, which is exactly why
 * this is a test rather than a manual check.
 */
class DemoDataTest extends IntegrationTest {

    @Autowired
    private DemoData demoData;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private StatusHistoryRepository statusHistoryRepository;

    @AfterEach
    void removeDemoAccount() {
        userRepository.findByEmail(DemoData.EMAIL).ifPresent(userRepository::delete);
    }

    private Long demoUserId() {
        return userRepository.findByEmail(DemoData.EMAIL).map(User::getId).orElseThrow();
    }

    private long demoApplicationCount() {
        return applicationRepository.findByUserId(demoUserId(), org.springframework.data.domain.Pageable.unpaged())
                .getTotalElements();
    }

    @Test
    @DisplayName("seeding creates the account once and does nothing on a second run")
    void seedingIsIdempotent() {
        assertThat(demoData.seedIfAbsent()).isTrue();
        long afterFirst = demoApplicationCount();

        assertThat(demoData.seedIfAbsent()).isFalse();
        assertThat(demoApplicationCount()).isEqualTo(afterFirst);
    }

    @Test
    @DisplayName("resetting discards whatever visitors did and restores the sample data")
    void resetRestoresTheOriginalData() {
        demoData.seedIfAbsent();
        long seeded = demoApplicationCount();
        assertThat(seeded).isPositive();

        // Stand in for a visitor emptying the demo.
        applicationRepository.deleteAll(
                applicationRepository.findByUserId(
                        demoUserId(), org.springframework.data.domain.Pageable.unpaged()).getContent());
        assertThat(demoApplicationCount()).isZero();

        demoData.reset();

        assertThat(demoApplicationCount()).isEqualTo(seeded);
    }

    @Test
    @DisplayName("resetting leaves no orphaned history behind")
    void resetCascadesCleanly() {
        demoData.seedIfAbsent();
        Long firstId = applicationRepository
                .findByUserId(demoUserId(), org.springframework.data.domain.Pageable.unpaged())
                .getContent()
                .getFirst()
                .getId();

        long historyBefore = statusHistoryRepository.count();
        demoData.reset();

        // The old rows are gone rather than accumulating on every nightly run.
        assertThat(statusHistoryRepository.findByApplicationIdOrderByChangedAtAscIdAsc(firstId)).isEmpty();
        assertThat(statusHistoryRepository.count()).isEqualTo(historyBefore);
    }
}
