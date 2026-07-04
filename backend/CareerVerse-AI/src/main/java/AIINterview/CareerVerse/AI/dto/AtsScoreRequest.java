package AIINterview.CareerVerse.AI.dto;

import jakarta.validation.constraints.NotBlank;

public record AtsScoreRequest(
        @NotBlank(message = "Resume text is required")
        String resumeText
) {
}
