package AIINterview.CareerVerse.AI.dto;

public record DashboardSummaryDto(
        int totalInterviews,
        double averageScore,
        int highestScore,
        int lowestScore,
        int averageAtsScore,
        String placementReadiness
) {}
