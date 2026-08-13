package AIINterview.CareerVerse.AI.controller;

import AIINterview.CareerVerse.AI.dto.PlacementReadinessResponse;
import AIINterview.CareerVerse.AI.dto.StudyGuideResponse;
import AIINterview.CareerVerse.AI.service.PlacementReadinessService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import AIINterview.CareerVerse.AI.repository.AppUserRepository;
import AIINterview.CareerVerse.AI.model.AppUser;

@RestController
@RequestMapping("/api/student/readiness")
public class PlacementReadinessController {

    private final PlacementReadinessService placementReadinessService;
    private final AIINterview.CareerVerse.AI.service.PdfGeneratorService pdfGeneratorService;
    private final AppUserRepository appUserRepository;

    public PlacementReadinessController(
            PlacementReadinessService placementReadinessService,
            AIINterview.CareerVerse.AI.service.PdfGeneratorService pdfGeneratorService,
            AppUserRepository appUserRepository) {
        this.placementReadinessService = placementReadinessService;
        this.pdfGeneratorService = pdfGeneratorService;
        this.appUserRepository = appUserRepository;
    }

    @GetMapping
    public ResponseEntity<PlacementReadinessResponse> getPlacementReadiness(Authentication authentication) {
        PlacementReadinessResponse response = placementReadinessService.getPlacementReadiness(authentication.getName());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/study-guide")
    public ResponseEntity<?> generateStudyGuide(
            Authentication authentication,
            @RequestParam(defaultValue = "7") int days) {
        try {
            StudyGuideResponse response = placementReadinessService.generateStudyGuide(authentication.getName(), days);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            try {
                java.io.StringWriter sw = new java.io.StringWriter();
                e.printStackTrace(new java.io.PrintWriter(sw));
                java.nio.file.Files.writeString(java.nio.file.Path.of("global_error.txt"), sw.toString());
            } catch (Exception ignore) {}
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/study-guide/pdf")
    public ResponseEntity<byte[]> downloadStudyGuidePdf(
            @RequestBody StudyGuideResponse guide,
            Authentication authentication) {
        
        String email = authentication.getName();
        String fullName = appUserRepository.findByEmail(email)
                .map(AppUser::getFullName)
                .orElse(email);
        
        byte[] pdfBytes = pdfGeneratorService.generateStudyGuidePdf(guide, fullName);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "Study_Plan.pdf");
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }
}
