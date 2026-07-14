package AIINterview.CareerVerse.AI.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateSessionRequest(
        @NotBlank String role,
        @NotBlank String difficulty
) {}
