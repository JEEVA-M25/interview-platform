public class TestRegex {
    public static void main(String[] args) {
        String text = "`json\n{\n  \"a\": 1\n}\n`";
        String t1 = text.replaceAll("(?s)^`(json)?\\\\s*", "").replaceAll("(?s)\\\\s*`$", "");
        String t2 = text.replaceAll("(?s)^`(json)?\\s*", "").replaceAll("(?s)\\s*`$", "");
        System.out.println("T1: " + t1);
        System.out.println("T2: " + t2);
    }
}
