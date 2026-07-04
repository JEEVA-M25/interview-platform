package AIINterview.CareerVerse.AI.dto;

import java.util.List;

public record AtsScoreResponse(
        int score,
        String summary,
        List<String> strengths,
        List<String> improvements,
        List<String> keywords
) {
}
