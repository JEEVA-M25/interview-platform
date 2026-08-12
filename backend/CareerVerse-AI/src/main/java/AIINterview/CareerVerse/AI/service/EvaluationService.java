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
public class EvaluationService {

    private static final Logger log = LoggerFactory.getLogger(EvaluationService.class);

    private static final String GEMINI_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s";

    private final String apiKey;
    private final String model;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    // Token counts from the most recent Gemini call
    private Integer lastPromptTokens;
    private Integer lastCompletionTokens;

    public EvaluationService(
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

    public record AnswerEvaluation(
            int score,
            String feedback,
            String strengths,
            String weaknesses,
            /** Short spoken comment the AI says after evaluating — e.g. "Good answer. Let's continue." */
            String interviewerComment,
            Integer promptTokens,
            Integer completionTokens
    ) {}

    public record FinalScores(
            int overall,
            int technical,
            int communication,
            int problemSolving,
            int grammar,
            int confidence,
            String recommendation,
            List<String> overallStrengths,
            List<String> overallWeaknesses
    ) {}

    public AnswerEvaluation evaluate(String question, String candidateAnswer) {
        if (isConfigured()) {
            AnswerEvaluation result = callGeminiEvaluate(question, candidateAnswer);
            if (result != null) return result;
        }
        log.warn("Gemini unavailable — using fallback evaluation");
        return fallbackEvaluation(candidateAnswer);
    }

    public FinalScores generateFinalScores(String role, List<String> questions, List<String> answers) {
        if (isConfigured()) {
            FinalScores scores = callGeminiFinalScores(role, questions, answers);
            if (scores != null) return scores;
        }
        return fallbackFinalScores(questions, answers);
    }

    private AnswerEvaluation callGeminiEvaluate(String question, String candidateAnswer) {
        String prompt = """
                You are a professional AI technical interviewer evaluating a candidate's answer.

                Question: %s

                Candidate Answer: %s

                Score the candidate out of 10. Be somewhat liberal and encouraging with the score (e.g. give 7-9 for decent answers, 5-6 for partial answers), but still properly allocate points based on technical accuracy.

                Evaluate the answer and return only valid JSON, no markdown:
                {
                  "score": <integer 1-10>,
                  "feedback": "<concise 1-2 sentence overall feedback>",
                  "strengths": "<what the candidate did well, 1 sentence>",
                  "weaknesses": "<what was missing or incorrect, 1 sentence>",
                  "interviewerComment": "<a short natural spoken transition, 1 sentence, e.g. 'Good explanation. Let us move to the next question.' or 'Interesting point. I would like to explore that further.'>"
                }
                """.formatted(question, candidateAnswer);

        try {
            String raw = callGeminiRaw(prompt);
            if (raw == null) return null;

            JsonNode node = objectMapper.readTree(stripMarkdownFence(raw));
            return new AnswerEvaluation(
                    node.path("score").asInt(5),
                    node.path("feedback").asText(""),
                    node.path("strengths").asText(""),
                    node.path("weaknesses").asText(""),
                    node.path("interviewerComment").asText("Thank you for your answer. Let us continue."),
                    lastPromptTokens,
                    lastCompletionTokens
            );
        } catch (JsonProcessingException e) {
            log.warn("Failed to parse evaluation response: {}", e.getMessage());
            return null;
        }
    }

    private FinalScores callGeminiFinalScores(String role, List<String> questions, List<String> answers) {
        StringBuilder qa = new StringBuilder();
        for (int i = 0; i < questions.size(); i++) {
            qa.append("Q").append(i + 1).append(": ").append(questions.get(i)).append("\n");
            qa.append("A").append(i + 1).append(": ")
              .append(i < answers.size() ? answers.get(i) : "[No answer]").append("\n\n");
        }

        String prompt = """
                You are evaluating a complete mock interview for a %s role.

                Interview transcript:
                %s

                Score the candidate across these dimensions (each 0-100). Be somewhat liberal and encouraging with the scores (e.g. give 70-90 for decent overall performance, 50-60 for partial performance), but allocate properly based on the answers:
                - technical: depth of technical knowledge
                - communication: clarity and structure of answers
                - problemSolving: logical thinking and approach
                - grammar: language quality and professionalism
                - confidence: assertiveness and certainty in answers

                Also provide:
                - recommendation: one-line verdict (e.g. "Interview Ready", "Needs More Preparation", "Strong Candidate")
                - overallStrengths: array of 3 short bullet strings highlighting what the candidate did well overall
                - overallWeaknesses: array of 3 short bullet strings highlighting areas to improve

                Return only valid JSON, no markdown:
                {
                  "technical": 0,
                  "communication": 0,
                  "problemSolving": 0,
                  "grammar": 0,
                  "confidence": 0,
                  "recommendation": "",
                  "overallStrengths": ["", "", ""],
                  "overallWeaknesses": ["", "", ""]
                }
                """.formatted(role, qa);

        try {
            String raw = callGeminiRaw(prompt);
            if (raw == null) return null;

            JsonNode node = objectMapper.readTree(stripMarkdownFence(raw));
            int tech = node.path("technical").asInt(50);
            int comm = node.path("communication").asInt(50);
            int prob = node.path("problemSolving").asInt(50);
            int gram = node.path("grammar").asInt(50);
            int conf = node.path("confidence").asInt(50);
            int overall = (tech + comm + prob + gram + conf) / 5;
            String rec = node.path("recommendation").asText("Keep Practicing");

            List<String> strengths = new ArrayList<>();
            List<String> weaknesses = new ArrayList<>();
            node.path("overallStrengths").forEach(n -> strengths.add(n.asText()));
            node.path("overallWeaknesses").forEach(n -> weaknesses.add(n.asText()));

            return new FinalScores(overall, tech, comm, prob, gram, conf, rec, strengths, weaknesses);
        } catch (JsonProcessingException e) {
            log.warn("Failed to parse final scores response: {}", e.getMessage());
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
                            "temperature", 0.3,
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

            JsonNode usage = root.path("usageMetadata");
            lastPromptTokens = usage.path("promptTokenCount").asInt(0);
            lastCompletionTokens = usage.path("candidatesTokenCount").asInt(0);

            return root.path("candidates").path(0)
                    .path("content").path("parts").path(0)
                    .path("text").asText(null);

        } catch (Exception e) {
            log.error("Gemini call failed: {}", e.getMessage(), e);
            return null;
        }
    }

    private boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    private AnswerEvaluation fallbackEvaluation(String answer) {
        int wordCount = answer == null ? 0 : answer.split("\\s+").length;
        int score = Math.min(10, Math.max(3, wordCount / 10));
        return new AnswerEvaluation(
                score,
                "Answer recorded. Detailed AI feedback is unavailable at this time.",
                "Attempted to answer the question.",
                "Could not evaluate depth without AI analysis.",
                "Thank you for your answer. Let us continue.",
                null, null
        );
    }

    private FinalScores fallbackFinalScores(List<String> questions, List<String> answers) {
        int answered = (int) answers.stream().filter(a -> a != null && !a.isBlank()).count();
        int base = questions.isEmpty() ? 50 : (answered * 100 / questions.size());
        return new FinalScores(
                base, base, base, base, base, base,
                "Keep Practicing",
                List.of("Completed the interview session.", "Attempted all questions.", "Showed willingness to engage."),
                List.of("Enable Gemini API for detailed feedback.", "Practice explaining concepts clearly.", "Work on technical depth.")
        );
    }

    private String stripMarkdownFence(String text) {
        if (text == null) return "";
        return text
                .replaceFirst("^```json\\s*", "")
                .replaceFirst("^```\\s*", "")
                .replaceFirst("\\s*```$", "")
                .trim();
    }
}
