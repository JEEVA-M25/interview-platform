package AIINterview.CareerVerse.AI.dto;

import java.time.LocalDate;

public record DashboardScoreDto(
        LocalDate date,
        int score
) {}
