package AIINterview.CareerVerse.AI.controller;

import AIINterview.CareerVerse.AI.dto.InterviewHistoryDto;
import AIINterview.CareerVerse.AI.dto.InterviewReportResponse;
import AIINterview.CareerVerse.AI.model.AppUser;
import AIINterview.CareerVerse.AI.model.InterviewSession;
import AIINterview.CareerVerse.AI.repository.AppUserRepository;
import AIINterview.CareerVerse.AI.repository.InterviewSessionRepository;
import AIINterview.CareerVerse.AI.service.InterviewSessionService;
import AIINterview.CareerVerse.AI.service.PdfGeneratorService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/interviews")
public class InterviewHistoryController {

    private final InterviewSessionRepository sessionRepository;
    private final AppUserRepository userRepository;
    private final InterviewSessionService sessionService;
    private final PdfGeneratorService pdfGeneratorService;

    public InterviewHistoryController(InterviewSessionRepository sessionRepository,
                                      AppUserRepository userRepository,
                                      InterviewSessionService sessionService,
                                      PdfGeneratorService pdfGeneratorService) {
        this.sessionRepository = sessionRepository;
        this.userRepository = userRepository;
        this.sessionService = sessionService;
        this.pdfGeneratorService = pdfGeneratorService;
    }

    @GetMapping
    public List<InterviewHistoryDto> getInterviews(Principal principal) {
        AppUser user = userRepository.findByEmail(principal.getName()).orElseThrow();
        List<InterviewSession> sessions = sessionRepository.findByUserIdOrderByStartedAtDesc(user.getId());

        return sessions.stream().map(s -> new InterviewHistoryDto(
                s.getId(),
                s.getRole(),
                s.getDifficulty(),
                s.getEndedAt() != null ? s.getEndedAt() : s.getStartedAt(),
                s.getOverallScore(),
                s.getStatus().name()
        )).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public InterviewReportResponse getInterviewDetails(@PathVariable Long id, Principal principal) {
        return sessionService.getReport(principal.getName(), id);
    }

    @GetMapping("/{id}/report")
    public ResponseEntity<byte[]> downloadReport(@PathVariable Long id, Principal principal) {
        AppUser user = userRepository.findByEmail(principal.getName()).orElseThrow();
        InterviewSession session = sessionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Session not found"));
                
        if (!session.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        byte[] pdfBytes = pdfGeneratorService.generateInterviewReport(id);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "CareerVerse-Interview-Report-" + id + ".pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }
}
