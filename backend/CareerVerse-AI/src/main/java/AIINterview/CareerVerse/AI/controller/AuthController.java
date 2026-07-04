package AIINterview.CareerVerse.AI.controller;

import AIINterview.CareerVerse.AI.dto.AuthResponse;
import AIINterview.CareerVerse.AI.dto.LoginRequest;
import AIINterview.CareerVerse.AI.dto.StudentRegisterRequest;
import AIINterview.CareerVerse.AI.dto.StudentRegisterResponse;
import AIINterview.CareerVerse.AI.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/register/student")
    public StudentRegisterResponse registerStudent(@Valid @RequestBody StudentRegisterRequest request) {
        return authService.registerStudent(request);
    }
}
