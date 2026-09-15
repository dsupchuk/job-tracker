package com.jobtracker.auth;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import com.jobtracker.support.IntegrationTest;
import com.jobtracker.support.TestAccounts;
import com.jobtracker.support.TestAccounts.Account;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

/** register → login → reach a protected endpoint → refresh → reach it again. */
class AuthFlowIntegrationTest extends IntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    private String login(String email, String password) throws Exception {
        String response = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"%s","password":"%s"}""".formatted(email, password)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return JsonPath.read(response, "$.accessToken");
    }

    @Test
    @DisplayName("a new account can register, log in, and use the token it is given")
    void registerThenLogin() throws Exception {
        Account account = TestAccounts.register(mockMvc);

        mockMvc.perform(get("/api/applications").header("Authorization", account.bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(0));

        String token = login(account.email(), account.password());
        mockMvc.perform(get("/api/applications").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("a refresh token buys a new access token that works")
    void refreshIssuesUsableToken() throws Exception {
        Account account = TestAccounts.register(mockMvc);

        String refreshed = mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"refreshToken":"%s"}""".formatted(account.refreshToken())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andReturn()
                .getResponse()
                .getContentAsString();

        mockMvc.perform(get("/api/applications")
                        .header("Authorization", "Bearer " + JsonPath.read(refreshed, "$.accessToken")))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("an access token cannot be used in place of a refresh token")
    void accessTokenIsRejectedByRefresh() throws Exception {
        Account account = TestAccounts.register(mockMvc);

        // The two differ only by lifetime and a `type` claim; that claim is the
        // whole defence, so it is worth a test of its own.
        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"refreshToken":"%s"}""".formatted(account.accessToken())))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("registering an email twice is rejected")
    void duplicateEmailIsRejected() throws Exception {
        Account account = TestAccounts.register(mockMvc);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"%s","password":"another"}""".formatted(account.email())))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("CONFLICT"));
    }

    @Test
    @DisplayName("the wrong password does not get a token")
    void wrongPasswordIsRejected() throws Exception {
        Account account = TestAccounts.register(mockMvc);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"%s","password":"definitely-wrong"}""".formatted(account.email())))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"));
    }
}
