package com.jobtracker.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.jobtracker.application.dto.ApplicationRequest;
import com.jobtracker.common.error.ResourceNotFoundException;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/**
 * The rules that do not need a database: who a record belongs to, and exactly
 * when a status transition is worth recording.
 */
@ExtendWith(MockitoExtension.class)
class ApplicationServiceTest {

    private static final Long USER_ID = 7L;
    private static final Long APPLICATION_ID = 42L;

    @Mock
    private ApplicationRepository repository;

    @Mock
    private StatusHistoryRepository historyRepository;

    @Mock
    private ApplicationMapper mapper;

    @InjectMocks
    private ApplicationService service;

    private Application existing(ApplicationStatus status) {
        Application application = new Application();
        application.setId(APPLICATION_ID);
        application.setUserId(USER_ID);
        application.setPosition("Backend Engineer");
        application.setStatus(status);
        return application;
    }

    @Test
    @DisplayName("moving to a new status records the transition and applies it")
    void changeStatusRecordsTheTransition() {
        Application application = existing(ApplicationStatus.APPLIED);
        when(repository.findByIdAndUserId(APPLICATION_ID, USER_ID)).thenReturn(Optional.of(application));

        service.changeStatus(USER_ID, APPLICATION_ID, ApplicationStatus.INTERVIEW);

        ArgumentCaptor<StatusHistory> entry = ArgumentCaptor.forClass(StatusHistory.class);
        verify(historyRepository).save(entry.capture());
        assertThat(entry.getValue().getFromStatus()).isEqualTo(ApplicationStatus.APPLIED);
        assertThat(entry.getValue().getToStatus()).isEqualTo(ApplicationStatus.INTERVIEW);
        assertThat(application.getStatus()).isEqualTo(ApplicationStatus.INTERVIEW);
    }

    @Test
    @DisplayName("moving to the status it already has records nothing")
    void changeStatusToTheSameValueIsANoOp() {
        Application application = existing(ApplicationStatus.INTERVIEW);
        when(repository.findByIdAndUserId(APPLICATION_ID, USER_ID)).thenReturn(Optional.of(application));

        service.changeStatus(USER_ID, APPLICATION_ID, ApplicationStatus.INTERVIEW);

        // An audit trail full of "INTERVIEW -> INTERVIEW" tells you nothing.
        verify(historyRepository, never()).save(any());
    }

    @Test
    @DisplayName("creating writes the opening entry so the timeline starts at creation")
    void createWritesAnOpeningEntry() {
        Application saved = existing(ApplicationStatus.SAVED);
        when(mapper.toEntity(any())).thenReturn(new Application());
        when(repository.save(any())).thenReturn(saved);

        service.create(
                USER_ID,
                new ApplicationRequest(
                        "Backend Engineer", "Acme", null, null, null, null, null, null, null));

        ArgumentCaptor<StatusHistory> entry = ArgumentCaptor.forClass(StatusHistory.class);
        verify(historyRepository).save(entry.capture());
        assertThat(entry.getValue().getFromStatus()).isNull();
        assertThat(entry.getValue().getToStatus()).isEqualTo(ApplicationStatus.SAVED);
    }

    @Test
    @DisplayName("another user's application is reported as missing, not forbidden")
    void unknownApplicationIsNotFound() {
        when(repository.findByIdAndUserId(APPLICATION_ID, USER_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.get(USER_ID, APPLICATION_ID))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("deleting something you do not own touches nothing")
    void deleteChecksOwnershipFirst() {
        when(repository.existsByIdAndUserId(APPLICATION_ID, USER_ID)).thenReturn(false);

        assertThatThrownBy(() -> service.delete(USER_ID, APPLICATION_ID))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(repository, never()).deleteById(any());
        verifyNoInteractions(historyRepository);
    }

    @Test
    @DisplayName("the history of an application you do not own is not readable")
    void historyChecksOwnershipFirst() {
        when(repository.existsByIdAndUserId(APPLICATION_ID, USER_ID)).thenReturn(false);

        assertThatThrownBy(() -> service.history(USER_ID, APPLICATION_ID))
                .isInstanceOf(ResourceNotFoundException.class);

        verifyNoInteractions(historyRepository);
    }
}
