package AIINterview.CareerVerse.AI.service;

import AIINterview.CareerVerse.AI.dto.*;
import AIINterview.CareerVerse.AI.model.*;
import AIINterview.CareerVerse.AI.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
public class InterviewSessionService {

    private final InterviewSessionRepository sessionRepo;
    private final InterviewQuestionRepository questionRepo;
    private final InterviewAnswerRepository answerRepo;
    private final AppUserRepository userRepo;
    private final QuestionGeneratorService questionGenerator;
    private final EvaluationService evaluationService;

    public InterviewSessionService(
            InterviewSessionRepository sessionRepo,
            InterviewQuestionRepository questionRepo,
            InterviewAnswerRepository answerRepo,
            AppUserRepository userRepo,
            QuestionGeneratorService questionGenerator,
            EvaluationService evaluationService
    ) {
        this.sessionRepo = sessionRepo;
        this.questionRepo = questionRepo;
        this.answerRepo = answerRepo;
        this.userRepo = userRepo;
        this.questionGenerator = questionGenerator;
        this.evaluationService = evaluationService;
    }

    @Transactional
    public SessionResponse createSession(String userEmail, String resumeText,
                                         String role, String difficulty) {
        AppUser user = userRepo.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        InterviewSession session = new InterviewSession();
        session.setUser(user);
        session.setRole(role);
        session.setDifficulty(difficulty);
        session.setResumeText(resumeText);
        session.setStatus(InterviewSession.SessionStatus.CREATED);
        session.setStartedAt(LocalDateTime.now());
        session.setCurrentQuestionIndex(0);
        sessionRepo.save(session);

        QuestionGeneratorService.GenerationResult result =
                questionGenerator.generateQuestions(resumeText, role, difficulty);

        session.setGenerationPrompt(result.prompt());

        List<InterviewQuestion> saved = new ArrayList<>();
        for (int i = 0; i < result.questions().size(); i++) {
            InterviewQuestion q = new InterviewQuestion();
            q.setSession(session);
            q.setQuestion(result.questions().get(i));
            q.setDifficulty(difficulty);
            q.setOrderNo(i + 1);
            q.setFollowUp(false);
            q.setState(InterviewQuestion.QuestionState.NOT_ASKED);
            saved.add(questionRepo.save(q));
        }

        session.setStatus(InterviewSession.SessionStatus.IN_PROGRESS);
        sessionRepo.save(session);

        // Generate personalized AI interviewer greeting
        String intro = questionGenerator.generateInterviewerIntro(
                user.getFullName(), role, difficulty, saved.size());

        return toSessionResponse(session, saved, intro);
    }

    /**
     * Called by frontend when a question is displayed to the student.
     * Marks it ASKED and records the shown timestamp.
     */
    @Transactional
    public QuestionDto markQuestionShown(String userEmail, Long sessionId, Long questionId) {
        getSessionForUser(sessionId, userEmail); // ownership check

        InterviewQuestion question = questionRepo.findById(questionId)
                .orElseThrow(() -> new IllegalArgumentException("Question not found"));

        if (!question.getSession().getId().equals(sessionId)) {
            throw new IllegalArgumentException("Question does not belong to this session");
        }

        if (question.getState() == InterviewQuestion.QuestionState.NOT_ASKED) {
            question.setState(InterviewQuestion.QuestionState.ASKED);
            question.setQuestionShownAt(LocalDateTime.now());
            questionRepo.save(question);
        }

        return toQuestionDto(question);
    }

    @Transactional
    public EvaluationResponse submitAnswer(String userEmail, Long sessionId, SubmitAnswerRequest request) {
        InterviewSession session = getSessionForUser(sessionId, userEmail);

        InterviewQuestion question = questionRepo.findById(request.questionId())
                .orElseThrow(() -> new IllegalArgumentException("Question not found"));

        if (!question.getSession().getId().equals(sessionId)) {
            throw new IllegalArgumentException("Question does not belong to this session");
        }

        LocalDateTime submittedAt = LocalDateTime.now();
        Integer responseTimeSeconds = null;

        // Compute response time: prefer questionShownAt from DB, fall back to request field
        LocalDateTime shownAt = question.getQuestionShownAt() != null
                ? question.getQuestionShownAt()
                : request.questionShownAt();

        if (shownAt != null) {
            responseTimeSeconds = (int) ChronoUnit.SECONDS.between(shownAt, submittedAt);
        }

        // Save raw answer to database (Evaluation is deferred to the end of the session to speed up transition)
        InterviewAnswer answer = question.getAnswer();
        if (answer == null) {
            answer = new InterviewAnswer();
            answer.setQuestion(question);
        }
        answer.setRawTranscript(request.transcript());
        answer.setEditedTranscript(null);
        answer.setScore(0);
        answer.setFeedback("");
        answer.setStrengths("");
        answer.setWeaknesses("");
        answerRepo.save(answer);

        // Update question state and timing
        question.setState(InterviewQuestion.QuestionState.ANSWERED);
        question.setAnswerSubmittedAt(submittedAt);
        if (shownAt != null && question.getQuestionShownAt() == null) {
            question.setQuestionShownAt(shownAt);
        }
        question.setResponseTimeSeconds(responseTimeSeconds);
        questionRepo.save(question);

        // Advance session progress index
        List<InterviewQuestion> allQuestions = questionRepo.findBySessionIdOrderByOrderNoAsc(sessionId);
        long answeredCount = allQuestions.stream()
                .filter(q -> q.getState() == InterviewQuestion.QuestionState.ANSWERED
                          || q.getState() == InterviewQuestion.QuestionState.SKIPPED)
                .count();
        session.setCurrentQuestionIndex((int) answeredCount);
        sessionRepo.save(session);

        // Decide follow-up directly from the answer (Single Gemini call), only if the current question isn't already a follow-up
        String followUpText = null;
        if (!question.isFollowUp()) {
            followUpText = questionGenerator.generateFollowUp(question.getQuestion(), request.transcript());
        }

        QuestionDto followUpDto = null;
        if (followUpText != null) {
            int nextOrder = allQuestions.stream()
                    .mapToInt(q -> q.getOrderNo() == null ? 0 : q.getOrderNo())
                    .max().orElse(0) + 1;

            InterviewQuestion followUp = new InterviewQuestion();
            followUp.setSession(session);
            followUp.setQuestion(followUpText);
            followUp.setDifficulty(session.getDifficulty());
            followUp.setOrderNo(nextOrder);
            followUp.setFollowUp(true);
            followUp.setState(InterviewQuestion.QuestionState.NOT_ASKED);
            questionRepo.save(followUp);

            followUpDto = toQuestionDto(followUp);
        }

        return new EvaluationResponse(
                answer.getId(),
                0,
                "",
                "",
                "",
                responseTimeSeconds,
                "Understood. Let's move to the next question.",
                followUpDto != null,
                followUpDto
        );
    }

    @Transactional
    public EvaluationResponse skipQuestion(String userEmail, Long sessionId, Long questionId) {
        InterviewSession session = getSessionForUser(sessionId, userEmail);

        InterviewQuestion question = questionRepo.findById(questionId)
                .orElseThrow(() -> new IllegalArgumentException("Question not found"));

        if (!question.getSession().getId().equals(sessionId)) {
            throw new IllegalArgumentException("Question does not belong to this session");
        }

        question.setState(InterviewQuestion.QuestionState.SKIPPED);
        question.setAnswerSubmittedAt(LocalDateTime.now());
        questionRepo.save(question);

        List<InterviewQuestion> allQuestions = questionRepo.findBySessionIdOrderByOrderNoAsc(sessionId);
        long answeredCount = allQuestions.stream()
                .filter(q -> q.getState() == InterviewQuestion.QuestionState.ANSWERED
                          || q.getState() == InterviewQuestion.QuestionState.SKIPPED)
                .count();
        session.setCurrentQuestionIndex((int) answeredCount);
        sessionRepo.save(session);

        return new EvaluationResponse(null, 0, "Question skipped.", "", "", null, "Understood. Let us move on.", false, null);
    }

    /**
     * Allows student to correct speech recognition mistakes before final report.
     */
    @Transactional
    public void editTranscript(String userEmail, Long sessionId, Long answerId, String editedTranscript) {
        getSessionForUser(sessionId, userEmail);

        InterviewAnswer answer = answerRepo.findById(answerId)
                .orElseThrow(() -> new IllegalArgumentException("Answer not found"));

        answer.setEditedTranscript(editedTranscript);
        answerRepo.save(answer);
    }

    @Transactional
    public void addProctorLog(String userEmail, Long sessionId, ProctorLogRequest request) {
        InterviewSession session = getSessionForUser(sessionId, userEmail);
        ProctorLogEntry entry = new ProctorLogEntry();
        entry.setSession(session);
        entry.setTimestamp(LocalDateTime.now());
        entry.setType(request.type());
        entry.setDescription(request.description());
        session.getProctorLogs().add(entry);
        sessionRepo.save(session);
    }

    @Transactional
    public InterviewReportResponse endSession(String userEmail, Long sessionId, EndSessionRequest integrityRequest) {
        InterviewSession session = getSessionForUser(sessionId, userEmail);

        List<InterviewQuestion> questions = questionRepo.findBySessionIdOrderByOrderNoAsc(sessionId);

        // Evaluate all pending answers in parallel using CompletableFuture to make question submission instant
        class EvalTask {
            InterviewAnswer answer;
            String questionText;
            String transcript;
            EvaluationService.AnswerEvaluation result;

            EvalTask(InterviewAnswer answer, String questionText, String transcript) {
                this.answer = answer;
                this.questionText = questionText;
                this.transcript = transcript;
            }
        }

        List<EvalTask> tasks = new ArrayList<>();
        for (InterviewQuestion q : questions) {
            InterviewAnswer a = q.getAnswer();
            if (q.getState() == InterviewQuestion.QuestionState.ANSWERED && a != null) {
                if (a.getScore() == null || a.getScore() == 0) {
                    tasks.add(new EvalTask(a, q.getQuestion(), a.getEffectiveTranscript()));
                }
            }
        }

        if (!tasks.isEmpty()) {
            List<CompletableFuture<Void>> futures = new ArrayList<>();
            for (EvalTask task : tasks) {
                futures.add(CompletableFuture.runAsync(() -> {
                    task.result = evaluationService.evaluate(task.questionText, task.transcript);
                }));
            }
            CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

            // Save results sequentially on the main thread
            for (EvalTask task : tasks) {
                if (task.result != null) {
                    InterviewAnswer latestAnswer = answerRepo.findById(task.answer.getId()).orElse(task.answer);
                    latestAnswer.setScore(task.result.score());
                    latestAnswer.setFeedback(task.result.feedback());
                    latestAnswer.setStrengths(task.result.strengths());
                    latestAnswer.setWeaknesses(task.result.weaknesses());
                    latestAnswer.setPromptTokens(task.result.promptTokens());
                    latestAnswer.setCompletionTokens(task.result.completionTokens());
                    answerRepo.save(latestAnswer);
                }
            }
        }

        List<String> questionTexts = new ArrayList<>();
        List<String> answerTexts = new ArrayList<>();
        List<InterviewReportResponse.QuestionResultDto> results = new ArrayList<>();

        int totalScore = 0;
        for (InterviewQuestion q : questions) {
            InterviewAnswer a = q.getAnswer();
            questionTexts.add(q.getQuestion());
            // Use effective transcript (edited if available) for final scoring
            String transcript = a != null ? a.getEffectiveTranscript() : "";
            answerTexts.add(transcript != null ? transcript : "");

            int score = a != null && a.getScore() != null ? a.getScore() : 0;
            totalScore += score;

            results.add(new InterviewReportResponse.QuestionResultDto(
                    q.getQuestion(),
                    a != null ? a.getRawTranscript() : "",
                    a != null ? a.getEditedTranscript() : null,
                    score,
                    a != null ? a.getFeedback() : "",
                    a != null ? a.getStrengths() : "",
                    a != null ? a.getWeaknesses() : "",
                    q.isFollowUp(),
                    q.getState().name(),
                    q.getResponseTimeSeconds(),
                    a != null ? a.getEmotion() : null,
                    a != null ? a.getEmotionConfidence() : null
            ));
        }

        EvaluationService.FinalScores scores =
                evaluationService.generateFinalScores(session.getRole(), questionTexts, answerTexts);

        session.setOverallScore(totalScore);
        session.setTechnicalScore(scores.technical());
        session.setCommunicationScore(scores.communication());
        session.setProblemSolvingScore(scores.problemSolving());
        session.setGrammarScore(scores.grammar());
        session.setConfidenceScore(scores.confidence());
        session.setOverallRecommendation(scores.recommendation());
        session.setStatus(InterviewSession.SessionStatus.COMPLETED);
        session.setEndedAt(LocalDateTime.now());

        if (integrityRequest != null) {
            session.setIntegrityScore(integrityRequest.integrityScore());
            session.setWarningsCount(integrityRequest.warningsCount());
            session.setEyeContactPercentage(integrityRequest.eyeContactPercentage());
            session.setFacePresentPercentage(integrityRequest.facePresentPercentage());
            session.setMultipleFacesDetected(integrityRequest.multipleFacesDetected());
            session.setPhoneChecked(integrityRequest.phoneChecked());
            session.setTabSwitches(integrityRequest.tabSwitches());
        }
        sessionRepo.save(session);

        List<InterviewReportResponse.ProctorLogDto> proctorLogDtos = new ArrayList<>();
        if (session.getProctorLogs() != null) {
            DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm:ss");
            for (ProctorLogEntry log : session.getProctorLogs()) {
                proctorLogDtos.add(new InterviewReportResponse.ProctorLogDto(
                        log.getTimestamp().format(timeFormatter),
                        log.getType(),
                        log.getDescription()
                ));
            }
        }

        return new InterviewReportResponse(
                session.getId(), session.getRole(), session.getDifficulty(),
                totalScore, scores.technical(), scores.communication(),
                scores.problemSolving(), scores.grammar(), scores.confidence(),
                scores.recommendation(), scores.overallStrengths(), scores.overallWeaknesses(), results,
                session.getIntegrityScore(), session.getWarningsCount(), session.getEyeContactPercentage(),
                session.getFacePresentPercentage(), session.getMultipleFacesDetected(), session.getPhoneChecked(),
                session.getTabSwitches(), proctorLogDtos
        );
    }

    public List<SessionResponse> getSessionsForUser(String userEmail) {
        AppUser user = userRepo.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return sessionRepo.findByUserIdOrderByStartedAtDesc(user.getId())
                .stream()
                .map(s -> toSessionResponse(s, questionRepo.findBySessionIdOrderByOrderNoAsc(s.getId()), null))
                .toList();
    }

    public InterviewReportResponse getReport(String userEmail, Long sessionId) {
        InterviewSession session = getSessionForUser(sessionId, userEmail);

        if (session.getStatus() != InterviewSession.SessionStatus.COMPLETED) {
            throw new IllegalStateException("Interview is not completed yet");
        }

        List<InterviewQuestion> questions = questionRepo.findBySessionIdOrderByOrderNoAsc(sessionId);
        List<InterviewReportResponse.QuestionResultDto> results = questions.stream()
                .map(q -> {
                    InterviewAnswer a = q.getAnswer();
                    return new InterviewReportResponse.QuestionResultDto(
                            q.getQuestion(),
                            a != null ? a.getRawTranscript() : "",
                            a != null ? a.getEditedTranscript() : null,
                            a != null && a.getScore() != null ? a.getScore() : 0,
                            a != null ? a.getFeedback() : "",
                            a != null ? a.getStrengths() : "",
                            a != null ? a.getWeaknesses() : "",
                            q.isFollowUp(),
                            q.getState().name(),
                            q.getResponseTimeSeconds(),
                            a != null ? a.getEmotion() : null,
                            a != null ? a.getEmotionConfidence() : null
                    );
                }).toList();

        List<InterviewReportResponse.ProctorLogDto> proctorLogDtos = new ArrayList<>();
        if (session.getProctorLogs() != null) {
            DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm:ss");
            for (ProctorLogEntry log : session.getProctorLogs()) {
                proctorLogDtos.add(new InterviewReportResponse.ProctorLogDto(
                        log.getTimestamp().format(timeFormatter),
                        log.getType(),
                        log.getDescription()
                ));
            }
        }

        return new InterviewReportResponse(
                session.getId(), session.getRole(), session.getDifficulty(),
                orZero(session.getOverallScore()), orZero(session.getTechnicalScore()),
                orZero(session.getCommunicationScore()), orZero(session.getProblemSolvingScore()),
                orZero(session.getGrammarScore()), orZero(session.getConfidenceScore()),
                session.getOverallRecommendation(), List.of(), List.of(), results,
                session.getIntegrityScore(), session.getWarningsCount(), session.getEyeContactPercentage(),
                session.getFacePresentPercentage(), session.getMultipleFacesDetected(), session.getPhoneChecked(),
                session.getTabSwitches(), proctorLogDtos
        );
    }

    public String getCandidateName(String userEmail) {
        return userRepo.findByEmail(userEmail)
                .map(u -> u.getFullName() != null ? u.getFullName() : userEmail)
                .orElse(userEmail);
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private InterviewSession getSessionForUser(Long sessionId, String userEmail) {
        InterviewSession session = sessionRepo.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));
        if (!session.getUser().getEmail().equals(userEmail)) {
            throw new IllegalArgumentException("Access denied");
        }
        return session;
    }

    private SessionResponse toSessionResponse(InterviewSession session, List<InterviewQuestion> questions, String intro) {
        int total = questions.size();
        int completed = (int) questions.stream()
                .filter(q -> q.getState() == InterviewQuestion.QuestionState.ANSWERED
                          || q.getState() == InterviewQuestion.QuestionState.SKIPPED)
                .count();
        return new SessionResponse(
                session.getId(),
                session.getRole(),
                session.getDifficulty(),
                session.getStatus().name(),
                orZero(session.getCurrentQuestionIndex()),
                total,
                completed,
                total - completed,
                intro,
                questions.stream().map(this::toQuestionDto).toList()
        );
    }

    private QuestionDto toQuestionDto(InterviewQuestion q) {
        return new QuestionDto(
                q.getId(), q.getQuestion(), q.getDifficulty(), q.getOrderNo(),
                q.isFollowUp(), q.getState().name(), q.getQuestionShownAt()
        );
    }

    private int orZero(Integer value) {
        return value == null ? 0 : value;
    }
}
