package AIINterview.CareerVerse.AI.service;

import AIINterview.CareerVerse.AI.dto.InterviewReportResponse;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class ReportPdfService {

    private static final float PAGE_WIDTH  = PDRectangle.A4.getWidth();
    private static final float PAGE_HEIGHT = PDRectangle.A4.getHeight();
    private static final float MARGIN      = 50f;
    private static final float CONTENT_W   = PAGE_WIDTH - 2 * MARGIN;

    // Fonts
    private static final PDType1Font BOLD    = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
    private static final PDType1Font REGULAR = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
    private static final PDType1Font OBLIQUE = new PDType1Font(Standard14Fonts.FontName.HELVETICA_OBLIQUE);

    // Brand colours
    private static final Color ORANGE  = new Color(249, 115, 22);
    private static final Color SLATE_9 = new Color(15,  23,  42);
    private static final Color SLATE_6 = new Color(71,  85, 105);
    private static final Color SLATE_2 = new Color(226, 232, 240);
    private static final Color EMERALD = new Color(16, 185, 129);
    private static final Color RED_C   = new Color(239,  68,  68);
    private static final Color AMBER   = new Color(245, 158,  11);

    public byte[] generate(InterviewReportResponse report, String candidateName) throws IOException {
        try (PDDocument doc = new PDDocument();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Writer w = new Writer(doc);

            // ── Page 1: header + scores ──────────────────────────────────
            w.newPage();
            drawHeader(w, report, candidateName);
            w.moveDown(24);
            drawOverallScore(w, report);
            w.moveDown(20);
            drawDimensions(w, report);
            w.moveDown(20);
            drawStrengthsWeaknesses(w, report);

            // ── Page 2+: per-question breakdown ──────────────────────────
            if (report.questionResults() != null && !report.questionResults().isEmpty()) {
                w.newPage();
                drawSectionTitle(w, "Question-by-Question Review");
                w.moveDown(12);
                int idx = 1;
                for (InterviewReportResponse.QuestionResultDto q : report.questionResults()) {
                    if (w.y < 140) w.newPage();
                    drawQuestionBlock(w, q, idx++);
                    w.moveDown(10);
                }
            }

            // ── Footer on every page ──────────────────────────────────────
            drawFooters(doc, candidateName);

            doc.save(out);
            return out.toByteArray();
        }
    }

    // ── Section renderers ─────────────────────────────────────────────────

    private void drawHeader(Writer w, InterviewReportResponse report, String candidateName) throws IOException {
        // Orange accent bar
        w.fillRect(MARGIN, w.y - 2, CONTENT_W, 4, ORANGE);
        w.moveDown(16);

        // Title
        w.text("CareerVerse AI", BOLD, 22, ORANGE, MARGIN);
        w.moveDown(14);
        w.text("Interview Performance Report", BOLD, 16, SLATE_9, MARGIN);
        w.moveDown(10);

        // Meta row
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy"));
        w.text("Candidate: " + candidateName + "   |   Role: " + report.role()
                + "   |   Difficulty: " + report.difficulty() + "   |   Date: " + date,
                REGULAR, 9, SLATE_6, MARGIN);
        w.moveDown(6);
        w.fillRect(MARGIN, w.y, CONTENT_W, 1, SLATE_2);
    }

    private void drawOverallScore(Writer w, InterviewReportResponse report) throws IOException {
        drawSectionTitle(w, "Overall Result");
        w.moveDown(10);

        // Score box
        Color boxColor = report.overallScore() >= 80 ? EMERALD
                       : report.overallScore() >= 60 ? AMBER : RED_C;
        w.fillRect(MARGIN, w.y - 36, 80, 40, boxColor);
        w.text(String.valueOf(report.overallScore()), BOLD, 28, Color.WHITE, MARGIN + 18);
        w.text("/ 100", REGULAR, 9, Color.WHITE, MARGIN + 14);

        // Recommendation
        float rx = MARGIN + 92;
        float ry = w.y;
        w.textAt("Recommendation", BOLD, 11, SLATE_9, rx, ry);
        w.textAt(report.overallRecommendation() != null ? report.overallRecommendation() : "—",
                REGULAR, 10, SLATE_6, rx, ry - 14);
        w.moveDown(44);
    }

    private void drawDimensions(Writer w, InterviewReportResponse report) throws IOException {
        drawSectionTitle(w, "Score Breakdown");
        w.moveDown(10);

        record Dim(String label, int score) {}
        List<Dim> dims = List.of(
                new Dim("Technical",       report.technicalScore()),
                new Dim("Communication",   report.communicationScore()),
                new Dim("Problem Solving", report.problemSolvingScore()),
                new Dim("Grammar",         report.grammarScore()),
                new Dim("Confidence",      report.confidenceScore())
        );

        for (Dim d : dims) {
            w.text(d.label(), REGULAR, 9, SLATE_6, MARGIN);
            w.moveDown(1);
            // Track bar background
            w.fillRect(MARGIN, w.y - 8, CONTENT_W, 8, SLATE_2);
            // Track bar fill
            float fillW = (d.score() / 100f) * CONTENT_W;
            Color barColor = d.score() >= 80 ? EMERALD : d.score() >= 60 ? AMBER : RED_C;
            w.fillRect(MARGIN, w.y - 8, fillW, 8, barColor);
            // Score label
            w.textAt(d.score() + "%", BOLD, 8, SLATE_9, MARGIN + CONTENT_W + 4, w.y - 1);
            w.moveDown(16);
        }
    }

    private void drawStrengthsWeaknesses(Writer w, InterviewReportResponse report) throws IOException {
        boolean hasStrengths  = report.overallStrengths()  != null && !report.overallStrengths().isEmpty();
        boolean hasWeaknesses = report.overallWeaknesses() != null && !report.overallWeaknesses().isEmpty();
        if (!hasStrengths && !hasWeaknesses) return;

        drawSectionTitle(w, "Overall Strengths & Areas to Improve");
        w.moveDown(10);

        float colW = (CONTENT_W - 12) / 2f;

        if (hasStrengths) {
            w.textAt("Strengths", BOLD, 10, EMERALD, MARGIN, w.y);
        }
        if (hasWeaknesses) {
            w.textAt("Areas to Improve", BOLD, 10, RED_C, MARGIN + colW + 12, w.y);
        }
        w.moveDown(14);

        int rows = Math.max(
                hasStrengths  ? report.overallStrengths().size()  : 0,
                hasWeaknesses ? report.overallWeaknesses().size() : 0
        );

        for (int i = 0; i < rows; i++) {
            if (hasStrengths && i < report.overallStrengths().size()) {
                List<String> lines = wrap(report.overallStrengths().get(i), REGULAR, 9, colW);
                for (String line : lines) {
                    w.textAt("✓  " + line, REGULAR, 9, SLATE_9, MARGIN, w.y);
                    w.moveDown(12);
                }
            }
            if (hasWeaknesses && i < report.overallWeaknesses().size()) {
                float savedY = w.y;
                List<String> lines = wrap(report.overallWeaknesses().get(i), REGULAR, 9, colW);
                float bulletY = savedY + (lines.size() - 1) * 12;
                for (String line : lines) {
                    w.textAt("✗  " + line, REGULAR, 9, SLATE_9, MARGIN + colW + 12, bulletY);
                    bulletY -= 12;
                }
            }
        }
    }

    private void drawQuestionBlock(Writer w, InterviewReportResponse.QuestionResultDto q, int idx) throws IOException {
        Color scoreColor = q.score() >= 8 ? EMERALD : q.score() >= 5 ? AMBER : RED_C;

        // Question header row
        String label = "Q" + idx + (q.isFollowUp() ? " (Follow-up)" : "")
                + (q.state() != null && q.state().equals("SKIPPED") ? " — Skipped" : "");
        w.text(label, BOLD, 10, SLATE_9, MARGIN);

        // Score badge on right
        String scoreTxt = q.state() != null && q.state().equals("SKIPPED") ? "—" : q.score() + "/10";
        w.textAt(scoreTxt, BOLD, 10, scoreColor, PAGE_WIDTH - MARGIN - 30, w.y + 12);
        w.moveDown(12);

        // Question text (wrapped)
        for (String line : wrap(q.question(), REGULAR, 9, CONTENT_W)) {
            w.text(line, REGULAR, 9, SLATE_6, MARGIN + 8);
            w.moveDown(11);
        }

        if (q.state() == null || !q.state().equals("SKIPPED")) {
            // Answer
            String transcript = q.editedTranscript() != null ? q.editedTranscript() : q.rawTranscript();
            if (transcript != null && !transcript.isBlank()) {
                w.moveDown(3);
                w.text("Answer:", BOLD, 8, SLATE_9, MARGIN + 8);
                w.moveDown(10);
                for (String line : wrap(transcript, OBLIQUE, 8, CONTENT_W - 16)) {
                    if (w.y < 80) { w.newPage(); }
                    w.text(line, OBLIQUE, 8, SLATE_6, MARGIN + 16);
                    w.moveDown(10);
                }
            }

            // Feedback
            if (q.feedback() != null && !q.feedback().isBlank()) {
                w.moveDown(3);
                w.text("Feedback:", BOLD, 8, SLATE_9, MARGIN + 8);
                w.moveDown(10);
                for (String line : wrap(q.feedback(), REGULAR, 8, CONTENT_W - 16)) {
                    if (w.y < 80) { w.newPage(); }
                    w.text(line, REGULAR, 8, SLATE_6, MARGIN + 16);
                    w.moveDown(10);
                }
            }

            // Response time
            if (q.responseTimeSeconds() != null) {
                w.moveDown(2);
                w.text("Response time: " + q.responseTimeSeconds() + "s", REGULAR, 8, SLATE_6, MARGIN + 8);
                w.moveDown(10);
            }
        }

        // Divider
        w.moveDown(4);
        w.fillRect(MARGIN, w.y, CONTENT_W, 0.5f, SLATE_2);
    }

    private void drawSectionTitle(Writer w, String title) throws IOException {
        w.text(title, BOLD, 12, ORANGE, MARGIN);
        w.moveDown(4);
        w.fillRect(MARGIN, w.y, CONTENT_W, 1.5f, ORANGE);
        w.moveDown(6);
    }

    private void drawFooters(PDDocument doc, String candidateName) throws IOException {
        int total = doc.getNumberOfPages();
        for (int i = 0; i < total; i++) {
            PDPage page = doc.getPage(i);
            try (PDPageContentStream cs = new PDPageContentStream(
                    doc, page, PDPageContentStream.AppendMode.APPEND, true)) {
                cs.setNonStrokingColor(SLATE_2);
                cs.addRect(MARGIN, 30, CONTENT_W, 0.5f);
                cs.fill();

                cs.beginText();
                cs.setFont(REGULAR, 7);
                cs.setNonStrokingColor(SLATE_6);
                cs.newLineAtOffset(MARGIN, 20);
                cs.showText("CareerVerse AI  |  " + candidateName + "  |  Page " + (i + 1) + " of " + total);
                cs.endText();
            }
        }
    }

    // ── Text wrapping ─────────────────────────────────────────────────────

    private List<String> wrap(String text, PDType1Font font, float fontSize, float maxWidth) throws IOException {
        List<String> lines = new ArrayList<>();
        if (text == null || text.isBlank()) return lines;

        String[] words = text.split("\\s+");
        StringBuilder current = new StringBuilder();

        for (String word : words) {
            String test = current.isEmpty() ? word : current + " " + word;
            float w = font.getStringWidth(test) / 1000f * fontSize;
            if (w > maxWidth && !current.isEmpty()) {
                lines.add(current.toString());
                current = new StringBuilder(word);
            } else {
                current = new StringBuilder(test);
            }
        }
        if (!current.isEmpty()) lines.add(current.toString());
        return lines;
    }

    // ── Inner writer helper ───────────────────────────────────────────────

    private class Writer {
        private final PDDocument doc;
        private PDPage page;
        private PDPageContentStream cs;
        float y;

        Writer(PDDocument doc) throws IOException {
            this.doc = doc;
        }

        void newPage() throws IOException {
            if (cs != null) cs.close();
            page = new PDPage(PDRectangle.A4);
            doc.addPage(page);
            cs = new PDPageContentStream(doc, page);
            y = PAGE_HEIGHT - MARGIN;
        }

        void moveDown(float amount) { y -= amount; }

        void text(String t, PDType1Font font, float size, Color color, float x) throws IOException {
            cs.beginText();
            cs.setFont(font, size);
            cs.setNonStrokingColor(color);
            cs.newLineAtOffset(x, y);
            cs.showText(sanitize(t));
            cs.endText();
        }

        void textAt(String t, PDType1Font font, float size, Color color, float x, float atY) throws IOException {
            cs.beginText();
            cs.setFont(font, size);
            cs.setNonStrokingColor(color);
            cs.newLineAtOffset(x, atY);
            cs.showText(sanitize(t));
            cs.endText();
        }

        void fillRect(float x, float rectY, float w, float h, Color color) throws IOException {
            cs.setNonStrokingColor(color);
            cs.addRect(x, rectY, w, h);
            cs.fill();
        }

        /** Strip characters outside WinAnsiEncoding to avoid PDFBox encoding errors */
        private String sanitize(String s) {
            if (s == null) return "";
            return s.chars()
                    .filter(c -> c >= 0x20 && c <= 0xFF)
                    .collect(StringBuilder::new, StringBuilder::appendCodePoint, StringBuilder::append)
                    .toString();
        }

        void close() throws IOException { if (cs != null) cs.close(); }
    }
}
