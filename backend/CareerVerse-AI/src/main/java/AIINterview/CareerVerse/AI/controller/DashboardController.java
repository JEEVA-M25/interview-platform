package AIINterview.CareerVerse.AI.controller;

import AIINterview.CareerVerse.AI.dto.DashboardScoreDto;
import AIINterview.CareerVerse.AI.dto.DashboardSummaryDto;
import AIINterview.CareerVerse.AI.service.DashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;
import java.util.Collections;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public DashboardSummaryDto getSummary(Principal principal) {
        return dashboardService.getSummary(principal.getName());
    }

    @GetMapping("/scores")
    public List<DashboardScoreDto> getScores(Principal principal) {
        List<DashboardScoreDto> scores = dashboardService.getScoresOverTime(principal.getName());
        // Sort chronologically as requested
        Collections.reverse(scores);
        return scores;
    }
}
