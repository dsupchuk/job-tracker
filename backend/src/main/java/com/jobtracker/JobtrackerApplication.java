package com.jobtracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/** Scheduling is on for the demo reset job; it is inert when nothing is scheduled. */
@SpringBootApplication
@EnableScheduling
public class JobtrackerApplication {

    public static void main(String[] args) {
        SpringApplication.run(JobtrackerApplication.class, args);
    }
}
