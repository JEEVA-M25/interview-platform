package AIINterview.CareerVerse.AI.dto;

public record EvaluationResponse(
        Long answerId,
        int score,
        String feedback,
        String strengths,
        String weaknesses,
        Integer responseTimeSeconds,
        /** Short spoken comment the AI interviewer says after evaluating — e.g. "Good answer. Let's move on." */
        String interviewerComment,
        boolean hasFollowUp,
        QuestionDto followUpQuestion
) {}
