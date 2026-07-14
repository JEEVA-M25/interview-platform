package AIINterview.CareerVerse.AI.dto;

import java.util.List;

public record InterviewReportResponse(
        Long sessionId,
        String role,
        String difficulty,
        int overallScore,
        int technicalScore,
        int communicationScore,
        int problemSolvingScore,
        int grammarScore,
        int confidenceScore,
        String overallRecommendation,
        List<String> overallStrengths,
        List<String> overallWeaknesses,
        List<QuestionResultDto> questionResults
) {
    public record QuestionResultDto(
            String question,
            String rawTranscript,
            String editedTranscript,
            int score,
            String feedback,
            String strengths,
            String weaknesses,
            boolean isFollowUp,
            String state,
            Integer responseTimeSeconds
    ) {}
}
