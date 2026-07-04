package AIINterview.CareerVerse.AI.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.hslf.extractor.QuickButCruddyTextExtractor;
import org.apache.poi.hwpf.HWPFDocument;
import org.apache.poi.hwpf.extractor.WordExtractor;
import org.apache.poi.xslf.usermodel.XMLSlideShow;
import org.apache.poi.xslf.usermodel.XSLFShape;
import org.apache.poi.xslf.usermodel.XSLFSlide;
import org.apache.poi.xslf.usermodel.XSLFTextShape;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Locale;

@Service
public class DocumentTextExtractor {

    public String extractText(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Upload a resume file before analysis");
        }

        String filename = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase(Locale.ROOT);

        try {
            if (filename.endsWith(".pdf")) {
                return extractPdf(file);
            }
            if (filename.endsWith(".docx")) {
                return extractDocx(file);
            }
            if (filename.endsWith(".doc")) {
                return extractDoc(file);
            }
            if (filename.endsWith(".pptx")) {
                return extractPptx(file);
            }
            if (filename.endsWith(".ppt")) {
                return extractPpt(file);
            }
            if (filename.endsWith(".txt")) {
                return new String(file.getBytes(), StandardCharsets.UTF_8);
            }
        } catch (IOException ex) {
            throw new IllegalArgumentException("Could not read uploaded file");
        }

        throw new IllegalArgumentException("Supported formats are PDF, DOC, DOCX, PPT, PPTX, and TXT");
    }

    private String extractPdf(MultipartFile file) throws IOException {
        try (var document = Loader.loadPDF(file.getBytes())) {
            return new PDFTextStripper().getText(document);
        }
    }

    private String extractDocx(MultipartFile file) throws IOException {
        try (var document = new XWPFDocument(file.getInputStream());
             var extractor = new XWPFWordExtractor(document)) {
            return extractor.getText();
        }
    }

    private String extractDoc(MultipartFile file) throws IOException {
        try (var document = new HWPFDocument(file.getInputStream());
             var extractor = new WordExtractor(document)) {
            return extractor.getText();
        }
    }

    private String extractPptx(MultipartFile file) throws IOException {
        StringBuilder text = new StringBuilder();
        try (XMLSlideShow slideShow = new XMLSlideShow(file.getInputStream())) {
            for (XSLFSlide slide : slideShow.getSlides()) {
                for (XSLFShape shape : slide.getShapes()) {
                    if (shape instanceof XSLFTextShape textShape) {
                        text.append(textShape.getText()).append('\n');
                    }
                }
            }
        }
        return text.toString();
    }

    private String extractPpt(MultipartFile file) throws IOException {
        QuickButCruddyTextExtractor extractor = new QuickButCruddyTextExtractor(file.getInputStream());
        try {
            return extractor.getTextAsString();
        } finally {
            extractor.close();
        }
    }
}
