package AIINterview.CareerVerse.AI.dto;

public record AuthResponse(
        String token,
        String role,
        String fullName,
        String email
) {
}
