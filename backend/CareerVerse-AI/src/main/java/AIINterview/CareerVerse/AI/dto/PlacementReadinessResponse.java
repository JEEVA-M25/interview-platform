package AIINterview.CareerVerse.AI.dto;

import java.util.List;

public record PlacementReadinessResponse(
        Double readinessScore,
        String classification,
        Integer atsScore,
        Integer jobMatchScore,
        Integer interviewScore,
        Integer technicalScore,
        Integer communicationScore,
        Integer confidenceScore,
        Integer grammarScore,
        boolean hasAts,
        boolean hasJobMatch,
        boolean hasInterviews,
        Double previousReadinessScore,
        List<String> skillsToWorkOn,
        List<String> resumeImprovements
) {}
