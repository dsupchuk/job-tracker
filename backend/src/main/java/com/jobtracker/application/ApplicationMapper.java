package com.jobtracker.application;

import com.jobtracker.application.dto.ApplicationRequest;
import com.jobtracker.application.dto.ApplicationResponse;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

/**
 * Maps between the {@link Application} entity and its API DTOs.
 * Generated implementation is registered as a Spring bean.
 */
@org.mapstruct.Mapper(componentModel = "spring")
public interface ApplicationMapper {

    ApplicationResponse toResponse(Application application);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "status", source = "status", defaultValue = "SAVED")
    Application toEntity(ApplicationRequest request);

    /**
     * Applies a request onto an existing managed entity (used by update / PUT).
     * Null incoming fields overwrite the target — PUT is a full replacement.
     */
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.SET_TO_NULL)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "status", source = "status", defaultValue = "SAVED")
    void update(ApplicationRequest request, @MappingTarget Application application);
}
