package com.jobtracker.application;

import com.jobtracker.application.dto.ApplicationRequest;
import com.jobtracker.application.dto.ApplicationResponse;
import com.jobtracker.user.User;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * CRUD endpoints for the authenticated user's applications. The owner is taken
 * from the JWT principal, never from the request body.
 */
@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationService service;

    public ApplicationController(ApplicationService service) {
        this.service = service;
    }

    @GetMapping
    public Page<ApplicationResponse> list(@AuthenticationPrincipal User user, Pageable pageable) {
        return service.list(user.getId(), pageable);
    }

    @GetMapping("/{id}")
    public ApplicationResponse get(@AuthenticationPrincipal User user, @PathVariable Long id) {
        return service.get(user.getId(), id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApplicationResponse create(@AuthenticationPrincipal User user,
                                      @Valid @RequestBody ApplicationRequest request) {
        return service.create(user.getId(), request);
    }

    @PutMapping("/{id}")
    public ApplicationResponse update(@AuthenticationPrincipal User user, @PathVariable Long id,
                                      @Valid @RequestBody ApplicationRequest request) {
        return service.update(user.getId(), id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal User user, @PathVariable Long id) {
        service.delete(user.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
