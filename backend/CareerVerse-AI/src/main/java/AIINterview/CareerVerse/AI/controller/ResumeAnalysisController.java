// ResumeAnalysisController.java
package AIINterview.CareerVerse.AI.controller;

import AIINterview.CareerVerse.AI.dto.AtsScoreResponse;
import AIINterview.CareerVerse.AI.dto.SkillGapResponse;
import AIINterview.CareerVerse.AI.dto.AtsHistoryDto;
import AIINterview.CareerVerse.AI.dto.JobMatchHistoryDto;
import AIINterview.CareerVerse.AI.service.DocumentTextExtractor;
import AIINterview.CareerVerse.AI.service.ResumeAnalysisService;
import jakarta.validation.constraints.NotBlank;
import AIINterview.CareerVerse.AI.model.AppUser;
import AIINterview.CareerVerse.AI.repository.AppUserRepository;
import AIINterview.CareerVerse.AI.service.S3StorageService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import java.security.Principal;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/ai")
public class ResumeAnalysisController {

    private final ResumeAnalysisService resumeAnalysisService;
    private final DocumentTextExtractor documentTextExtractor;
    private final AppUserRepository appUserRepository;
    private final S3StorageService s3StorageService;

    public ResumeAnalysisController(
            ResumeAnalysisService resumeAnalysisService,
            DocumentTextExtractor documentTextExtractor,
            AppUserRepository appUserRepository,
            S3StorageService s3StorageService
    ) {
        this.resumeAnalysisService = resumeAnalysisService;
        this.documentTextExtractor = documentTextExtractor;
        this.appUserRepository = appUserRepository;
        this.s3StorageService = s3StorageService;
    }

    @PostMapping("/ats-score")
    public AtsScoreResponse analyzeAtsScore(
            @RequestParam("resume") MultipartFile resume,
            Principal principal
    ) throws IOException {
        String email = principal.getName();
        AppUser user = appUserRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        String resumeS3Key = s3StorageService.uploadResume(resume, user.getId());
        String resumeText = documentTextExtractor.extractText(resume);
        String resumeName = resume.getOriginalFilename();
        
        return resumeAnalysisService.analyzeAndSaveAtsScore(resumeText, user, resumeS3Key, resumeName);
    }

    @PostMapping("/skill-gap")
    public SkillGapResponse analyzeSkillGap(
            @RequestParam("resume") MultipartFile resume,
            @RequestParam("jobDescription") @NotBlank String jobDescription,
            Principal principal
    ) throws IOException {
        String email = principal.getName();
        AppUser user = appUserRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        String resumeS3Key = s3StorageService.uploadResume(resume, user.getId());
        String resumeText = documentTextExtractor.extractText(resume);
        String resumeName = resume.getOriginalFilename();
        
        return resumeAnalysisService.analyzeAndSaveSkillGap(resumeText, jobDescription, user, resumeS3Key, resumeName);
    }

    @GetMapping("/ats-history")
    public List<AtsHistoryDto> getAtsHistory(Principal principal) {
        return resumeAnalysisService.getAtsHistory(principal.getName());
    }

    @GetMapping("/job-match-history")
    public List<JobMatchHistoryDto> getJobMatchHistory(Principal principal) {
        return resumeAnalysisService.getJobMatchHistory(principal.getName());
    }
}
