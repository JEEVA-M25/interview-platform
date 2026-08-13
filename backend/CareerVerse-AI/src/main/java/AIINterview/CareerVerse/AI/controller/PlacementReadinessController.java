package AIINterview.CareerVerse.AI.controller;

import AIINterview.CareerVerse.AI.dto.PlacementReadinessResponse;
import AIINterview.CareerVerse.AI.dto.StudyGuideResponse;
import AIINterview.CareerVerse.AI.service.PlacementReadinessService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/student/readiness")
public class PlacementReadinessController {

    private final PlacementReadinessService placementReadinessService;

    public PlacementReadinessController(PlacementReadinessService placementReadinessService) {
        this.placementReadinessService = placementReadinessService;
    }

    @GetMapping
    public ResponseEntity<PlacementReadinessResponse> getPlacementReadiness(Authentication authentication) {
        PlacementReadinessResponse response = placementReadinessService.getPlacementReadiness(authentication.getName());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/study-guide")
    public ResponseEntity<?> generateStudyGuide(Authentication authentication) {
        try {
            StudyGuideResponse response = placementReadinessService.generateStudyGuide(authentication.getName());
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
}
