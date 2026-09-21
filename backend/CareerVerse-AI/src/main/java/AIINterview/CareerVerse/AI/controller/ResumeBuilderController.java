package AIINterview.CareerVerse.AI.controller;

import AIINterview.CareerVerse.AI.dto.ResumeBuilderRequest;
import AIINterview.CareerVerse.AI.dto.ResumeBuilderSummaryResponse;
import AIINterview.CareerVerse.AI.service.ResumeBuilderService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/resume-builder")
@PreAuthorize("hasRole('STUDENT')")
public class ResumeBuilderController {

    private final ResumeBuilderService resumeBuilderService;

    public ResumeBuilderController(ResumeBuilderService resumeBuilderService) {
        this.resumeBuilderService = resumeBuilderService;
    }

    @PostMapping("/generate-summary")
    public ResumeBuilderSummaryResponse generateSummary(@RequestBody ResumeBuilderRequest request) {
        return resumeBuilderService.generateSummary(request);
    }
}
