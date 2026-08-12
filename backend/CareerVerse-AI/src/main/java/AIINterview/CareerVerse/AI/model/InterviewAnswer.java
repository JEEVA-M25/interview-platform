package AIINterview.CareerVerse.AI.model;

import jakarta.persistence.*;

@Entity
@Table(name = "interview_answers")
public class InterviewAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false, unique = true)
    private InterviewQuestion question;

    /** Original speech-to-text output, never modified */
    @Column(columnDefinition = "TEXT")
    private String rawTranscript;

    /** Student-edited version of the transcript (null if not edited) */
    @Column(columnDefinition = "TEXT")
    private String editedTranscript;

    private Integer score;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Column(columnDefinition = "TEXT")
    private String strengths;

    @Column(columnDefinition = "TEXT")
    private String weaknesses;

    /** Gemini token usage for cost monitoring */
    private Integer promptTokens;
    private Integer completionTokens;

    @Column(length = 50)
    private String emotion;

    private Double emotionConfidence;

    public Long getId() { return id; }

    public InterviewQuestion getQuestion() { return question; }
    public void setQuestion(InterviewQuestion question) { this.question = question; }

    public String getRawTranscript() { return rawTranscript; }
    public void setRawTranscript(String rawTranscript) { this.rawTranscript = rawTranscript; }

    public String getEditedTranscript() { return editedTranscript; }
    public void setEditedTranscript(String editedTranscript) { this.editedTranscript = editedTranscript; }

    /** Returns edited transcript if available, otherwise raw — this is what Gemini evaluates */
    public String getEffectiveTranscript() {
        return editedTranscript != null && !editedTranscript.isBlank() ? editedTranscript : rawTranscript;
    }

    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }

    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }

    public String getStrengths() { return strengths; }
    public void setStrengths(String strengths) { this.strengths = strengths; }

    public String getWeaknesses() { return weaknesses; }
    public void setWeaknesses(String weaknesses) { this.weaknesses = weaknesses; }

    public Integer getPromptTokens() { return promptTokens; }
    public void setPromptTokens(Integer promptTokens) { this.promptTokens = promptTokens; }

    public Integer getCompletionTokens() { return completionTokens; }
    public void setCompletionTokens(Integer completionTokens) { this.completionTokens = completionTokens; }

    public String getEmotion() { return emotion; }
    public void setEmotion(String emotion) { this.emotion = emotion; }

    public Double getEmotionConfidence() { return emotionConfidence; }
    public void setEmotionConfidence(Double emotionConfidence) { this.emotionConfidence = emotionConfidence; }
}
