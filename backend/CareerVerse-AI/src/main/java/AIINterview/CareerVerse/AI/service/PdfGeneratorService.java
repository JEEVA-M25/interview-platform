package AIINterview.CareerVerse.AI.service;

import AIINterview.CareerVerse.AI.model.InterviewAnswer;
import AIINterview.CareerVerse.AI.model.InterviewQuestion;
import AIINterview.CareerVerse.AI.model.InterviewSession;
import AIINterview.CareerVerse.AI.repository.InterviewQuestionRepository;
import AIINterview.CareerVerse.AI.repository.InterviewSessionRepository;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.lowagie.text.pdf.draw.LineSeparator;

import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;
import AIINterview.CareerVerse.AI.dto.StudyGuideResponse;

@Service
public class PdfGeneratorService {

    private final InterviewSessionRepository sessionRepository;
    private final InterviewQuestionRepository questionRepository;

    public PdfGeneratorService(
            InterviewSessionRepository sessionRepository,
            InterviewQuestionRepository questionRepository) {

        this.sessionRepository = sessionRepository;
        this.questionRepository = questionRepository;
    }

    public byte[] generateInterviewReport(Long interviewId) {

        // ============================================================
        // EXISTING LOGIC - DO NOT CHANGE
        // ============================================================

        InterviewSession session = sessionRepository.findById(interviewId)
                .orElseThrow(() -> new RuntimeException("Interview session not found"));

        List<InterviewQuestion> questions = questionRepository.findBySessionIdOrderByOrderNoAsc(interviewId);

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {

            // ========================================================
            // DOCUMENT
            // ========================================================

            Document document = new Document(
                    PageSize.A4,
                    42,
                    42,
                    55,
                    55);

            PdfWriter writer = PdfWriter.getInstance(document, baos);

            // Footer / page number
            writer.setPageEvent(new PdfPageEventHelper() {

                @Override
                public void onEndPage(PdfWriter writer, Document document) {

                    PdfContentByte canvas = writer.getDirectContent();

                    canvas.saveState();

                    // Footer line
                    canvas.setColorStroke(new Color(226, 232, 240));
                    canvas.setLineWidth(0.7f);

                    canvas.moveTo(
                            document.left(),
                            35);

                    canvas.lineTo(
                            document.right(),
                            35);

                    canvas.stroke();

                    // Footer text
                    Font footerFont = FontFactory.getFont(
                            FontFactory.HELVETICA,
                            7,
                            new Color(100, 116, 139));

                    ColumnText.showTextAligned(
                            canvas,
                            Element.ALIGN_LEFT,
                            new Phrase(
                                    "CareerVerse AI  •  Interview Evaluation Report",
                                    footerFont),
                            document.left(),
                            22,
                            0);

                    ColumnText.showTextAligned(
                            canvas,
                            Element.ALIGN_RIGHT,
                            new Phrase(
                                    "Page " + writer.getPageNumber(),
                                    footerFont),
                            document.right(),
                            22,
                            0);

                    canvas.restoreState();
                }
            });

            document.open();

            // ========================================================
            // COLORS
            // ========================================================

            Color orange = new Color(249, 115, 22);
            Color orangeLight = new Color(255, 247, 237);

            Color dark = new Color(15, 23, 42);
            Color slate = new Color(71, 85, 105);
            Color muted = new Color(100, 116, 139);

            Color border = new Color(226, 232, 240);
            Color lightBackground = new Color(248, 250, 252);

            Color green = new Color(16, 185, 129);
            Color greenLight = new Color(236, 253, 245);

            Color yellow = new Color(245, 158, 11);
            Color yellowLight = new Color(255, 251, 235);

            Color red = new Color(239, 68, 68);
            Color redLight = new Color(254, 242, 242);

            // ========================================================
            // FONTS
            // ========================================================

            Font brandFont = FontFactory.getFont(
                    FontFactory.HELVETICA_BOLD,
                    24,
                    dark);

            Font titleFont = FontFactory.getFont(
                    FontFactory.HELVETICA_BOLD,
                    20,
                    dark);

            Font subtitleFont = FontFactory.getFont(
                    FontFactory.HELVETICA,
                    10,
                    muted);

            Font sectionFont = FontFactory.getFont(
                    FontFactory.HELVETICA_BOLD,
                    12,
                    dark);

            Font labelFont = FontFactory.getFont(
                    FontFactory.HELVETICA_BOLD,
                    7,
                    muted);

            Font valueFont = FontFactory.getFont(
                    FontFactory.HELVETICA_BOLD,
                    10,
                    dark);

            Font normalFont = FontFactory.getFont(
                    FontFactory.HELVETICA,
                    9,
                    dark);

            Font feedbackFont = FontFactory.getFont(
                    FontFactory.HELVETICA,
                    9,
                    slate);

            Font smallFont = FontFactory.getFont(
                    FontFactory.HELVETICA,
                    7.5f,
                    muted);

            // ========================================================
            // DATA
            // ========================================================

            String candidateName = session.getUser() != null &&
                    session.getUser().getFullName() != null
                            ? session.getUser().getFullName()
                            : "Candidate";

            String dateStr = session.getEndedAt() != null
                    ? session.getEndedAt().format(
                            DateTimeFormatter.ofPattern("dd MMM yyyy"))
                    : session.getStartedAt() != null
                            ? session.getStartedAt().format(
                                    DateTimeFormatter.ofPattern("dd MMM yyyy"))
                            : "N/A";

            // ========================================================
            // HEADER
            // ========================================================

            PdfPTable header = new PdfPTable(2);
            header.setWidthPercentage(100);
            header.setWidths(new float[] { 7f, 2.2f });
            header.setSpacingAfter(18);

            // Brand
            PdfPCell brandCell = new PdfPCell();
            brandCell.setBorder(Rectangle.NO_BORDER);
            brandCell.setPadding(0);

            Paragraph brand = new Paragraph();
            brand.add(new Chunk("CareerVerse", brandFont));
            brand.add(
                    new Chunk(
                            " AI",
                            FontFactory.getFont(
                                    FontFactory.HELVETICA_BOLD,
                                    24,
                                    orange)));

            brandCell.addElement(brand);

            Paragraph reportType = new Paragraph(
                    "INTERVIEW EVALUATION REPORT",
                    FontFactory.getFont(
                            FontFactory.HELVETICA_BOLD,
                            8,
                            muted));

            reportType.setSpacingBefore(2);
            brandCell.addElement(reportType);

            header.addCell(brandCell);

            // Overall score
            PdfPCell overallCell = new PdfPCell();
            overallCell.setBackgroundColor(dark);
            overallCell.setBorder(Rectangle.NO_BORDER);
            overallCell.setPadding(12);
            overallCell.setHorizontalAlignment(Element.ALIGN_CENTER);

            Paragraph overallLabel = new Paragraph(
                    "OVERALL SCORE",
                    FontFactory.getFont(
                            FontFactory.HELVETICA_BOLD,
                            7,
                            new Color(203, 213, 225)));

            overallLabel.setAlignment(Element.ALIGN_CENTER);
            overallCell.addElement(overallLabel);

            String overallScore = session.getOverallScore() != null
                    ? session.getOverallScore() + "%"
                    : "N/A";

            Paragraph overallValue = new Paragraph(
                    overallScore,
                    FontFactory.getFont(
                            FontFactory.HELVETICA_BOLD,
                            22,
                            Color.WHITE));

            overallValue.setAlignment(Element.ALIGN_CENTER);
            overallCell.addElement(overallValue);

            header.addCell(overallCell);

            document.add(header);

            // Orange accent
            LineSeparator accent = new LineSeparator(
                    2.5f,
                    100f,
                    orange,
                    Element.ALIGN_CENTER,
                    0);

            document.add(accent);
            document.add(Chunk.NEWLINE);

            // ========================================================
            // CANDIDATE SUMMARY
            // ========================================================

            document.add(
                    createSectionTitle(
                            "Candidate Overview",
                            sectionFont,
                            orange));

            PdfPTable candidateTable = new PdfPTable(4);
            candidateTable.setWidthPercentage(100);
            candidateTable.setWidths(
                    new float[] { 2.4f, 2.4f, 1.6f, 1.8f });
            candidateTable.setSpacingBefore(8);
            candidateTable.setSpacingAfter(20);

            candidateTable.addCell(
                    createInfoCard(
                            "CANDIDATE",
                            candidateName,
                            lightBackground,
                            labelFont,
                            valueFont));

            candidateTable.addCell(
                    createInfoCard(
                            "TARGET ROLE",
                            safeValue(session.getRole()),
                            lightBackground,
                            labelFont,
                            valueFont));

            candidateTable.addCell(
                    createInfoCard(
                            "DIFFICULTY",
                            safeValue(session.getDifficulty()),
                            lightBackground,
                            labelFont,
                            valueFont));

            candidateTable.addCell(
                    createInfoCard(
                            "DATE",
                            dateStr,
                            lightBackground,
                            labelFont,
                            valueFont));

            document.add(candidateTable);

            // ========================================================
            // PERFORMANCE
            // ========================================================

            document.add(
                    createSectionTitle(
                            "Performance Breakdown",
                            sectionFont,
                            orange));

            Paragraph performanceDescription = new Paragraph(
                    "Your performance across the key interview dimensions.",
                    smallFont);

            performanceDescription.setSpacingBefore(4);
            performanceDescription.setSpacingAfter(10);

            document.add(performanceDescription);

            PdfPTable scoreTable = new PdfPTable(5);
            scoreTable.setWidthPercentage(100);
            scoreTable.setWidths(
                    new float[] { 1f, 1f, 1f, 1f, 1f });
            scoreTable.setSpacingAfter(24);

            scoreTable.addCell(
                    createModernScoreBox(
                            "Technical",
                            session.getTechnicalScore(),
                            orange,
                            orangeLight));

            scoreTable.addCell(
                    createModernScoreBox(
                            "Communication",
                            session.getCommunicationScore(),
                            new Color(59, 130, 246),
                            new Color(239, 246, 255)));

            scoreTable.addCell(
                    createModernScoreBox(
                            "Problem Solving",
                            session.getProblemSolvingScore(),
                            new Color(139, 92, 246),
                            new Color(245, 243, 255)));

            scoreTable.addCell(
                    createModernScoreBox(
                            "Confidence",
                            session.getConfidenceScore(),
                            green,
                            greenLight));

            scoreTable.addCell(
                    createModernScoreBox(
                            "Grammar",
                            session.getGrammarScore(),
                            new Color(14, 165, 233),
                            new Color(240, 249, 255)));

            document.add(scoreTable);

            // ========================================================
            // QUESTION REVIEW
            // ========================================================

            document.add(
                    createSectionTitle(
                            "Question-by-Question Review",
                            sectionFont,
                            orange));

            Paragraph reviewDescription = new Paragraph(
                    "Detailed evaluation of your responses and AI-generated feedback.",
                    smallFont);

            reviewDescription.setSpacingBefore(4);
            reviewDescription.setSpacingAfter(12);

            document.add(reviewDescription);

            int qNum = 1;

            for (InterviewQuestion q : questions) {

                // ====================================================
                // EXISTING LOGIC - UNCHANGED
                // ====================================================

                if (q.getState() != InterviewQuestion.QuestionState.ANSWERED
                        || q.getAnswer() == null) {
                    continue;
                }

                InterviewAnswer a = q.getAnswer();

                // ====================================================
                // QUESTION CARD
                // ====================================================

                Color scoreColor = getScoreColor(a.getScore());
                Color scoreBackground = getScoreBackground(a.getScore());

                PdfPTable questionHeader = new PdfPTable(2);

                questionHeader.setWidthPercentage(100);
                questionHeader.setWidths(
                        new float[] { 8.5f, 1.5f });

                questionHeader.setKeepTogether(true);

                // Question
                PdfPCell questionCell = new PdfPCell();

                questionCell.setBackgroundColor(lightBackground);
                questionCell.setBorderColor(border);
                questionCell.setBorderWidth(0.8f);
                questionCell.setPadding(11);

                Paragraph questionNumber = new Paragraph(
                        "QUESTION " + qNum,
                        FontFactory.getFont(
                                FontFactory.HELVETICA_BOLD,
                                7,
                                orange));

                questionNumber.setSpacingAfter(4);
                questionCell.addElement(questionNumber);

                Paragraph questionText = new Paragraph(
                        safeValue(q.getQuestion()),
                        FontFactory.getFont(
                                FontFactory.HELVETICA_BOLD,
                                10,
                                dark));

                questionCell.addElement(questionText);

                questionHeader.addCell(questionCell);

                // Score
                PdfPCell scoreCell = new PdfPCell();

                scoreCell.setBackgroundColor(scoreColor);
                scoreCell.setBorderColor(scoreColor);
                scoreCell.setPadding(8);
                scoreCell.setHorizontalAlignment(
                        Element.ALIGN_CENTER);
                scoreCell.setVerticalAlignment(
                        Element.ALIGN_MIDDLE);

                String qScore = a.getScore() != null
                        ? a.getScore() + "/10"
                        : "N/A";

                Paragraph scoreParagraph = new Paragraph(
                        qScore,
                        FontFactory.getFont(
                                FontFactory.HELVETICA_BOLD,
                                13,
                                Color.WHITE));

                scoreParagraph.setAlignment(
                        Element.ALIGN_CENTER);

                scoreCell.addElement(scoreParagraph);

                questionHeader.addCell(scoreCell);

                document.add(questionHeader);

                // ====================================================
                // ANSWER
                // ====================================================

                PdfPTable answerTable = new PdfPTable(1);

                answerTable.setWidthPercentage(100);
                answerTable.setKeepTogether(true);

                PdfPCell answerCell = new PdfPCell();

                answerCell.setBackgroundColor(Color.WHITE);
                answerCell.setBorderColor(border);
                answerCell.setBorderWidth(0.8f);
                answerCell.setPadding(13);

                // Your answer
                answerCell.addElement(
                        createSmallHeading(
                                "YOUR ANSWER",
                                dark));

                Paragraph answerText = new Paragraph(
                        a.getEffectiveTranscript() != null
                                ? a.getEffectiveTranscript()
                                : "No answer provided.",
                        normalFont);

                answerText.setLeading(13f);
                answerText.setSpacingAfter(12);

                answerCell.addElement(answerText);

                // AI feedback
                answerCell.addElement(
                        createSmallHeading(
                                "AI FEEDBACK",
                                orange));

                Paragraph feedback = new Paragraph(
                        a.getFeedback() != null
                                ? a.getFeedback()
                                : "No feedback available.",
                        feedbackFont);

                feedback.setLeading(13f);
                feedback.setSpacingAfter(10);

                answerCell.addElement(feedback);

                // ====================================================
                // STRENGTHS
                // ====================================================

                if (a.getStrengths() != null
                        && !a.getStrengths().isBlank()) {

                    PdfPTable strengths = createFeedbackBox(
                            "STRENGTHS",
                            a.getStrengths(),
                            green,
                            greenLight,
                            normalFont);

                    answerCell.addElement(strengths);
                    answerCell.addElement(Chunk.NEWLINE);
                }

                // ====================================================
                // WEAKNESSES
                // ====================================================

                if (a.getWeaknesses() != null
                        && !a.getWeaknesses().isBlank()) {

                    PdfPTable improvements = createFeedbackBox(
                            "AREAS TO IMPROVE",
                            a.getWeaknesses(),
                            red,
                            redLight,
                            normalFont);

                    answerCell.addElement(improvements);
                }

                answerTable.addCell(answerCell);

                document.add(answerTable);

                document.add(
                        new Paragraph(
                                " ",
                                FontFactory.getFont(
                                        FontFactory.HELVETICA,
                                        5)));

                qNum++;
            }

            // ========================================================
            // END
            // ========================================================

            document.close();

            return baos.toByteArray();

        } catch (Exception e) {

            throw new RuntimeException(
                    "Failed to generate PDF report",
                    e);
        }
    }

    // ================================================================
    // SECTION TITLE
    // ================================================================

    private Paragraph createSectionTitle(
            String title,
            Font font,
            Color accent) {

        Paragraph paragraph = new Paragraph();

        Chunk titleChunk = new Chunk(
                title,
                font);

        paragraph.add(titleChunk);

        paragraph.setSpacingBefore(4);
        paragraph.setSpacingAfter(2);

        return paragraph;
    }

    // ================================================================
    // INFO CARD
    // ================================================================

    private PdfPCell createInfoCard(
            String label,
            String value,
            Color background,
            Font labelFont,
            Font valueFont) {

        PdfPCell cell = new PdfPCell();

        cell.setBackgroundColor(background);
        cell.setBorderColor(new Color(226, 232, 240));
        cell.setBorderWidth(0.6f);
        cell.setPadding(10);

        Paragraph labelParagraph = new Paragraph(
                label,
                labelFont);

        labelParagraph.setSpacingAfter(4);

        cell.addElement(labelParagraph);

        Paragraph valueParagraph = new Paragraph(
                value,
                valueFont);

        cell.addElement(valueParagraph);

        return cell;
    }

    // ================================================================
    // MODERN SCORE BOX
    // ================================================================

    private PdfPCell createModernScoreBox(
            String label,
            Integer score,
            Color accent,
            Color background) {

        PdfPCell cell = new PdfPCell();

        cell.setBackgroundColor(background);
        cell.setBorderColor(new Color(226, 232, 240));
        cell.setBorderWidth(0.6f);
        cell.setPadding(9);
        cell.setHorizontalAlignment(
                Element.ALIGN_CENTER);

        Paragraph labelParagraph = new Paragraph(
                label.toUpperCase(),
                FontFactory.getFont(
                        FontFactory.HELVETICA_BOLD,
                        6.5f,
                        new Color(71, 85, 105)));

        labelParagraph.setAlignment(
                Element.ALIGN_CENTER);

        labelParagraph.setSpacingAfter(5);

        cell.addElement(labelParagraph);

        String value = score != null
                ? score + "%"
                : "N/A";

        Paragraph scoreParagraph = new Paragraph(
                value,
                FontFactory.getFont(
                        FontFactory.HELVETICA_BOLD,
                        16,
                        accent));

        scoreParagraph.setAlignment(
                Element.ALIGN_CENTER);

        cell.addElement(scoreParagraph);

        return cell;
    }

    // ================================================================
    // FEEDBACK BOX
    // ================================================================

    private PdfPTable createFeedbackBox(
            String title,
            String content,
            Color accent,
            Color background,
            Font contentFont) {

        PdfPTable table = new PdfPTable(1);

        table.setWidthPercentage(100);

        PdfPCell cell = new PdfPCell();

        cell.setBackgroundColor(background);
        cell.setBorderColor(accent);
        cell.setBorderWidth(0.8f);
        cell.setPadding(9);

        Paragraph heading = new Paragraph(
                title,
                FontFactory.getFont(
                        FontFactory.HELVETICA_BOLD,
                        7,
                        accent));

        heading.setSpacingAfter(4);

        cell.addElement(heading);

        Paragraph body = new Paragraph(
                content,
                contentFont);

        body.setLeading(12f);

        cell.addElement(body);

        table.addCell(cell);

        return table;
    }

    // ================================================================
    // SMALL HEADING
    // ================================================================

    private Paragraph createSmallHeading(
            String text,
            Color color) {

        Paragraph paragraph = new Paragraph(
                text,
                FontFactory.getFont(
                        FontFactory.HELVETICA_BOLD,
                        7,
                        color));

        paragraph.setSpacingAfter(5);

        return paragraph;
    }

    // ================================================================
    // SCORE COLORS
    // ================================================================

    private Color getScoreColor(Integer score) {

        if (score == null) {
            return new Color(100, 116, 139);
        }

        if (score >= 8) {
            return new Color(16, 185, 129);
        }

        if (score >= 5) {
            return new Color(245, 158, 11);
        }

        return new Color(239, 68, 68);
    }

    private Color getScoreBackground(Integer score) {

        if (score == null) {
            return new Color(241, 245, 249);
        }

        if (score >= 8) {
            return new Color(236, 253, 245);
        }

        if (score >= 5) {
            return new Color(255, 251, 235);
        }

        return new Color(254, 242, 242);
    }

    // ================================================================
    // SAFE VALUE
    // ================================================================

    private String safeValue(String value) {

        if (value == null || value.isBlank() || value.equals("null")) {
            return "N/A";
        }

        return value;
    }

    public byte[] generateStudyGuidePdf(StudyGuideResponse guide, String userName) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 50, 50, 50, 50);
            PdfWriter.getInstance(document, baos);
            
            document.open();
            
            // Fonts
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 24, new Color(51, 65, 85));
            Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA, 12, new Color(100, 116, 139));
            Font dayHeaderFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, new Color(67, 56, 202));
            Font dayFocusFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, new Color(30, 41, 59));
            Font taskFont = FontFactory.getFont(FontFactory.HELVETICA, 11, new Color(71, 85, 105));
            
            // Header
            Paragraph title = new Paragraph("CareerVerse Study Plan", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(10);
            document.add(title);
            
            int totalDays = guide.days() != null ? guide.days().size() : 0;
            String dateStr = java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("MMM dd, yyyy"));
            Paragraph subtitle = new Paragraph(String.format("Prepared for: %s | Date: %s | Duration: %d Days", userName, dateStr, totalDays), subtitleFont);
            subtitle.setAlignment(Element.ALIGN_CENTER);
            subtitle.setSpacingAfter(20);
            document.add(subtitle);
            
            LineSeparator ls = new LineSeparator();
            ls.setLineColor(new Color(226, 232, 240));
            document.add(new Chunk(ls));
            document.add(new Paragraph(" "));
            
            if (guide.days() != null) {
                for (StudyGuideResponse.DayPlan day : guide.days()) {
                    // Day Box
                    PdfPTable table = new PdfPTable(1);
                    table.setWidthPercentage(100);
                    
                    PdfPCell cell = new PdfPCell();
                    cell.setBorderColor(new Color(226, 232, 240));
                    cell.setBorderWidth(1);
                    cell.setPadding(15);
                    cell.setBackgroundColor(new Color(248, 250, 252));
                    
                    Paragraph dayHeader = new Paragraph("Day " + day.day(), dayHeaderFont);
                    dayHeader.setSpacingAfter(5);
                    cell.addElement(dayHeader);
                    
                    Paragraph focus = new Paragraph("Focus: " + day.focus(), dayFocusFont);
                    focus.setSpacingAfter(10);
                    cell.addElement(focus);
                    
                    com.lowagie.text.List taskList = new com.lowagie.text.List(com.lowagie.text.List.UNORDERED);
                    taskList.setListSymbol("\u2022 ");
                    taskList.setIndentationLeft(20);
                    
                    if (day.tasks() != null) {
                        for (String task : day.tasks()) {
                            ListItem item = new ListItem(task, taskFont);
                            item.setSpacingAfter(5);
                            taskList.add(item);
                        }
                    }
                    
                    cell.addElement(taskList);
                    table.addCell(cell);
                    
                    document.add(table);
                    document.add(new Paragraph(" ")); // Spacing between days
                }
            }
            
            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF", e);
        }
    }
}