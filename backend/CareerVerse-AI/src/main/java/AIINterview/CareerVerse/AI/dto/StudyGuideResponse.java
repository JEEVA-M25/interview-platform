package AIINterview.CareerVerse.AI.dto;

import java.util.List;

public record StudyGuideResponse(List<DayPlan> days) {
    public record DayPlan(int day, String focus, List<String> tasks) {}
}
