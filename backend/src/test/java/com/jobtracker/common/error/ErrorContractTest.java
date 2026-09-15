package com.jobtracker.common.error;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jobtracker.support.IntegrationTest;
import com.jobtracker.support.TestAccounts;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Every failure must come back in the {@link ApiError} shape with the right
 * status. This exists because it once did not: an unreadable body produced a
 * 401, because Spring rendered the error through a forward to {@code /error}
 * that the security chain rejected — making every client mistake look like an
 * expired token to the frontend, which answered by refreshing and retrying.
 */
class ErrorContractTest extends IntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    private String bearer;

    /** A fresh account owns nothing, which several of these cases rely on. */
    private String bearer() throws Exception {
        if (bearer == null) {
            bearer = TestAccounts.register(mockMvc).bearer();
        }
        return bearer;
    }

    @Test
    @DisplayName("malformed JSON is a 400, not a 401")
    void malformedJson() throws Exception {
        mockMvc.perform(post("/api/applications")
                        .header("Authorization", bearer())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"position\":"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("MALFORMED_REQUEST"))
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    @DisplayName("an unknown enum constant is a 400, not a 401")
    void unknownEnumConstant() throws Exception {
        mockMvc.perform(patch("/api/applications/1/status")
                        .header("Authorization", bearer())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"BOGUS\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("MALFORMED_REQUEST"));
    }

    @Test
    @DisplayName("a failed constraint reports the offending field")
    void validationFailure() throws Exception {
        mockMvc.perform(post("/api/applications")
                        .header("Authorization", bearer())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"position\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.fieldErrors[0].field").value("position"));
    }

    @Test
    @DisplayName("an unknown route uses the ApiError shape")
    void unknownRoute() throws Exception {
        mockMvc.perform(get("/api/does-not-exist").header("Authorization", bearer()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("NOT_FOUND"))
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    @DisplayName("an unsupported method uses the ApiError shape")
    void unsupportedMethod() throws Exception {
        mockMvc.perform(delete("/api/applications").header("Authorization", bearer()))
                .andExpect(status().isMethodNotAllowed())
                .andExpect(jsonPath("$.code").value("METHOD_NOT_ALLOWED"));
    }

    @Test
    @DisplayName("an unsupported content type uses the ApiError shape")
    void unsupportedMediaType() throws Exception {
        mockMvc.perform(post("/api/applications")
                        .header("Authorization", bearer())
                        .contentType(MediaType.TEXT_PLAIN)
                        .content("hello"))
                .andExpect(status().isUnsupportedMediaType())
                .andExpect(jsonPath("$.code").value("UNSUPPORTED_MEDIA_TYPE"));
    }

    @Test
    @DisplayName("a missing token is still a 401")
    void missingToken() throws Exception {
        mockMvc.perform(get("/api/applications"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHENTICATED"));
    }

    @Test
    @DisplayName("an application that does not exist is a 404")
    void missingApplicationIsNotFound() throws Exception {
        mockMvc.perform(get("/api/applications/999999").header("Authorization", bearer()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("RESOURCE_NOT_FOUND"));
    }

    @Test
    @DisplayName("bad credentials are reported as such")
    void badCredentials() throws Exception {
        String email = TestAccounts.register(mockMvc).email();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"%s","password":"definitely-wrong"}""".formatted(email)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"));
    }
}
