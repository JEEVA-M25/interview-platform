package AIINterview.CareerVerse.AI.dto;

import java.time.LocalDateTime;

public record InterviewHistoryDto(
        Long sessionId,
        String role,
        String difficulty,
        LocalDateTime interviewDate,
        Integer overallScore,
        String status
) {}
