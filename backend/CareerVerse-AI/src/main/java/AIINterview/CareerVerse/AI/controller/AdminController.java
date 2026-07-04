package AIINterview.CareerVerse.AI.controller;

import AIINterview.CareerVerse.AI.dto.AdminStudentResponse;
import AIINterview.CareerVerse.AI.service.StudentProfileService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final StudentProfileService studentProfileService;

    public AdminController(StudentProfileService studentProfileService) {
        this.studentProfileService = studentProfileService;
    }

    @GetMapping("/students")
    public List<AdminStudentResponse> getStudents() {
        return studentProfileService.getStudents();
    }
}
