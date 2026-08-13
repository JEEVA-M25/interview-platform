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
        List<QuestionResultDto> questionResults,
        Integer integrityScore,
        Integer warningsCount,
        Integer eyeContactPercentage,
        Integer facePresentPercentage,
        String multipleFacesDetected,
        String phoneChecked,
        Integer tabSwitches,
        List<ProctorLogDto> proctorLogs,
        String overallEmotion,
        Double averageEmotionConfidence,
        Integer analyzedAnswers,
        Integer totalAnswers
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
            Integer responseTimeSeconds,
            String emotion,
            Double emotionConfidence
    ) {}

    public record ProctorLogDto(
            String timestamp,
            String type,
            String description
    ) {}
}
