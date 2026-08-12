package AIINterview.CareerVerse.AI.dto;

import java.time.LocalDateTime;
import java.util.List;

public record JobMatchHistoryDto(
        Long id,
        int matchScore,
        String summary,
        List<String> matchedSkills,
        List<String> missingSkills,
        List<String> recommendations,
        String jobDescription,
        String resumeUrl,
        String resumeName,
        LocalDateTime createdAt
) {}
