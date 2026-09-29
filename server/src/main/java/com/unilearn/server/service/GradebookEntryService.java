package com.unilearn.server.service;

import com.unilearn.server.dto.request.GradebookEntryRequest;
import com.unilearn.server.dto.response.GradebookEntryResponse;

import java.util.List;

// Gradebook entries service
public interface GradebookEntryService {

    GradebookEntryResponse createGradebookEntry(GradebookEntryRequest request);

    GradebookEntryResponse updateGradebookEntry(Long entryId, GradebookEntryRequest request);

    void deleteGradebookEntry(Long entryId);

    GradebookEntryResponse getEntryById(Long entryId);

    List<GradebookEntryResponse> getEntriesByOffering(Long offeringId);

    List<GradebookEntryResponse> getEntriesByStudent(Long studentId);
}
