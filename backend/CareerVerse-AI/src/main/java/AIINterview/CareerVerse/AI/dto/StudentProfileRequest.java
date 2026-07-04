package AIINterview.CareerVerse.AI.dto;

import jakarta.validation.constraints.NotBlank;

public record StudentProfileRequest(
        @NotBlank String fullName,
        String phone,
        String college,
        String degree,
        String graduationYear,
        String portfolioUrl,
        String linkedinUrl,
        String careerGoal
) {
}
