package AIINterview.CareerVerse.AI.dto;

public record AdminStudentResponse(
        Long id,
        String fullName,
        String email,
        String college,
        String degree,
        String graduationYear
) {
}
