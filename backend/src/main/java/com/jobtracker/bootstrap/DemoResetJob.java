package com.jobtracker.bootstrap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Puts the public demo account back the way it started, on a schedule.
 *
 * <p>A demo anyone can open is a demo anyone can empty. Rather than trying to
 * undo individual edits, this deletes the demo user and recreates it.
 *
 * <p>Exists only when {@code app.demo.reset-cron} is set, which keeps it out of
 * local and test runs entirely. It depends on {@link DemoData} rather than on
 * {@link DataSeeder}, so enabling the reset without the seeder cannot fail
 * startup.
 */
@Component
@ConditionalOnProperty(name = "app.demo.reset-cron")
public class DemoResetJob {

    private static final Logger log = LoggerFactory.getLogger(DemoResetJob.class);

    private final DemoData demoData;

    public DemoResetJob(DemoData demoData) {
        this.demoData = demoData;
    }

    @Scheduled(cron = "${app.demo.reset-cron}", zone = "UTC")
    public void reset() {
        demoData.reset();
        log.info("Demo account reset");
    }
}
