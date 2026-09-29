package com.unilearn.server.ai;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.unilearn.server.exception.AiServiceUnavailableException;
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
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Component
@Slf4j
public class AiProviderClient {

    private final String apiKey;
    private final String apiModel;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public AiProviderClient(
            @Value("${gemini.api.key:${GEMINI_API_KEY:}}") String apiKey,
            @Value("${gemini.api.model:${GEMINI_API_MODEL:}}") String apiModel,
            @org.springframework.beans.factory.annotation.Autowired(required = false) ObjectMapper objectMapper) {
        this.apiKey = apiKey != null ? apiKey.trim() : "";
        this.apiModel = apiModel != null ? apiModel.trim() : "";

        // 5s connect, 30s read timeout
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(5));
        requestFactory.setReadTimeout(Duration.ofSeconds(30));

        this.restTemplate = new RestTemplate(requestFactory);
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
        private List<String> options; // 4 options for mcq
        private String correctAnswer; // correct or model answer
    }

    // Generate quiz questions
    public List<GeneratedQuestionData> generateQuizQuestions(String courseContext, String scope, String questionType, int count) {
        validateConfig();

        String prompt = buildQuizPrompt(courseContext, questionType, count);

        // first attempt
        List<GeneratedQuestionData> questions = executeGeminiQuizCall(prompt, questionType);
        if (isValidQuestions(questions, questionType, count)) {
            return questions;
        }

        // retry once on invalid format
        log.warn("Gemini quiz output failed validation on attempt 1. Retrying once...");
        questions = executeGeminiQuizCall(prompt, questionType);
        if (isValidQuestions(questions, questionType, count)) {
            return questions;
        }

        throw new AiServiceUnavailableException("AI assistant could not generate a valid quiz from the course materials. Please try again.");
    }

    // Generate chat answer
    public String generateChatAnswer(String courseContext, String scope, List<AiChatMessage> priorMessages, String userQuestion) {
        validateConfig();

        StringBuilder promptBuilder = new StringBuilder();
        promptBuilder.append("You are the official UniLearn AI Study Assistant for this university course.\n\n");
        promptBuilder.append("--- RELEVANT COURSE MATERIALS CONTEXT ---\n");
        promptBuilder.append(courseContext != null && !courseContext.isBlank() ? courseContext : "No relevant course material chunks found for this topic.\n");
        promptBuilder.append("--- END OF COURSE MATERIALS CONTEXT ---\n\n");

        promptBuilder.append("INSTRUCTIONS FOR ANSWERING:\n");
        promptBuilder.append("1. Answer the student's question based on the context provided above.\n");
        promptBuilder.append("2. The context contains chunks labeled as [Lecturer material: <title>] and [Your notes: <title>]. Always prefer the lecturer's material as authoritative. If the student's notes conflict with the lecturer's material, explicitly point out the difference.\n");
        promptBuilder.append("3. When answering from the context, clearly cite the relevant material title(s) referenced.\n");
        promptBuilder.append("4. If the answer is NOT covered in the provided course materials context, you MUST explicitly start your reply by stating:\n");
        promptBuilder.append("   \"This isn't covered in your course materials.\"\n");
        promptBuilder.append("   and then provide a concise, helpful explanation clearly labelled as:\n");
        promptBuilder.append("   \"General Knowledge: <your explanation>\".\n");
        promptBuilder.append("5. Maintain an encouraging, academic tone.\n\n");

        if (priorMessages != null && !priorMessages.isEmpty()) {
            promptBuilder.append("RECENT CONVERSATION HISTORY (Last messages):\n");
            for (AiChatMessage msg : priorMessages) {
                promptBuilder.append(msg.getRole()).append(": ").append(msg.getContent()).append("\n");
            }
            promptBuilder.append("\n");
        }

        promptBuilder.append("STUDENT QUESTION: ").append(userQuestion).append("\n");
        promptBuilder.append("ASSISTANT ANSWER:");

        try {
            return callGemini(promptBuilder.toString());
        } catch (AiServiceUnavailableException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to generate chat answer via Gemini API: {}", e.getMessage());
            throw new AiServiceUnavailableException("AI assistant is temporarily unavailable. Please try again.");
        }
    }

    private void validateConfig() {
        if (apiKey.isBlank() || apiModel.isBlank()) {
            log.warn("Gemini API key or model configuration is missing. API Key present: {}, Model: '{}'",
                    !apiKey.isBlank(), apiModel);
            throw new AiServiceUnavailableException("AI assistant is temporarily unavailable. Missing Gemini configuration.");
        }
    }

    private String buildQuizPrompt(String courseContext, String questionType, int count) {
        boolean isMcq = "mcq".equalsIgnoreCase(questionType);
        return String.format(
                "You are an expert university examiner creating a study quiz for UniLearn.\n\n" +
                "--- COURSE MATERIALS CONTEXT ---\n%s\n--- END OF CONTEXT ---\n\n" +
                "INSTRUCTIONS:\n" +
                "Generate exactly %d study quiz questions of type '%s' based on the course materials context above. Prefer the lecturer's material as authoritative if personal notes conflict.\n" +
                "Respond ONLY with a valid JSON array of objects without markdown formatting or code fences (no ```json).\n" +
                "Each object MUST have:\n" +
                "  - \"questionText\": string (clear question based on the materials)\n" +
                "  - \"questionType\": \"%s\"\n" +
                "  - \"options\": %s\n" +
                "  - \"correctAnswer\": string (%s)\n\n" +
                "CRITICAL MCQ VALIDATION RULES:\n" +
                "1. \"options\" MUST be a JSON array containing EXACTLY 4 distinct non-empty string options.\n" +
                "2. \"correctAnswer\" MUST EXACTLY match one of the 4 options.\n",
                courseContext,
                count,
                questionType,
                questionType,
                isMcq ? "JSON array of exactly 4 distinct string choices, e.g. [\"Option 1\", \"Option 2\", \"Option 3\", \"Option 4\"]" : "null",
                isMcq ? "exact string matching one of the 4 items in the options array" : "detailed model answer"
        );
    }

    private List<GeneratedQuestionData> executeGeminiQuizCall(String prompt, String questionType) {
        try {
            String text = callGemini(prompt);
            if (text != null && !text.isBlank()) {
                String cleanJson = cleanJsonResponse(text);
                return objectMapper.readValue(cleanJson, new TypeReference<List<GeneratedQuestionData>>() {});
            }
        } catch (Exception e) {
            log.warn("Gemini quiz generation call failed or output parsing error: {}", e.getMessage());
        }
        return new ArrayList<>();
    }

    // check questions have valid text, options, and answer
    private boolean isValidQuestions(List<GeneratedQuestionData> questions, String questionType, int expectedMinCount) {
        if (questions == null || questions.isEmpty()) {
            return false;
        }

        boolean isMcq = "mcq".equalsIgnoreCase(questionType);
        for (GeneratedQuestionData q : questions) {
            if (q.getQuestionText() == null || q.getQuestionText().isBlank()) {
                return false;
            }
            if (q.getCorrectAnswer() == null || q.getCorrectAnswer().isBlank()) {
                return false;
            }

            if (isMcq) {
                List<String> options = q.getOptions();
                if (options == null || options.size() != 4) {
                    return false;
                }

                Set<String> distinct = new HashSet<>();
                boolean foundMatch = false;
                String correctTrimmed = q.getCorrectAnswer().trim();

                for (String opt : options) {
                    if (opt == null || opt.isBlank()) {
                        return false;
                    }
                    distinct.add(opt.trim().toLowerCase());
                    if (opt.trim().equalsIgnoreCase(correctTrimmed)) {
                        foundMatch = true;
                    }
                }

                // must have 4 distinct choices
                if (distinct.size() != 4 || !foundMatch) {
                    return false;
                }
            }
        }
        return true;
    }

    // calls Gemini API with key in header
    private String callGemini(String prompt) {
        String requestUrl = String.format("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent", apiModel);

        Map<String, Object> requestBody = buildGeminiRequestBody(prompt);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        // pass api key in header
        headers.set("x-goog-api-key", apiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(requestUrl, entity, String.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                String text = extractTextFromGeminiResponse(response.getBody());
                if (text != null && !text.isBlank()) {
                    return text.trim();
                }
            }
            throw new AiServiceUnavailableException("AI assistant is temporarily unavailable (empty response from Gemini).");
        } catch (HttpStatusCodeException e) {
            log.error("Gemini API HTTP Error {}: {}", e.getStatusCode(), e.getStatusText());
            throw new AiServiceUnavailableException("AI assistant is temporarily unavailable. Service returned status " + e.getStatusCode());
        } catch (Exception e) {
            log.error("Gemini API call failed: {}", e.getMessage());
            throw new AiServiceUnavailableException("AI assistant is temporarily unavailable. Please try again later.");
        }
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
}
