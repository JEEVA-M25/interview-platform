package AIINterview.CareerVerse.AI.controller;

import AIINterview.CareerVerse.AI.dto.AtsScoreResponse;
import AIINterview.CareerVerse.AI.dto.SkillGapResponse;
import AIINterview.CareerVerse.AI.service.DocumentTextExtractor;
import AIINterview.CareerVerse.AI.service.ResumeAnalysisService;
import jakarta.validation.constraints.NotBlank;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/ai")
public class ResumeAnalysisController {

    private final ResumeAnalysisService resumeAnalysisService;
    private final DocumentTextExtractor documentTextExtractor;

    public ResumeAnalysisController(
            ResumeAnalysisService resumeAnalysisService,
            DocumentTextExtractor documentTextExtractor
    ) {
        this.resumeAnalysisService = resumeAnalysisService;
        this.documentTextExtractor = documentTextExtractor;
    }

    @PostMapping("/ats-score")
    public AtsScoreResponse analyzeAtsScore(@RequestParam("resume") MultipartFile resume) {
        String resumeText = documentTextExtractor.extractText(resume);
        return resumeAnalysisService.analyzeAtsScore(resumeText);
    }

    @PostMapping("/skill-gap")
    public SkillGapResponse analyzeSkillGap(
            @RequestParam("resume") MultipartFile resume,
            @RequestParam("jobDescription") @NotBlank String jobDescription
    ) {
        String resumeText = documentTextExtractor.extractText(resume);
        return resumeAnalysisService.analyzeSkillGap(resumeText, jobDescription);
    }
}
