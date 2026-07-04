package AIINterview.CareerVerse.AI.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record StudentRegisterRequest(
        @NotBlank String fullName,
        @Email @NotBlank String email,
        @Size(min = 6, message = "Password must be at least 6 characters")
        String password,
        String phone,
        String college,
        String degree,
        String graduationYear
) {
}
