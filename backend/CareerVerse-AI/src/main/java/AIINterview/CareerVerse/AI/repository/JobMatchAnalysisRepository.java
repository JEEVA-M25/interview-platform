package AIINterview.CareerVerse.AI.repository;

import AIINterview.CareerVerse.AI.model.JobMatchAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobMatchAnalysisRepository extends JpaRepository<JobMatchAnalysis, Long> {
    List<JobMatchAnalysis> findByUser_IdOrderByCreatedAtDesc(Long userId);
    List<JobMatchAnalysis> findByUser_EmailOrderByCreatedAtDesc(String email);
}
