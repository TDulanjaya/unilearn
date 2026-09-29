package com.unilearn.server.ai;

import com.unilearn.server.model.MaterialChunk;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class AiGroundingContextHelper {

    private final MaterialChunkService materialChunkService;

    @Getter
    @AllArgsConstructor
    public static class GroundedContextResult {
        private final String contextText;
        private final List<String> sources;
        private final List<String> courseSources;
        private final List<String> noteSources;

        public GroundedContextResult(String contextText, List<String> sources) {
            this(contextText, sources, List.of(), List.of());
        }
    }

    // gets relevant chunks and split sources for a question
    public GroundedContextResult fetchRelevantCourseContext(Long offeringId, Long studentId, String sourceScope, String userQuestion, int limit) {
        if (offeringId == null) {
            return new GroundedContextResult("General Course Study (No specific offering)", List.of(), List.of(), List.of());
        }

        // keep between 5 and 8 chunks
        int chunkLimit = Math.max(5, Math.min(limit > 0 ? limit : 6, 8));
        List<MaterialChunk> chunks = materialChunkService.findRelevantChunks(offeringId, studentId, sourceScope, userQuestion, chunkLimit);

        if (chunks == null || chunks.isEmpty()) {
            return new GroundedContextResult(
                    "No uploaded material contents or text chunks found for this course offering yet.",
                    List.of(),
                    List.of(),
                    List.of()
            );
        }

        StringBuilder sb = new StringBuilder();
        List<String> sources = new ArrayList<>();
        List<String> courseSources = new ArrayList<>();
        List<String> noteSources = new ArrayList<>();

        for (int i = 0; i < chunks.size(); i++) {
            MaterialChunk c = chunks.get(i);
            String title = c.getSourceTitle() != null ? c.getSourceTitle() : "Course Material";
            boolean isPersonal = "PERSONAL".equalsIgnoreCase(c.getSourceType()) || c.getPersonalResourceId() != null;

            if (isPersonal) {
                if (!noteSources.contains(title)) {
                    noteSources.add(title);
                }
                if (!sources.contains(title)) {
                    sources.add(title);
                }
                sb.append(String.format("[Your notes: %s | Section #%d]\n", title, c.getChunkIndex() + 1));
            } else {
                if (!courseSources.contains(title)) {
                    courseSources.add(title);
                }
                if (!sources.contains(title)) {
                    sources.add(title);
                }
                sb.append(String.format("[Lecturer material: %s | Section #%d]\n", title, c.getChunkIndex() + 1));
            }
            sb.append(c.getContent().trim()).append("\n\n");
        }

        return new GroundedContextResult(sb.toString().trim(), sources, courseSources, noteSources);
    }

    public GroundedContextResult fetchRelevantCourseContext(Long offeringId, Long studentId, String userQuestion, int limit) {
        return fetchRelevantCourseContext(offeringId, studentId, "both", userQuestion, limit);
    }

    // gets course chunks for quiz generation
    public String fetchQuizCourseContext(Long offeringId, Long studentId, String sourceScope, int limit) {
        if (offeringId == null) {
            return "General Course Study";
        }

        int chunkLimit = Math.max(6, Math.min(limit > 0 ? limit : 8, 12));
        List<MaterialChunk> chunks = materialChunkService.findRelevantChunks(offeringId, studentId, sourceScope, sourceScope, chunkLimit);

        if (chunks == null || chunks.isEmpty()) {
            return "No uploaded lecture notes or textbook material chunks available for this course offering.";
        }

        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < chunks.size(); i++) {
            MaterialChunk c = chunks.get(i);
            String title = c.getSourceTitle() != null ? c.getSourceTitle() : "Course Material";
            boolean isPersonal = "PERSONAL".equalsIgnoreCase(c.getSourceType()) || c.getPersonalResourceId() != null;

            if (isPersonal) {
                sb.append(String.format("[Your notes: %s | Chunk #%d]\n", title, c.getChunkIndex() + 1));
            } else {
                sb.append(String.format("[Lecturer material: %s | Chunk #%d]\n", title, c.getChunkIndex() + 1));
            }
            sb.append(c.getContent().trim()).append("\n\n");
        }

        return sb.toString().trim();
    }
}
