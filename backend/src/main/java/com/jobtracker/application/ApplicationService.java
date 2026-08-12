package com.jobtracker.application;

import com.jobtracker.application.dto.ApplicationRequest;
import com.jobtracker.application.dto.ApplicationResponse;
import com.jobtracker.common.error.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Business logic for applications. Every operation is scoped to the owning user;
 * accessing another user's application yields 404 (not 403) so ids can't be
 * enumerated.
 */
@Service
@Transactional
public class ApplicationService {

    private final ApplicationRepository repository;
    private final ApplicationMapper mapper;

    public ApplicationService(ApplicationRepository repository, ApplicationMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public Page<ApplicationResponse> list(Long userId, Pageable pageable) {
        return repository.findByUserId(userId, pageable).map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public ApplicationResponse get(Long userId, Long id) {
        return mapper.toResponse(findOwnedOrThrow(userId, id));
    }

    public ApplicationResponse create(Long userId, ApplicationRequest request) {
        Application application = mapper.toEntity(request);
        application.setUserId(userId);
        return mapper.toResponse(repository.save(application));
    }

    public ApplicationResponse update(Long userId, Long id, ApplicationRequest request) {
        Application existing = findOwnedOrThrow(userId, id);
        mapper.update(request, existing);
        return mapper.toResponse(existing); // flushed on commit (managed entity)
    }

    public void delete(Long userId, Long id) {
        if (!repository.existsByIdAndUserId(id, userId)) {
            throw ResourceNotFoundException.of("Application", id);
        }
        repository.deleteById(id);
    }

    private Application findOwnedOrThrow(Long userId, Long id) {
        return repository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> ResourceNotFoundException.of("Application", id));
    }
}
