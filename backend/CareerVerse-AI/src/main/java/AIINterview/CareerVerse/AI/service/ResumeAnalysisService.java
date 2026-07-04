package AIINterview.CareerVerse.AI.service;

import AIINterview.CareerVerse.AI.dto.AtsScoreRequest;
import AIINterview.CareerVerse.AI.dto.AtsScoreResponse;
import AIINterview.CareerVerse.AI.dto.SkillGapRequest;
import AIINterview.CareerVerse.AI.dto.SkillGapResponse;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
public class ResumeAnalysisService {

    private static final String GEMINI_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s";

    private static final List<String> ATS_KEYWORDS = List.of(
            "java", "spring", "spring boot", "react", "javascript", "typescript", "sql", "mysql",
            "api", "rest", "microservices", "aws", "docker", "git", "testing", "agile",
            "leadership", "communication", "problem solving", "data structures"
    );

    private final String apiKey;
    private final String model;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public ResumeAnalysisService(
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

    public AtsScoreResponse analyzeAtsScore(AtsScoreRequest request) {
        return analyzeAtsScore(request.resumeText());
    }

    public AtsScoreResponse analyzeAtsScore(String resumeText) {
        if (isGeminiConfigured()) {
            String prompt = """
                    Analyze this resume for ATS performance. Return only valid JSON with:
                    score: number from 0 to 100,
                    summary: short professional summary,
                    strengths: array of 3 strings,
                    improvements: array of 3 strings,
                    keywords: array of 8 important keywords found or recommended.

                    Resume:
                    %s
                    """.formatted(resumeText);

            AtsScoreResponse response = callGemini(prompt, AtsScoreResponse.class);
            if (response != null) {
                return response;
            }
        }

        return localAtsAnalysis(resumeText);
    }

    public SkillGapResponse analyzeSkillGap(SkillGapRequest request) {
        return analyzeSkillGap(request.resumeText(), request.jobDescription());
    }

    public SkillGapResponse analyzeSkillGap(String resumeText, String jobDescription) {
        if (isGeminiConfigured()) {
            String prompt = """
                    Compare the resume against the job description. Return only valid JSON with:
                    matchScore: number from 0 to 100,
                    summary: short professional summary,
                    matchedSkills: array of skills already visible in the resume,
                    missingSkills: array of important skills missing or weak,
                    actionPlan: array of 4 practical steps to close the gap.

                    Job description:
                    %s

                    Resume:
                    %s
                    """.formatted(jobDescription, resumeText);

            SkillGapResponse response = callGemini(prompt, SkillGapResponse.class);
            if (response != null) {
                return response;
            }
        }

        return localSkillGapAnalysis(resumeText, jobDescription);
    }

    private <T> T callGemini(String prompt, Class<T> responseType) {
        try {
            Map<String, Object> body = Map.of(
                    "contents", List.of(Map.of(
                            "parts", List.of(Map.of("text", prompt))
                    )),
                    "generationConfig", Map.of(
                            "temperature", 0.2,
                            "responseMimeType", "application/json"
                    )
            );

            String response = restClient.post()
                    .uri(GEMINI_URL.formatted(model, apiKey))
                    .body(body)
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(response);
            String text = root.path("candidates")
                    .path(0)
                    .path("content")
                    .path("parts")
                    .path(0)
                    .path("text")
                    .asText();

            return objectMapper.readValue(stripMarkdownFence(text), responseType);
        } catch (RuntimeException | JsonProcessingException ex) {
            return null;
        }
    }

    private AtsScoreResponse localAtsAnalysis(String resumeText) {
        Set<String> foundKeywords = findKeywords(resumeText, ATS_KEYWORDS);
        int resumeLengthScore = Math.min(30, resumeText.length() / 80);
        int keywordScore = Math.min(45, foundKeywords.size() * 6);
        int structureScore = scoreStructure(resumeText);
        int score = Math.min(100, resumeLengthScore + keywordScore + structureScore);

        return new AtsScoreResponse(
                score,
                "ATS readiness is estimated from keyword coverage, section structure, and resume detail.",
                List.of(
                        "Clear technical keywords detected: " + String.join(", ", foundKeywords.stream().limit(5).toList()),
                        "Resume has enough detail for an initial automated screening pass.",
                        "Content can be improved further by tailoring it to each target role."
                ),
                List.of(
                        "Add measurable impact such as percentages, scale, revenue, time saved, or users served.",
                        "Mirror role-specific keywords from the job description where they truthfully apply.",
                        "Use standard section names like Experience, Projects, Skills, Education, and Certifications."
                ),
                new ArrayList<>(foundKeywords)
        );
    }

    private SkillGapResponse localSkillGapAnalysis(String resumeText, String jobDescription) {
        Set<String> jdSkills = findKeywords(jobDescription, ATS_KEYWORDS);
        Set<String> resumeSkills = findKeywords(resumeText, ATS_KEYWORDS);
        List<String> matched = jdSkills.stream().filter(resumeSkills::contains).toList();
        List<String> missing = jdSkills.stream().filter(skill -> !resumeSkills.contains(skill)).toList();
        int matchScore = jdSkills.isEmpty() ? 55 : Math.round((matched.size() * 100f) / jdSkills.size());

        return new SkillGapResponse(
                matchScore,
                "Skill match is estimated from overlap between the job description and resume keywords.",
                matched,
                missing,
                List.of(
                        "Add project bullets that prove the missing skills with concrete outcomes.",
                        "Prioritize the top missing skills that appear repeatedly in the job description.",
                        "Update the skills section with only technologies you can confidently discuss.",
                        "Prepare interview stories that connect your existing experience to the role requirements."
                )
        );
    }

    private Set<String> findKeywords(String text, List<String> keywords) {
        String normalized = text.toLowerCase(Locale.ROOT);
        Set<String> found = new LinkedHashSet<>();
        for (String keyword : keywords) {
            if (normalized.contains(keyword)) {
                found.add(keyword);
            }
        }
        return found;
    }

    private int scoreStructure(String resumeText) {
        String normalized = resumeText.toLowerCase(Locale.ROOT);
        int score = 0;
        for (String section : List.of("experience", "projects", "skills", "education", "certifications")) {
            if (normalized.contains(section)) {
                score += 5;
            }
        }
        return Math.min(score, 25);
    }

    private boolean isGeminiConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    private String stripMarkdownFence(String text) {
        return text
                .replaceFirst("^```json\\s*", "")
                .replaceFirst("^```\\s*", "")
                .replaceFirst("\\s*```$", "")
                .trim();
    }
}
