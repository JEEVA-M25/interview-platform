package AIINterview.CareerVerse.AI.dto;

import java.time.LocalDateTime;

public record QuestionDto(
        Long id,
        String question,
        String difficulty,
        Integer orderNo,
        boolean isFollowUp,
        String state,
        LocalDateTime questionShownAt
) {}
