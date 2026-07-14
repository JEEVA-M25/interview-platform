package AIINterview.CareerVerse.AI.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "interview_sessions")
public class InterviewSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @Column(nullable = false)
    private String role;

    @Column(nullable = false)
    private String difficulty;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SessionStatus status;

    @Column(columnDefinition = "TEXT")
    private String resumeText;

    /** The exact prompt sent to Gemini for question generation — stored for regeneration/debugging */
    @Column(columnDefinition = "TEXT")
    private String generationPrompt;

    private LocalDateTime startedAt;
    private LocalDateTime endedAt;

    /** Tracks which question the student is currently on (0-based index) — enables session resume */
    private Integer currentQuestionIndex;

    private Integer overallScore;
    private Integer technicalScore;
    private Integer communicationScore;
    private Integer problemSolvingScore;
    private Integer grammarScore;
    private Integer confidenceScore;

    @Column(columnDefinition = "TEXT")
    private String overallRecommendation;

    // Integrity & Proctoring summary statistics
    private Integer integrityScore;
    private Integer warningsCount;
    private Integer eyeContactPercentage;
    private Integer facePresentPercentage;
    private String multipleFacesDetected;
    private String phoneChecked;
    private Integer tabSwitches;

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ProctorLogEntry> proctorLogs = new ArrayList<>();

    public enum SessionStatus {
        CREATED, IN_PROGRESS, COMPLETED
    }

    public Long getId() { return id; }

    public AppUser getUser() { return user; }
    public void setUser(AppUser user) { this.user = user; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public SessionStatus getStatus() { return status; }
    public void setStatus(SessionStatus status) { this.status = status; }

    public String getResumeText() { return resumeText; }
    public void setResumeText(String resumeText) { this.resumeText = resumeText; }

    public String getGenerationPrompt() { return generationPrompt; }
    public void setGenerationPrompt(String generationPrompt) { this.generationPrompt = generationPrompt; }

    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }

    public LocalDateTime getEndedAt() { return endedAt; }
    public void setEndedAt(LocalDateTime endedAt) { this.endedAt = endedAt; }

    public Integer getCurrentQuestionIndex() { return currentQuestionIndex; }
    public void setCurrentQuestionIndex(Integer currentQuestionIndex) { this.currentQuestionIndex = currentQuestionIndex; }

    public Integer getOverallScore() { return overallScore; }
    public void setOverallScore(Integer overallScore) { this.overallScore = overallScore; }

    public Integer getTechnicalScore() { return technicalScore; }
    public void setTechnicalScore(Integer technicalScore) { this.technicalScore = technicalScore; }

    public Integer getCommunicationScore() { return communicationScore; }
    public void setCommunicationScore(Integer communicationScore) { this.communicationScore = communicationScore; }

    public Integer getProblemSolvingScore() { return problemSolvingScore; }
    public void setProblemSolvingScore(Integer problemSolvingScore) { this.problemSolvingScore = problemSolvingScore; }

    public Integer getGrammarScore() { return grammarScore; }
    public void setGrammarScore(Integer grammarScore) { this.grammarScore = grammarScore; }

    public Integer getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(Integer confidenceScore) { this.confidenceScore = confidenceScore; }

    public String getOverallRecommendation() { return overallRecommendation; }
    public void setOverallRecommendation(String overallRecommendation) { this.overallRecommendation = overallRecommendation; }

    public Integer getIntegrityScore() { return integrityScore; }
    public void setIntegrityScore(Integer integrityScore) { this.integrityScore = integrityScore; }

    public Integer getWarningsCount() { return warningsCount; }
    public void setWarningsCount(Integer warningsCount) { this.warningsCount = warningsCount; }

    public Integer getEyeContactPercentage() { return eyeContactPercentage; }
    public void setEyeContactPercentage(Integer eyeContactPercentage) { this.eyeContactPercentage = eyeContactPercentage; }

    public Integer getFacePresentPercentage() { return facePresentPercentage; }
    public void setFacePresentPercentage(Integer facePresentPercentage) { this.facePresentPercentage = facePresentPercentage; }

    public String getMultipleFacesDetected() { return multipleFacesDetected; }
    public void setMultipleFacesDetected(String multipleFacesDetected) { this.multipleFacesDetected = multipleFacesDetected; }

    public String getPhoneChecked() { return phoneChecked; }
    public void setPhoneChecked(String phoneChecked) { this.phoneChecked = phoneChecked; }

    public Integer getTabSwitches() { return tabSwitches; }
    public void setTabSwitches(Integer tabSwitches) { this.tabSwitches = tabSwitches; }

    public List<ProctorLogEntry> getProctorLogs() { return proctorLogs; }
    public void setProctorLogs(List<ProctorLogEntry> proctorLogs) { this.proctorLogs = proctorLogs; }
}
