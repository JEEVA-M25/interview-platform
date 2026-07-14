package AIINterview.CareerVerse.AI.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class QuestionGeneratorService {

    private static final Logger log = LoggerFactory.getLogger(QuestionGeneratorService.class);

    private static final String GEMINI_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s";

    private final String apiKey;
    private final String model;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public QuestionGeneratorService(
            @Value("${gemini.api-key:}") String apiKey,
            @Value("${gemini.model:gemini-1.5-flash}") String model,
            ObjectMapper objectMapper
    ) {
        this.apiKey = apiKey;
        this.model = model;
        this.objectMapper = objectMapper;
        this.restClient = RestClient.builder()
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    /**
     * Generates 8-10 interview questions based on the resume and target role.
     * Returns a GenerationResult containing the questions and the exact prompt used.
     */
    public record GenerationResult(List<String> questions, String prompt) {}

    public GenerationResult generateQuestions(String resumeText, String role, String difficulty) {
        String prompt = buildPrompt(resumeText, role, difficulty);
        if (isConfigured()) {
            List<String> questions = callGemini(prompt);
            if (questions != null && !questions.isEmpty()) {
                return new GenerationResult(questions, prompt);
            }
        }
        log.warn("Gemini unavailable — using fallback questions for role={}", role);
        return new GenerationResult(fallbackQuestions(role, difficulty), prompt);
    }

    /**
     * Generates a personalized AI interviewer greeting using the candidate's name and role.
     * Falls back to a generic greeting if Gemini is unavailable.
     */
    public String generateInterviewerIntro(String candidateName, String role, String difficulty, int questionCount) {
        if (!isConfigured()) {
            return buildFallbackIntro(candidateName, role, difficulty, questionCount);
        }

        String prompt = """
                You are a professional AI technical interviewer.
                Generate a warm, professional interview opening statement.

                Candidate name: %s
                Role: %s
                Difficulty: %s
                Number of questions: %d

                Write a natural spoken greeting (3-5 sentences) that:
                - Greets the candidate by first name
                - Introduces yourself as their AI interviewer
                - Mentions the role and approximate duration
                - Tells them to feel free to think before answering
                - Ends with "Let us begin."

                Return only the greeting text, no JSON, no quotes.
                """.formatted(candidateName, role, difficulty, questionCount);

        try {
            Map<String, Object> body = Map.of(
                    "contents", List.of(Map.of(
                            "parts", List.of(Map.of("text", prompt))
                    )),
                    "generationConfig", Map.of("temperature", 0.6)
            );

            String response = restClient.post()
                    .uri(GEMINI_URL.formatted(model, apiKey))
                    .body(body)
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(response);
            if (root.has("error")) return buildFallbackIntro(candidateName, role, difficulty, questionCount);

            String text = root.path("candidates").path(0)
                    .path("content").path("parts").path(0)
                    .path("text").asText("").trim();

            return text.isBlank() ? buildFallbackIntro(candidateName, role, difficulty, questionCount) : text;
        } catch (Exception e) {
            log.warn("Failed to generate interviewer intro: {}", e.getMessage());
            return buildFallbackIntro(candidateName, role, difficulty, questionCount);
        }
    }

    private String buildFallbackIntro(String candidateName, String role, String difficulty, int questionCount) {
        String firstName = candidateName != null && candidateName.contains(" ")
                ? candidateName.split(" ")[0] : candidateName;
        return "Hello %s. I am your AI interviewer today. We will have a %s-level %s interview with %d questions. Take your time before answering each one — there is no rush. Let us begin."
                .formatted(firstName, difficulty.toLowerCase(), role, questionCount);
    }

    /**
     * Asks Gemini whether a follow-up is warranted and returns it, or null if not.
     */
    public String generateFollowUp(String question, String candidateAnswer) {
        if (!isConfigured()) return null;

        String prompt = """
                You are a technical interviewer.
                
                Original question: %s
                Candidate answer: %s
                
                Decide if a follow-up question is needed to probe deeper.
                If yes, return JSON: {"followUp": true, "question": "..."}
                If no, return JSON: {"followUp": false, "question": ""}
                Return only valid JSON, no markdown.
                """.formatted(question, candidateAnswer);

        try {
            String raw = callGeminiRaw(prompt);
            if (raw == null) return null;
            JsonNode node = objectMapper.readTree(raw);
            if (node.path("followUp").asBoolean(false)) {
                String q = node.path("question").asText("").trim();
                return q.isBlank() ? null : q;
            }
        } catch (JsonProcessingException e) {
            log.warn("Failed to parse follow-up response: {}", e.getMessage());
        }
        return null;
    }

    private String buildPrompt(String resumeText, String role, String difficulty) {
        return """
                You are a senior technical interviewer.
                
                Resume:
                %s
                
                Target Role: %s
                Difficulty: %s
                
                Generate exactly 10 interview questions tailored to this candidate's background and the target role.
                Mix technical, behavioral, and problem-solving questions appropriate for the difficulty level.
                
                Return only a valid JSON array, no markdown:
                [
                  {"id": 1, "question": "..."},
                  {"id": 2, "question": "..."}
                ]
                """.formatted(resumeText, role, difficulty);
    }

    private List<String> callGemini(String prompt) {
        try {
            String raw = callGeminiRaw(prompt);
            if (raw == null) return null;

            JsonNode arr = objectMapper.readTree(raw);
            if (!arr.isArray()) return null;

            List<String> questions = new ArrayList<>();
            for (JsonNode item : arr) {
                String q = item.path("question").asText("").trim();
                if (!q.isBlank()) questions.add(q);
            }
            log.info("Generated {} questions via Gemini for role={}", questions.size());
            return questions;
        } catch (JsonProcessingException e) {
            log.warn("Failed to parse Gemini question response: {}", e.getMessage());
            return null;
        }
    }

    private String callGeminiRaw(String prompt) {
        try {
            Map<String, Object> body = Map.of(
                    "contents", List.of(Map.of(
                            "parts", List.of(Map.of("text", prompt))
                    )),
                    "generationConfig", Map.of(
                            "temperature", 0.7,
                            "responseMimeType", "application/json"
                    )
            );

            String response = restClient.post()
                    .uri(GEMINI_URL.formatted(model, apiKey))
                    .body(body)
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(response);

            if (root.has("error")) {
                log.error("Gemini API error: {}", root.path("error").path("message").asText());
                return null;
            }

            return root.path("candidates").path(0)
                    .path("content").path("parts").path(0)
                    .path("text").asText(null);

        } catch (Exception e) {
            log.error("Gemini call failed: {}", e.getMessage());
            return null;
        }
    }

    private boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    private List<String> fallbackQuestions(String role, String difficulty) {
        return switch (role.toLowerCase()) {
            case "java developer" -> List.of(
                    "Explain the JVM architecture and how it executes Java bytecode.",
                    "What is the difference between an interface and an abstract class in Java?",
                    "How does Spring Boot auto-configuration work?",
                    "Explain the concept of dependency injection and why it is useful.",
                    "What are the SOLID principles? Give an example of one.",
                    "How would you design a REST API for a user management system?",
                    "What is the difference between HashMap and ConcurrentHashMap?",
                    "Explain how garbage collection works in Java.",
                    "What is a deadlock and how would you prevent it?",
                    "Describe a challenging bug you fixed and how you approached it."
            );
            case "full stack" -> List.of(
                    "Explain the difference between server-side and client-side rendering.",
                    "How does the HTTP request-response cycle work?",
                    "What is CORS and how do you handle it in a Spring Boot application?",
                    "Explain React's virtual DOM and why it improves performance.",
                    "How would you secure a REST API?",
                    "What is the difference between SQL and NoSQL databases?",
                    "Explain the concept of state management in React.",
                    "How do you handle authentication in a full-stack application?",
                    "What is CI/CD and why is it important?",
                    "Describe a full-stack feature you built end-to-end."
            );
            case "data analyst" -> List.of(
                    "What is the difference between supervised and unsupervised learning?",
                    "Explain how you would handle missing data in a dataset.",
                    "What is the difference between mean, median, and mode?",
                    "How would you detect and handle outliers in a dataset?",
                    "Explain the concept of normalization in databases.",
                    "What SQL query would you use to find duplicate records?",
                    "What is a confusion matrix and what does it tell you?",
                    "How would you explain a complex data finding to a non-technical stakeholder?",
                    "What tools have you used for data visualization?",
                    "Describe a data analysis project you completed and its impact."
            );
            default -> List.of(
                    "Tell me about yourself and your technical background.",
                    "What are your strongest technical skills?",
                    "Describe a challenging project you worked on.",
                    "How do you approach learning a new technology?",
                    "What is your experience with version control systems like Git?",
                    "How do you handle tight deadlines and competing priorities?",
                    "Describe a time you had to debug a difficult problem.",
                    "What development methodologies have you worked with?",
                    "Where do you see yourself in 3 years technically?",
                    "Do you have any questions for us?"
            );
        };
    }
}
