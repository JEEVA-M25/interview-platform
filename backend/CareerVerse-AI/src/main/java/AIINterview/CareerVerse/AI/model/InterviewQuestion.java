package AIINterview.CareerVerse.AI.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "interview_questions")
public class InterviewQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private InterviewSession session;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String question;

    private String difficulty;

    private Integer orderNo;

    private boolean isFollowUp;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QuestionState state = QuestionState.NOT_ASKED;

    /** Timestamp when the question was shown to the student (set by frontend ping) */
    private LocalDateTime questionShownAt;

    /** Timestamp when the student submitted their answer */
    private LocalDateTime answerSubmittedAt;

    /** Derived: answerSubmittedAt - questionShownAt in seconds */
    private Integer responseTimeSeconds;

    @OneToOne(mappedBy = "question", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private InterviewAnswer answer;

    public enum QuestionState {
        NOT_ASKED, ASKED, ANSWERED, SKIPPED
    }

    public Long getId() { return id; }

    public InterviewSession getSession() { return session; }
    public void setSession(InterviewSession session) { this.session = session; }

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public Integer getOrderNo() { return orderNo; }
    public void setOrderNo(Integer orderNo) { this.orderNo = orderNo; }

    public boolean isFollowUp() { return isFollowUp; }
    public void setFollowUp(boolean followUp) { isFollowUp = followUp; }

    public QuestionState getState() { return state; }
    public void setState(QuestionState state) { this.state = state; }

    public LocalDateTime getQuestionShownAt() { return questionShownAt; }
    public void setQuestionShownAt(LocalDateTime questionShownAt) { this.questionShownAt = questionShownAt; }

    public LocalDateTime getAnswerSubmittedAt() { return answerSubmittedAt; }
    public void setAnswerSubmittedAt(LocalDateTime answerSubmittedAt) { this.answerSubmittedAt = answerSubmittedAt; }

    public Integer getResponseTimeSeconds() { return responseTimeSeconds; }
    public void setResponseTimeSeconds(Integer responseTimeSeconds) { this.responseTimeSeconds = responseTimeSeconds; }

    public InterviewAnswer getAnswer() { return answer; }
    public void setAnswer(InterviewAnswer answer) { this.answer = answer; }
}
