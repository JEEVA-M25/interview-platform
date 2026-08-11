package AIINterview.CareerVerse.AI.repository;

import AIINterview.CareerVerse.AI.model.AtsAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AtsAnalysisRepository extends JpaRepository<AtsAnalysis, Long> {
    List<AtsAnalysis> findByUser_IdOrderByCreatedAtDesc(Long userId);
    List<AtsAnalysis> findByUser_EmailOrderByCreatedAtDesc(String email);
}
