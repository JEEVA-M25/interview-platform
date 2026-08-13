import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;

public class TestJson {
    public record StudyGuideResponse(List<DayPlan> days) {
        public record DayPlan(int day, String focus, List<String> tasks) {}
    }

    public static void main(String[] args) throws Exception {
        String json = "{ \"days\": [ { \"day\": 1, \"focus\": \"Spring\", \"tasks\": [\"A\", \"B\"] } ] }";
        ObjectMapper mapper = new ObjectMapper();
        StudyGuideResponse res = mapper.readValue(json, StudyGuideResponse.class);
        System.out.println(res);
    }
}
