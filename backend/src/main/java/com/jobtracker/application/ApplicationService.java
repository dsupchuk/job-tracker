package com.jobtracker.application;

import com.jobtracker.application.dto.ApplicationRequest;
import com.jobtracker.application.dto.ApplicationResponse;
import com.jobtracker.application.dto.StatusHistoryResponse;
import com.jobtracker.common.error.ResourceNotFoundException;
import java.util.List;
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
    private final StatusHistoryRepository historyRepository;
    private final ApplicationMapper mapper;

    public ApplicationService(ApplicationRepository repository,
                              StatusHistoryRepository historyRepository,
                              ApplicationMapper mapper) {
        this.repository = repository;
        this.historyRepository = historyRepository;
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
        Application saved = repository.save(application);

        // The opening entry, so every timeline starts at creation.
        historyRepository.save(StatusHistory.of(saved.getId(), null, saved.getStatus()));
        return mapper.toResponse(saved);
    }

    public ApplicationResponse update(Long userId, Long id, ApplicationRequest request) {
        Application existing = findOwnedOrThrow(userId, id);
        ApplicationStatus previous = existing.getStatus();

        mapper.update(request, existing);
        recordTransition(existing.getId(), previous, existing.getStatus());

        return mapper.toResponse(existing); // flushed on commit (managed entity)
    }

    /**
     * Moves an application to a new status — what a Kanban drop does. Separate
     * from {@link #update} so the board never has to send a full replacement.
     */
    public ApplicationResponse changeStatus(Long userId, Long id, ApplicationStatus status) {
        Application existing = findOwnedOrThrow(userId, id);

        recordTransition(existing.getId(), existing.getStatus(), status);
        existing.setStatus(status);

        return mapper.toResponse(existing);
    }

    @Transactional(readOnly = true)
    public List<StatusHistoryResponse> history(Long userId, Long id) {
        if (!repository.existsByIdAndUserId(id, userId)) {
            throw ResourceNotFoundException.of("Application", id);
        }
        return historyRepository.findByApplicationIdOrderByChangedAtAscIdAsc(id).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public void delete(Long userId, Long id) {
        if (!repository.existsByIdAndUserId(id, userId)) {
            throw ResourceNotFoundException.of("Application", id);
        }
        repository.deleteById(id);
    }

    /** No-op when the status did not actually change — the trail stays meaningful. */
    private void recordTransition(Long applicationId, ApplicationStatus from, ApplicationStatus to) {
        if (from == to) {
            return;
        }
        historyRepository.save(StatusHistory.of(applicationId, from, to));
    }

    private Application findOwnedOrThrow(Long userId, Long id) {
        return repository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> ResourceNotFoundException.of("Application", id));
    }
}
