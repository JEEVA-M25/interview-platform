package AIINterview.CareerVerse.AI.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record SubmitAnswerRequest(
        @NotNull Long questionId,
        @NotBlank String transcript,
        /** When the question was shown to the student — used to compute response time */
        LocalDateTime questionShownAt
) {}
