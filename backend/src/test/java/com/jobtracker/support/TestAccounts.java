package com.jobtracker.support;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import java.util.UUID;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Registers throwaway accounts through the real auth endpoints, so tests
 * exercise the same path a user would rather than inserting rows behind it.
 */
public final class TestAccounts {

    public record Account(String email, String password, String accessToken, String refreshToken) {

        public String bearer() {
            return "Bearer " + accessToken;
        }
    }

    private TestAccounts() {
    }

    public static Account register(MockMvc mockMvc) throws Exception {
        String email = "test-" + UUID.randomUUID() + "@example.com";
        return register(mockMvc, email, "secret");
    }

    public static Account register(MockMvc mockMvc, String email, String password) throws Exception {
        String body = """
                {"email":"%s","password":"%s"}""".formatted(email, password);

        String response = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        return new Account(
                email,
                password,
                JsonPath.read(response, "$.accessToken"),
                JsonPath.read(response, "$.refreshToken"));
    }
}
