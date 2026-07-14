package AIINterview.CareerVerse.AI.dto;

import jakarta.validation.constraints.NotBlank;

public record ProctorLogRequest(
        @NotBlank String type,
        @NotBlank String description
) {}
