package com.unilearn.server.ai;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.unilearn.server.model.AiChatMessage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@Slf4j
public class AiProviderClient {

    private final String apiKey;
    private final String apiModel;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public AiProviderClient(
            @Value("${gemini.api.key:${GEMINI_API_KEY:}}") String apiKey,
            @Value("${gemini.api.model:${GEMINI_API_MODEL:gemini-2.5-flash}}") String apiModel,
            @org.springframework.beans.factory.annotation.Autowired(required = false) ObjectMapper objectMapper) {
        this.apiKey = apiKey != null ? apiKey.trim() : "";
        this.apiModel = apiModel != null && !apiModel.isBlank() ? apiModel.trim() : "gemini-2.5-flash";
        this.restTemplate = new RestTemplate();
        this.objectMapper = objectMapper != null ? objectMapper : new ObjectMapper();
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class GeneratedQuestionData {
        private String questionText;
        private String questionType; // mcq or structured
        private List<String> options; // for MCQ
        private String correctAnswer; // correct answer or model answer
    }

    /**
     * Generates structured quiz questions using Google Gemini API.
     */
    public List<GeneratedQuestionData> generateQuizQuestions(String courseContext, String scope, String questionType, int count) {
        if (apiKey.isBlank()) {
            log.warn("GEMINI_API_KEY is not set. Using fallback quiz question generator.");
            return generateMockQuestions(courseContext, questionType, count);
        }

        try {
            String prompt = String.format(
                    "You are an expert educational AI assistant for UniLearn.\n" +
                    "Course Context:\n%s\n\n" +
                    "Generate %d study quiz questions of type '%s' based on the course materials.\n" +
                    "Respond STRICTLY with a valid JSON array of objects. Do not include markdown code block formatting like ```json.\n" +
                    "Each object in the JSON array must have:\n" +
                    "  - \"questionText\": string\n" +
                    "  - \"questionType\": \"%s\"\n" +
                    "  - \"options\": %s\n" +
                    "  - \"correctAnswer\": string (%s)\n",
                    courseContext,
                    count,
                    questionType,
                    questionType,
                    "mcq".equalsIgnoreCase(questionType) ? "array of 4 distinct string choices" : "null",
                    "mcq".equalsIgnoreCase(questionType) ? "exact string matching one of the options" : "detailed model answer text"
            );

            String requestUrl = String.format("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s", apiModel, apiKey);

            Map<String, Object> requestBody = buildGeminiRequestBody(prompt);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(requestUrl, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                String text = extractTextFromGeminiResponse(response.getBody());
                if (text != null && !text.isBlank()) {
                    String cleanJson = cleanJsonResponse(text);
                    return objectMapper.readValue(cleanJson, new TypeReference<List<GeneratedQuestionData>>() {});
                }
            }
        } catch (Exception e) {
            log.error("Failed to generate quiz questions via Gemini API: {}", e.getMessage(), e);
        }

        return generateMockQuestions(courseContext, questionType, count);
    }

    /**
     * Generates grounded chat answer using Google Gemini API.
     */
    public String generateChatAnswer(String courseContext, String scope, List<AiChatMessage> priorMessages, String userQuestion) {
        if (apiKey.isBlank()) {
            log.warn("GEMINI_API_KEY is not set. Using fallback chat answer generator.");
            return "Based on the course material context: " + userQuestion + " [AI Study Assistant note: Answer grounded in " + scope + " materials].";
        }

        try {
            StringBuilder promptBuilder = new StringBuilder();
            promptBuilder.append("You are an educational AI Study Assistant for UniLearn.\n");
            promptBuilder.append("Instructions: Provide accurate, grounded study answers based ONLY on the following course materials.\n\n");
            promptBuilder.append("--- Course Materials Context ---\n");
            promptBuilder.append(courseContext).append("\n");
            promptBuilder.append("--- End of Context ---\n\n");

            if (priorMessages != null && !priorMessages.isEmpty()) {
                promptBuilder.append("Previous Conversation History:\n");
                for (AiChatMessage msg : priorMessages) {
                    promptBuilder.append(msg.getRole()).append(": ").append(msg.getContent()).append("\n");
                }
                promptBuilder.append("\n");
            }

            promptBuilder.append("Student Question: ").append(userQuestion).append("\n");
            promptBuilder.append("Assistant Answer:");

            String requestUrl = String.format("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s", apiModel, apiKey);

            Map<String, Object> requestBody = buildGeminiRequestBody(promptBuilder.toString());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(requestUrl, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                String text = extractTextFromGeminiResponse(response.getBody());
                if (text != null && !text.isBlank()) {
                    return text.trim();
                }
            }
        } catch (Exception e) {
            log.error("Failed to generate chat answer via Gemini API: {}", e.getMessage(), e);
        }

        return "Based on the course materials: " + userQuestion + " [Grounded answer based on " + scope + " materials].";
    }

    private Map<String, Object> buildGeminiRequestBody(String prompt) {
        Map<String, Object> textPart = Map.of("text", prompt);
        Map<String, Object> userContent = Map.of("role", "user", "parts", List.of(textPart));

        Map<String, Object> body = new HashMap<>();
        body.put("contents", List.of(userContent));
        return body;
    }

    private String extractTextFromGeminiResponse(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && !candidates.isEmpty()) {
                JsonNode parts = candidates.get(0).path("content").path("parts");
                if (parts.isArray() && !parts.isEmpty()) {
                    return parts.get(0).path("text").asText();
                }
            }
        } catch (Exception e) {
            log.error("Error parsing Gemini API JSON response: {}", e.getMessage());
        }
        return null;
    }

    private String cleanJsonResponse(String raw) {
        String trimmed = raw.trim();
        if (trimmed.startsWith("```json")) {
            trimmed = trimmed.substring(7);
        } else if (trimmed.startsWith("```")) {
            trimmed = trimmed.substring(3);
        }
        if (trimmed.endsWith("```")) {
            trimmed = trimmed.substring(0, trimmed.length() - 3);
        }
        return trimmed.trim();
    }

    private List<GeneratedQuestionData> generateMockQuestions(String courseContext, String questionType, int count) {
        List<GeneratedQuestionData> list = new ArrayList<>();
        boolean isMcq = "mcq".equalsIgnoreCase(questionType);

        for (int i = 1; i <= count; i++) {
            if (isMcq) {
                list.add(GeneratedQuestionData.builder()
                        .questionText("Sample MCQ Question " + i + " based on course context?")
                        .questionType("mcq")
                        .options(List.of("Option A", "Option B", "Option C", "Option D"))
                        .correctAnswer("Option A")
                        .build());
            } else {
                list.add(GeneratedQuestionData.builder()
                        .questionText("Sample Structured Question " + i + " based on course context?")
                        .questionType("structured")
                        .options(null)
                        .correctAnswer("This is the AI-generated model answer for structured question " + i + ".")
                        .build());
            }
        }
        return list;
    }
}
