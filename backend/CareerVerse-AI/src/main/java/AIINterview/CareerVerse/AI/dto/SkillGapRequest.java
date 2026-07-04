package AIINterview.CareerVerse.AI.dto;

import jakarta.validation.constraints.NotBlank;

public record SkillGapRequest(
        @NotBlank(message = "Resume text is required")
        String resumeText,

        @NotBlank(message = "Job description is required")
        String jobDescription
) {
}
