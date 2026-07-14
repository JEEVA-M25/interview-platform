package AIINterview.CareerVerse.AI.repository;

import AIINterview.CareerVerse.AI.model.InterviewQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InterviewQuestionRepository extends JpaRepository<InterviewQuestion, Long> {
    List<InterviewQuestion> findBySessionIdOrderByOrderNoAsc(Long sessionId);
}
