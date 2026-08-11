package AIINterview.CareerVerse.AI.dto;

import java.time.LocalDateTime;
import java.util.List;

public record AtsHistoryDto(
        Long id,
        int score,
        String summary,
        List<String> strengths,
        List<String> improvements,
        List<String> keywords,
        String resumeUrl,
        LocalDateTime createdAt
) {}
