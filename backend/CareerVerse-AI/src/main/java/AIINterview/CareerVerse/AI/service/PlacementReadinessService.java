package AIINterview.CareerVerse.AI.service;

import AIINterview.CareerVerse.AI.dto.PlacementReadinessResponse;
import AIINterview.CareerVerse.AI.dto.StudyGuideResponse;
import AIINterview.CareerVerse.AI.model.AppUser;
import AIINterview.CareerVerse.AI.model.AtsAnalysis;
import AIINterview.CareerVerse.AI.model.JobMatchAnalysis;
import AIINterview.CareerVerse.AI.model.InterviewSession;
import AIINterview.CareerVerse.AI.repository.AtsAnalysisRepository;
import AIINterview.CareerVerse.AI.repository.JobMatchAnalysisRepository;
import AIINterview.CareerVerse.AI.repository.InterviewSessionRepository;
import AIINterview.CareerVerse.AI.repository.AppUserRepository;
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
import java.util.stream.Collectors;
import java.util.function.Function;

@Service
public class PlacementReadinessService {

    private static final Logger log = LoggerFactory.getLogger(PlacementReadinessService.class);

    private static final String GEMINI_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s";

    private final AtsAnalysisRepository atsAnalysisRepository;
    private final JobMatchAnalysisRepository jobMatchAnalysisRepository;
    private final InterviewSessionRepository sessionRepository;
    private final AppUserRepository userRepository;
    
    private final String apiKey;
    private final String model;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public PlacementReadinessService(
            AtsAnalysisRepository atsAnalysisRepository,
            JobMatchAnalysisRepository jobMatchAnalysisRepository,
            InterviewSessionRepository sessionRepository,
            AppUserRepository userRepository,
            @Value("${gemini-resume_builder.api-key:}") String apiKey,
            @Value("${gemini.model:gemini-1.5-flash}") String model,
            ObjectMapper objectMapper) {
        this.atsAnalysisRepository = atsAnalysisRepository;
        this.jobMatchAnalysisRepository = jobMatchAnalysisRepository;
        this.sessionRepository = sessionRepository;
        this.userRepository = userRepository;
        this.apiKey = apiKey;
        this.model = model;
        this.objectMapper = objectMapper;
        this.restClient = RestClient.builder()
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    public PlacementReadinessResponse getPlacementReadiness(String email) {
        AppUser user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<AtsAnalysis> atsList = atsAnalysisRepository.findByUser_EmailOrderByCreatedAtDesc(email);
        List<JobMatchAnalysis> jobMatchList = jobMatchAnalysisRepository.findByUser_EmailOrderByCreatedAtDesc(email);
        List<InterviewSession> sessions = sessionRepository.findByUserIdOrderByStartedAtDesc(user.getId()).stream()
                .filter(s -> s.getStatus() == InterviewSession.SessionStatus.COMPLETED)
                .toList();

        // Current calculation
        Double currentScore = calculateScore(atsList, jobMatchList, sessions, 0, 0, 0);
        
        // Previous calculation (skip index 0 for all lists)
        int atsSkip = atsList.size() > 1 ? 1 : 0;
        int jobSkip = jobMatchList.size() > 1 ? 1 : 0;
        int intSkip = sessions.size() > 1 ? 1 : 0;
        
        Double previousScore = null;
        if (atsList.size() > 1 || jobMatchList.size() > 1 || sessions.size() > 1) {
            previousScore = calculateScore(atsList, jobMatchList, sessions, atsSkip, jobSkip, intSkip);
            if (previousScore != null && previousScore.equals(currentScore) && 
                (atsList.size() <= 1 && jobMatchList.size() <= 1 && sessions.size() <= 1)) {
                previousScore = null; // Don't show previous if there's truly no historical data
            }
        }

        // Gather current stats for the response
        Integer atsScore = atsList.isEmpty() ? null : atsList.get(0).getAtsScore();
        Integer jobMatchScore = jobMatchList.isEmpty() ? null : jobMatchList.get(0).getMatchScore();
        
        Integer interviewScore = null, technicalScore = null, communicationScore = null, confidenceScore = null, grammarScore = null;
        if (!sessions.isEmpty()) {
            interviewScore = averageScore(sessions, InterviewSession::getOverallScore, 0);
            technicalScore = averageScore(sessions, InterviewSession::getTechnicalScore, 0);
            communicationScore = averageScore(sessions, InterviewSession::getCommunicationScore, 0);
            confidenceScore = averageScore(sessions, InterviewSession::getConfidenceScore, 0);
            grammarScore = averageScore(sessions, InterviewSession::getGrammarScore, 0);
        }

        String classification = getClassification(currentScore);

        // Extract Top Skills to Work On
        List<String> skillsToWorkOn = extractTopItems(
                jobMatchList.stream().limit(3).flatMap(j -> {
                    if (j.getMissingSkills() != null) return j.getMissingSkills().stream().filter(s -> s != null);
                    return java.util.stream.Stream.empty();
                }).toList(), 5);

        // Extract Resume Improvements
        List<String> resumeImprovements = extractTopItems(
                atsList.stream().limit(3).flatMap(a -> {
                    List<String> items = new ArrayList<>();
                    if (a.getImprovements() != null) items.addAll(a.getImprovements());
                    if (a.getKeywords() != null) items.addAll(a.getKeywords());
                    return items.stream().filter(s -> s != null);
                }).toList(), 5);

        return new PlacementReadinessResponse(
                currentScore, classification, atsScore, jobMatchScore,
                interviewScore, technicalScore, communicationScore, confidenceScore, grammarScore,
                !atsList.isEmpty(), !jobMatchList.isEmpty(), !sessions.isEmpty(),
                previousScore, skillsToWorkOn, resumeImprovements
        );
    }

    private List<String> extractTopItems(List<String> items, int limit) {
        return items.stream()
                .collect(Collectors.groupingBy(s -> s, Collectors.counting()))
                .entrySet().stream()
                .sorted((e1, e2) -> Long.compare(e2.getValue(), e1.getValue()))
                .map(Map.Entry::getKey)
                .limit(limit)
                .toList();
    }

    private Double calculateScore(List<AtsAnalysis> atsList, List<JobMatchAnalysis> jobMatchList, List<InterviewSession> sessions, 
                                  int atsSkip, int jobSkip, int intSkip) {
        if (atsList.size() <= atsSkip || jobMatchList.size() <= jobSkip || sessions.size() <= intSkip) {
            return null; // Insufficient data to calculate
        }

        Integer atsScore = atsList.get(atsSkip).getAtsScore();
        Integer jobMatchScore = jobMatchList.get(jobSkip).getMatchScore();
        
        Integer interviewScore = averageScore(sessions, InterviewSession::getOverallScore, intSkip);
        Integer technicalScore = averageScore(sessions, InterviewSession::getTechnicalScore, intSkip);
        Integer communicationScore = averageScore(sessions, InterviewSession::getCommunicationScore, intSkip);
        Integer confidenceScore = averageScore(sessions, InterviewSession::getConfidenceScore, intSkip);

        if (atsScore == null || jobMatchScore == null || interviewScore == null || technicalScore == null || communicationScore == null || confidenceScore == null) {
            return null;
        }

        double rawScore = (atsScore * 0.20) + (jobMatchScore * 0.20) + (interviewScore * 0.30) 
                        + (technicalScore * 0.15) + (communicationScore * 0.10) + (confidenceScore * 0.05);
        
        return Math.round(rawScore * 10.0) / 10.0;
    }

    private Integer averageScore(List<InterviewSession> sessions, Function<InterviewSession, Integer> extractor, int skip) {
        return (int) Math.round(sessions.stream().skip(skip).filter(s -> extractor.apply(s) != null)
                .mapToInt(extractor::apply).average().orElse(0));
    }

    private String getClassification(Double score) {
        if (score == null) return null;
        if (score >= 80) return "Job Ready";
        if (score >= 65) return "Almost Ready";
        if (score >= 50) return "Needs Improvement";
        return "Beginner";
    }

    public StudyGuideResponse generateStudyGuide(String email, int days) {
        if (days < 3 || days > 30) {
            throw new IllegalArgumentException(
                    "Study guide duration must be between 3 and 30 days."
            );
        }

        PlacementReadinessResponse readiness = getPlacementReadiness(email);
        if (!readiness.hasAts() || !readiness.hasJobMatch() || !readiness.hasInterviews()) {
            throw new IllegalStateException("Insufficient data to generate a study guide.");
        }

        String prompt = """
                You are a career placement assistant creating a personalized %d-day study guide for a student.

                Return ONLY a valid JSON object matching this structure exactly:

                {
                  "days": [
                    {
                      "day": 1,
                      "focus": "Focus Area Title",
                      "tasks": [
                        "Task 1",
                        "Task 2"
                      ]
                    }
                  ]
                }

                The "days" array MUST contain exactly %d days, numbered sequentially from 1 to %d.

                STUDENT DATA:

                CURRENT PLACEMENT READINESS:
                %s/100

                INTERVIEW PERFORMANCE:
                Overall: %s
                Technical: %s
                Communication: %s
                Confidence: %s

                RECENT JOB MATCH SKILL GAPS:
                %s

                RECENT ATS IMPROVEMENTS / KEYWORDS:
                %s

                INSTRUCTIONS:

                - Prioritize the student's weakest interview areas.
                - Prioritize frequently occurring job skill gaps.
                - Consider ATS improvement areas when relevant.
                - Focus only on areas supported by the student's data.
                - Each day should have one clear focus area.
                - Under each day, provide 2 to 4 meaningful tasks.
                - Keep tasks practical and slightly high-level.
                - Do not make the plan excessively detailed.
                - Do not recommend unrelated technologies or topics.
                - Organize the plan in a logical learning progression.
                - The final day should focus on revision, practice, or assessment.
                """.formatted(
                days,
                days,
                days,
                readiness.readinessScore(),
                readiness.interviewScore(),
                readiness.technicalScore(),
                readiness.communicationScore(),
                readiness.confidenceScore(),
                String.join(", ", readiness.skillsToWorkOn()),
                String.join(", ", readiness.resumeImprovements())
        );

        try {
            Map<String, Object> body = Map.of(
                    "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))),
                    "generationConfig", Map.of("temperature", 0.3, "responseMimeType", "application/json")
            );

            String response = restClient.post()
                    .uri(GEMINI_URL.formatted(model, apiKey))
                    .body(body)
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(response);
            String text = root.path("candidates").path(0).path("content").path("parts").path(0).path("text").asText();
            
            int startIdx = text.indexOf("{");
            int endIdx = text.lastIndexOf("}");
            if (startIdx != -1 && endIdx != -1 && endIdx >= startIdx) {
                text = text.substring(startIdx, endIdx + 1);
            }

            return objectMapper.readValue(text, StudyGuideResponse.class);
        } catch (Exception ex) {
            try {
                java.io.StringWriter sw = new java.io.StringWriter();
                ex.printStackTrace(new java.io.PrintWriter(sw));
                java.nio.file.Files.writeString(java.nio.file.Path.of("error_debug.txt"), "General Error:\n" + sw.toString());
            } catch(Exception e){}
            log.error("Failed to generate study guide: {}", ex.getMessage(), ex);
            throw new RuntimeException("Failed to generate study guide");
        }
    }
}
