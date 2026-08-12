package com.jobtracker.application;

import com.jobtracker.application.dto.ApplicationRequest;
import com.jobtracker.application.dto.ApplicationResponse;
import com.jobtracker.common.error.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Business logic for applications. Controllers stay thin and delegate here.
 * All input/output crosses the boundary as DTOs — entities never leak out.
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
    public Page<ApplicationResponse> list(Pageable pageable) {
        return repository.findAll(pageable).map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public ApplicationResponse get(Long id) {
        return mapper.toResponse(findOrThrow(id));
    }

    public ApplicationResponse create(ApplicationRequest request) {
        Application saved = repository.save(mapper.toEntity(request));
        return mapper.toResponse(saved);
    }

    public ApplicationResponse update(Long id, ApplicationRequest request) {
        Application existing = findOrThrow(id);
        mapper.update(request, existing);
        return mapper.toResponse(existing); // flushed on commit (managed entity)
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw ResourceNotFoundException.of("Application", id);
        }
        repository.deleteById(id);
    }

    private Application findOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Application", id));
    }
}
