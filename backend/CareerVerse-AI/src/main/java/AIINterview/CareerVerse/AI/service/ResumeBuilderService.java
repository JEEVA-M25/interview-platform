package AIINterview.CareerVerse.AI.service;

import AIINterview.CareerVerse.AI.dto.ResumeBuilderRequest;
import AIINterview.CareerVerse.AI.dto.ResumeBuilderSummaryResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class ResumeBuilderService {

    private static final Logger log = LoggerFactory.getLogger(ResumeBuilderService.class);
    private static final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s";

    private final String apiKey;
    private final String model;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    public ResumeBuilderService(
            @Value("${gemini-resume_builder.api-key:}") String apiKey,
            @Value("${gemini.model:gemini-1.5-flash}") String model,
            ObjectMapper objectMapper
    ) {
        this.apiKey = apiKey;
        this.model = model;
        this.objectMapper = objectMapper;
        this.restTemplate = new RestTemplate();
    }

    public ResumeBuilderSummaryResponse generateSummary(ResumeBuilderRequest request) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("Gemini API key for Resume Builder is not configured.");
        }

        String prompt = buildPrompt(request);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(
                                    Map.of("text", prompt)
                            ))
                    ),
                    "generationConfig", Map.of(
                            "temperature", 0.7
                    )
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            String url = String.format(GEMINI_URL, model, apiKey);

            String responseString = restTemplate.postForObject(url, entity, String.class);
            JsonNode root = objectMapper.readTree(responseString);
            
            if (root.has("error")) {
                log.error("Gemini API error in resume builder: {}", root.path("error").path("message").asText());
                throw new RuntimeException("AI provider error");
            }

            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && !candidates.isEmpty()) {
                String text = candidates.get(0).path("content").path("parts").get(0).path("text").asText();
                return new ResumeBuilderSummaryResponse(text.trim());
            } else {
                log.warn("Gemini returned empty text response for resume builder");
                return new ResumeBuilderSummaryResponse("Error generating summary.");
            }
        } catch (Exception e) {
            log.error("Failed to generate resume summary: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate summary", e);
        }
    }

    private String buildPrompt(ResumeBuilderRequest request) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are an expert resume writer. Please generate a professional, impactful, and concise resume summary (3-4 sentences max) for a candidate based on the following details:\n\n");
        
        if (request.fullName() != null && !request.fullName().isBlank()) {
            sb.append("Name: ").append(request.fullName()).append("\n");
        }
        if (request.careerGoal() != null && !request.careerGoal().isBlank()) {
            sb.append("Career Goal / Target Role: ").append(request.careerGoal()).append("\n");
        }
        
        if (request.education() != null && !request.education().isEmpty()) {
            sb.append("\nEducation:\n");
            for (Map<String, String> edu : request.education()) {
                sb.append("- ").append(edu.get("degree")).append(" at ").append(edu.get("institution")).append("\n");
            }
        }
        
        if (request.technicalSkills() != null && !request.technicalSkills().isEmpty()) {
            sb.append("\nSkills:\n");
            for (Map<String, Object> skillCat : request.technicalSkills()) {
                sb.append("- ").append(skillCat.get("category")).append(": ").append(skillCat.get("skills")).append("\n");
            }
        }
        
        if (request.projects() != null && !request.projects().isEmpty()) {
            sb.append("\nProjects:\n");
            for (Map<String, String> proj : request.projects()) {
                sb.append("- ").append(proj.get("name")).append(" (").append(proj.get("technologies")).append(")\n");
            }
        }
        
        if (request.experience() != null && !request.experience().isEmpty()) {
            sb.append("\nExperience:\n");
            for (Map<String, String> exp : request.experience()) {
                sb.append("- ").append(exp.get("role")).append(" at ").append(exp.get("organization")).append("\n");
            }
        }

        sb.append("\nOutput ONLY the summary text without any surrounding quotes, Markdown formatting, or introductory phrases.");
        return sb.toString();
    }
}
