package AIINterview.CareerVerse.AI.dto;

import java.util.List;
import java.util.Map;

public record ResumeBuilderRequest(
        String fullName,
        String careerGoal,
        List<Map<String, String>> education,
        List<Map<String, Object>> technicalSkills,
        List<Map<String, String>> projects,
        List<Map<String, String>> experience
) {
}
