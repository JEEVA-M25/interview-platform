package AIINterview.CareerVerse.AI.dto;

import java.util.List;

public record SkillGapResponse(
        int matchScore,
        String summary,
        List<String> matchedSkills,
        List<String> missingSkills,
        List<String> actionPlan
) {
}
