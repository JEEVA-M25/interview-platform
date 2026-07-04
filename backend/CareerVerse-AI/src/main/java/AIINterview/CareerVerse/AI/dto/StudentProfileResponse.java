package AIINterview.CareerVerse.AI.dto;

public record StudentProfileResponse(
        String fullName,
        String email,
        String phone,
        String college,
        String degree,
        String graduationYear,
        String portfolioUrl,
        String linkedinUrl,
        String careerGoal
) {
}
