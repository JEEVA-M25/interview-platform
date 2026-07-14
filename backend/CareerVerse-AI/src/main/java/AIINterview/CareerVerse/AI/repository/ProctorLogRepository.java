package AIINterview.CareerVerse.AI.repository;

import AIINterview.CareerVerse.AI.model.ProctorLogEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProctorLogRepository extends JpaRepository<ProctorLogEntry, Long> {
    List<ProctorLogEntry> findBySessionIdOrderByTimestampAsc(Long sessionId);
}
