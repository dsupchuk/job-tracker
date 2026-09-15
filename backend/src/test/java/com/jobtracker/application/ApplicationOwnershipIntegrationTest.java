package com.jobtracker.application;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
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

/**
 * One user must not be able to see, change or even detect another's records.
 * Every route answers 404 rather than 403, so ids cannot be enumerated by
 * watching which ones come back "forbidden".
 */
class ApplicationOwnershipIntegrationTest extends IntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    private Integer createApplication(Account owner, String position) throws Exception {
        String response = mockMvc.perform(post("/api/applications")
                        .header("Authorization", owner.bearer())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"position":"%s","company":"Acme","status":"APPLIED"}""".formatted(position)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return JsonPath.read(response, "$.id");
    }

    @Test
    @DisplayName("a list only ever contains the caller's own applications")
    void listIsScopedToTheOwner() throws Exception {
        Account alice = TestAccounts.register(mockMvc);
        Account bob = TestAccounts.register(mockMvc);

        createApplication(alice, "Alice's role");

        mockMvc.perform(get("/api/applications").header("Authorization", alice.bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].position").value("Alice's role"));

        mockMvc.perform(get("/api/applications").header("Authorization", bob.bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(0));
    }

    @Test
    @DisplayName("every route on someone else's application answers 404, never 403")
    void foreignApplicationIsInvisible() throws Exception {
        Account alice = TestAccounts.register(mockMvc);
        Account bob = TestAccounts.register(mockMvc);
        Integer id = createApplication(alice, "Alice's role");

        String body = """
                {"position":"hijacked","status":"OFFER"}""";

        mockMvc.perform(get("/api/applications/" + id).header("Authorization", bob.bearer()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("RESOURCE_NOT_FOUND"));

        mockMvc.perform(put("/api/applications/" + id)
                        .header("Authorization", bob.bearer())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isNotFound());

        mockMvc.perform(patch("/api/applications/" + id + "/status")
                        .header("Authorization", bob.bearer())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"status":"OFFER"}"""))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/applications/" + id + "/history")
                        .header("Authorization", bob.bearer()))
                .andExpect(status().isNotFound());

        mockMvc.perform(delete("/api/applications/" + id).header("Authorization", bob.bearer()))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("a failed hijack leaves the owner's record untouched")
    void ownersRecordSurvivesAnAttempt() throws Exception {
        Account alice = TestAccounts.register(mockMvc);
        Account bob = TestAccounts.register(mockMvc);
        Integer id = createApplication(alice, "Alice's role");

        mockMvc.perform(delete("/api/applications/" + id).header("Authorization", bob.bearer()))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/applications/" + id).header("Authorization", alice.bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.position").value("Alice's role"))
                .andExpect(jsonPath("$.status").value("APPLIED"));
    }
}
