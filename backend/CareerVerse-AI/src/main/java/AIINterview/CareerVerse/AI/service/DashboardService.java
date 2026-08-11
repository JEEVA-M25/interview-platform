package AIINterview.CareerVerse.AI.service;

import AIINterview.CareerVerse.AI.dto.DashboardScoreDto;
import AIINterview.CareerVerse.AI.dto.DashboardSummaryDto;
import AIINterview.CareerVerse.AI.model.AppUser;
import AIINterview.CareerVerse.AI.model.InterviewSession;
import AIINterview.CareerVerse.AI.repository.AppUserRepository;
import AIINterview.CareerVerse.AI.repository.InterviewSessionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final InterviewSessionRepository sessionRepository;
    private final AppUserRepository userRepository;

    public DashboardService(InterviewSessionRepository sessionRepository, AppUserRepository userRepository) {
        this.sessionRepository = sessionRepository;
        this.userRepository = userRepository;
    }

    public DashboardSummaryDto getSummary(String email) {
        AppUser user = userRepository.findByEmail(email).orElseThrow();
        List<InterviewSession> sessions = sessionRepository.findByUserIdOrderByStartedAtDesc(user.getId());

        List<InterviewSession> completedSessions = sessions.stream()
                .filter(s -> s.getStatus() == InterviewSession.SessionStatus.COMPLETED && s.getOverallScore() != null)
                .toList();

        int totalInterviews = completedSessions.size();
        
        if (totalInterviews == 0) {
            return new DashboardSummaryDto(0, 0.0, 0, 0, 0, "Needs Data");
        }

        double averageScore = completedSessions.stream().mapToInt(InterviewSession::getOverallScore).average().orElse(0.0);
        int highestScore = completedSessions.stream().mapToInt(InterviewSession::getOverallScore).max().orElse(0);
        int lowestScore = completedSessions.stream().mapToInt(InterviewSession::getOverallScore).min().orElse(0);
        
        // ATS score can be mocked or fetched if stored on profile. Since we don't store ATS per session, we'll return 0 for now or compute an average.
        int averageAtsScore = 85; // Placeholder for ATS average
        
        String placementReadiness = averageScore >= 80 ? "High" : averageScore >= 60 ? "Medium" : "Low";

        return new DashboardSummaryDto(totalInterviews, averageScore, highestScore, lowestScore, averageAtsScore, placementReadiness);
    }

    public List<DashboardScoreDto> getScoresOverTime(String email) {
        AppUser user = userRepository.findByEmail(email).orElseThrow();
        List<InterviewSession> sessions = sessionRepository.findByUserIdOrderByStartedAtDesc(user.getId());

        return sessions.stream()
                .filter(s -> s.getStatus() == InterviewSession.SessionStatus.COMPLETED && s.getOverallScore() != null && s.getEndedAt() != null)
                .map(s -> new DashboardScoreDto(s.getEndedAt().toLocalDate(), s.getOverallScore()))
                .collect(Collectors.toList());
    }
}
