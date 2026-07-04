package AIINterview.CareerVerse.AI.controller;

import AIINterview.CareerVerse.AI.dto.StudentProfileRequest;
import AIINterview.CareerVerse.AI.dto.StudentProfileResponse;
import AIINterview.CareerVerse.AI.service.StudentProfileService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/student")
@PreAuthorize("hasRole('STUDENT')")
public class StudentController {

    private final StudentProfileService studentProfileService;

    public StudentController(StudentProfileService studentProfileService) {
        this.studentProfileService = studentProfileService;
    }

    @GetMapping("/profile")
    public StudentProfileResponse getProfile(Authentication authentication) {
        return studentProfileService.getMyProfile(authentication.getName());
    }

    @PutMapping("/profile")
    public StudentProfileResponse updateProfile(
            Authentication authentication,
            @Valid @RequestBody StudentProfileRequest request
    ) {
        return studentProfileService.updateMyProfile(authentication.getName(), request);
    }
}
