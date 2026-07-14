package AIINterview.CareerVerse.AI.controller;

import AIINterview.CareerVerse.AI.dto.*;
import AIINterview.CareerVerse.AI.service.DocumentTextExtractor;
import AIINterview.CareerVerse.AI.service.InterviewSessionService;
import AIINterview.CareerVerse.AI.service.ReportPdfService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/interview")
public class InterviewController {

    private final InterviewSessionService sessionService;
    private final DocumentTextExtractor textExtractor;
    private final ReportPdfService reportPdfService;

    public InterviewController(InterviewSessionService sessionService,
                               DocumentTextExtractor textExtractor,
                               ReportPdfService reportPdfService) {
        this.sessionService = sessionService;
        this.textExtractor = textExtractor;
        this.reportPdfService = reportPdfService;
    }

    /** POST /api/interview/sessions — upload resume + role + difficulty, get back session + all questions */
    @PostMapping("/sessions")
    @ResponseStatus(HttpStatus.CREATED)
    public SessionResponse createSession(
            @RequestParam("resume") MultipartFile resume,
            @RequestParam("role") String role,
            @RequestParam("difficulty") String difficulty,
            Principal principal
    ) {
        String resumeText = textExtractor.extractText(resume);
        return sessionService.createSession(principal.getName(), resumeText, role, difficulty);
    }

    /** GET /api/interview/sessions — all past sessions for the logged-in user (history + resume) */
    @GetMapping("/sessions")
    public List<SessionResponse> getMySessions(Principal principal) {
        return sessionService.getSessionsForUser(principal.getName());
    }

    /**
     * POST /api/interview/sessions/{sessionId}/questions/{questionId}/shown
     * Frontend calls this the moment a question appears on screen.
     * Marks state=ASKED, records questionShownAt — used to compute response time.
     */
    @PostMapping("/sessions/{sessionId}/questions/{questionId}/shown")
    public QuestionDto markQuestionShown(
            @PathVariable Long sessionId,
            @PathVariable Long questionId,
            Principal principal
    ) {
        return sessionService.markQuestionShown(principal.getName(), sessionId, questionId);
    }

    /** POST /api/interview/sessions/{sessionId}/answers — submit transcript, get score + optional follow-up */
    @PostMapping("/sessions/{sessionId}/answers")
    public EvaluationResponse submitAnswer(
            @PathVariable Long sessionId,
            @Valid @RequestBody SubmitAnswerRequest request,
            Principal principal
    ) {
        return sessionService.submitAnswer(principal.getName(), sessionId, request);
    }

    /**
     * POST /api/interview/sessions/{sessionId}/questions/{questionId}/skip
     * Marks question as SKIPPED and advances progress.
     */
    @PostMapping("/sessions/{sessionId}/questions/{questionId}/skip")
    public EvaluationResponse skipQuestion(
            @PathVariable Long sessionId,
            @PathVariable Long questionId,
            Principal principal
    ) {
        return sessionService.skipQuestion(principal.getName(), sessionId, questionId);
    }

    /**
     * PATCH /api/interview/sessions/{sessionId}/answers/{answerId}/transcript
     * Student corrects speech recognition mistakes before the final report is generated.
     */
    @PatchMapping("/sessions/{sessionId}/answers/{answerId}/transcript")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void editTranscript(
            @PathVariable Long sessionId,
            @PathVariable Long answerId,
            @RequestParam @NotBlank String editedTranscript,
            Principal principal
    ) {
        sessionService.editTranscript(principal.getName(), sessionId, answerId, editedTranscript);
    }

    /** POST /api/interview/sessions/{sessionId}/end — ends interview, returns full scored report */
    @PostMapping("/sessions/{sessionId}/end")
    public InterviewReportResponse endSession(
            @PathVariable Long sessionId,
            Principal principal
    ) {
        return sessionService.endSession(principal.getName(), sessionId);
    }

    /** GET /api/interview/sessions/{sessionId}/report — fetch report for a completed session */
    @GetMapping("/sessions/{sessionId}/report")
    public InterviewReportResponse getReport(
            @PathVariable Long sessionId,
            Principal principal
    ) {
        return sessionService.getReport(principal.getName(), sessionId);
    }

    /**
     * GET /api/interview/sessions/{sessionId}/report/pdf
     * Downloads the interview report as a professional PDF.
     */
    @GetMapping("/sessions/{sessionId}/report/pdf")
    public ResponseEntity<byte[]> downloadReportPdf(
            @PathVariable Long sessionId,
            Principal principal
    ) throws IOException {
        InterviewReportResponse report = sessionService.getReport(principal.getName(), sessionId);
        // Extract candidate name from principal (email) — service resolves full name
        String candidateName = sessionService.getCandidateName(principal.getName());
        byte[] pdf = reportPdfService.generate(report, candidateName);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"CareerVerse-Interview-Report-" + sessionId + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
