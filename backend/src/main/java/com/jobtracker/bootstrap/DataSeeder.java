package com.jobtracker.bootstrap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * Puts the demo account in place at startup when {@code app.demo.seed} is on.
 *
 * <p>A property rather than a profile, because the public demo runs on the
 * {@code prod} profile and still wants the data — while a private deployment of
 * the same image must be able to leave it out.
 */
@Component
@ConditionalOnProperty(name = "app.demo.seed", havingValue = "true")
public class DataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final DemoData demoData;

    public DataSeeder(DemoData demoData) {
        this.demoData = demoData;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (demoData.seedIfAbsent()) {
            log.info("Seeded the demo account ({})", DemoData.EMAIL);
        }
    }
}
