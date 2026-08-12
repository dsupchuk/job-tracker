package com.jobtracker.bootstrap;

import com.jobtracker.application.Application;
import com.jobtracker.application.ApplicationRepository;
import com.jobtracker.application.ApplicationStatus;
import com.jobtracker.user.Role;
import com.jobtracker.user.User;
import com.jobtracker.user.UserRepository;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeds a demo account and ~20 sample applications on the {@code dev} profile.
 * Idempotent: does nothing if the demo user already exists.
 */
@Component
@Profile("dev")
public class DataSeeder implements ApplicationRunner {

    private static final String DEMO_EMAIL = "demo@demo.com";
    private static final String DEMO_PASSWORD = "demo";

    private final UserRepository userRepository;
    private final ApplicationRepository applicationRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, ApplicationRepository applicationRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.applicationRepository = applicationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.existsByEmail(DEMO_EMAIL)) {
            return;
        }

        User demo = new User();
        demo.setEmail(DEMO_EMAIL);
        demo.setPassword(passwordEncoder.encode(DEMO_PASSWORD));
        demo.setRole(Role.USER);
        demo = userRepository.save(demo);

        applicationRepository.saveAll(sampleApplications(demo.getId()));
    }

    private List<Application> sampleApplications(Long userId) {
        String[][] rows = {
                {"Backend Engineer", "Stripe", "SCREENING", "120000", "160000", "Java, Spring, PostgreSQL"},
                {"Platform Engineer", "Datadog", "APPLIED", "130000", "170000", "Go, Kubernetes, AWS"},
                {"Full Stack Developer", "Shopify", "INTERVIEW", "110000", "150000", "React, Node, GraphQL"},
                {"Senior Java Developer", "Atlassian", "OFFER", "140000", "180000", "Java, Kafka, AWS"},
                {"Software Engineer", "Cloudflare", "REJECTED", "115000", "155000", "Rust, TypeScript"},
                {"Backend Developer", "GitLab", "APPLIED", "105000", "145000", "Ruby, Go, PostgreSQL"},
                {"DevOps Engineer", "HashiCorp", "SAVED", "125000", "165000", "Terraform, AWS, Docker"},
                {"Java Engineer", "Netflix", "SCREENING", "150000", "200000", "Java, Spring, Cassandra"},
                {"API Engineer", "Twilio", "INTERVIEW", "120000", "160000", "Java, gRPC, Kafka"},
                {"Software Engineer II", "Airbnb", "APPLIED", "135000", "175000", "Java, React, MySQL"},
                {"Backend Engineer", "Reddit", "REJECTED", "118000", "158000", "Python, Go, PostgreSQL"},
                {"Senior Backend Engineer", "Coinbase", "SCREENING", "160000", "210000", "Go, gRPC, AWS"},
                {"Platform Developer", "MongoDB", "SAVED", "122000", "162000", "Java, Spring, MongoDB"},
                {"Software Engineer", "Elastic", "INTERVIEW", "128000", "168000", "Java, Lucene, Kubernetes"},
                {"Backend Engineer", "Figma", "OFFER", "145000", "190000", "TypeScript, Rust, PostgreSQL"},
                {"Java Backend Developer", "PayPal", "APPLIED", "112000", "152000", "Java, Spring, Oracle"},
                {"Full Stack Engineer", "Notion", "SAVED", "130000", "170000", "React, Node, PostgreSQL"},
                {"Software Engineer", "Databricks", "SCREENING", "150000", "195000", "Scala, Spark, AWS"},
                {"Backend Engineer", "Snowflake", "APPLIED", "148000", "188000", "Java, Kafka, AWS"},
                {"Senior Software Engineer", "Confluent", "INTERVIEW", "155000", "205000", "Java, Kafka, Kubernetes"},
        };

        List<Application> applications = new ArrayList<>();
        for (int i = 0; i < rows.length; i++) {
            String[] r = rows[i];
            Application application = new Application();
            application.setUserId(userId);
            application.setPosition(r[0] + " @ " + r[1]);
            application.setStatus(ApplicationStatus.valueOf(r[2]));
            application.setSalaryMin(Integer.valueOf(r[3]));
            application.setSalaryMax(Integer.valueOf(r[4]));
            application.setTechStack(r[5]);
            application.setSourceUrl("https://example.com/jobs/" + (i + 1));
            if (application.getStatus() != ApplicationStatus.SAVED) {
                application.setAppliedAt(LocalDate.now().minusDays(rows.length - i));
            }
            applications.add(application);
        }
        return applications;
    }
}
