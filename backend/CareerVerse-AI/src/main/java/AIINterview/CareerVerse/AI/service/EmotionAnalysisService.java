package AIINterview.CareerVerse.AI.service;

import AIINterview.CareerVerse.AI.model.InterviewAnswer;
import AIINterview.CareerVerse.AI.repository.InterviewAnswerRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;
import java.util.Optional;

@Service
public class EmotionAnalysisService {
    
    private static final Logger logger = LoggerFactory.getLogger(EmotionAnalysisService.class);
    private final InterviewAnswerRepository answerRepository;
    private final RestTemplate restTemplate;
    private final String emotionServiceUrl;

    public EmotionAnalysisService(
            InterviewAnswerRepository answerRepository,
            @Value("${emotion.service.url}") String emotionServiceUrl
    ) {
        this.answerRepository = answerRepository;
        this.emotionServiceUrl = emotionServiceUrl.replaceAll("/+$", "");
        
        // Configure timeout for the RestTemplate to not block indefinitely
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000); // 5 seconds
        factory.setReadTimeout(45000); // 45 seconds (ML can be slow)
        this.restTemplate = new RestTemplate(factory);
    }

    @Async
    public void analyzeEmotion(Long answerId, java.util.List<byte[]> audioFilesBytes) {
        if (audioFilesBytes == null || audioFilesBytes.isEmpty()) {
            logger.warn("Emotion analysis skipped for answerId {}: No audio files", answerId);
            return;
        }

        try {
            logger.info("Starting emotion analysis for answerId {} with {} files", answerId, audioFilesBytes.size());
            
            java.util.Map<String, java.util.List<Double>> emotionScores = new java.util.HashMap<>();

            for (int i = 0; i < audioFilesBytes.size(); i++) {
                byte[] audioBytes = audioFilesBytes.get(i);
                if (audioBytes == null || audioBytes.length == 0) continue;

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.MULTIPART_FORM_DATA);

                MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
                final int fileIndex = i;
                body.add("file", new ByteArrayResource(audioBytes) {
                    @Override
                    public String getFilename() {
                        return "audio_" + fileIndex + ".webm";
                    }
                });

                HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

                try {
                    ResponseEntity<Map> response = restTemplate.postForEntity(
                            this.emotionServiceUrl + "/predict",
                            requestEntity,
                            Map.class
                    );

                    if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                        Map<String, Object> responseBody = response.getBody();
                        String emotion = (String) responseBody.get("emotion");
                        Object confObj = responseBody.get("confidence");
                        Double confidence = confObj instanceof Number ? ((Number) confObj).doubleValue() : null;
                        
                        if (emotion != null && confidence != null) {
                            emotionScores.computeIfAbsent(emotion, k -> new java.util.ArrayList<>()).add(confidence);
                        }
                    }
                } catch (Exception e) {
                    logger.error("Failed to analyze chunk {} for answerId {}: {}", i, answerId, e.getMessage());
                }
            }

            if (emotionScores.isEmpty()) {
                logger.warn("Emotion analysis returned no valid results for answerId {}", answerId);
                return;
            }

            // Aggregate: Find most frequent emotion
            String overallEmotion = null;
            int maxCount = -1;
            double totalConfidence = 0.0;

            for (Map.Entry<String, java.util.List<Double>> entry : emotionScores.entrySet()) {
                int count = entry.getValue().size();
                if (count > maxCount) {
                    maxCount = count;
                    overallEmotion = entry.getKey();
                    totalConfidence = entry.getValue().stream().mapToDouble(Double::doubleValue).sum();
                } else if (count == maxCount && overallEmotion != null) {
                    // Break ties using total confidence
                    double currentTotal = entry.getValue().stream().mapToDouble(Double::doubleValue).sum();
                    if (currentTotal > totalConfidence) {
                        overallEmotion = entry.getKey();
                        totalConfidence = currentTotal;
                    }
                }
            }

            Double overallConfidence = maxCount > 0 ? totalConfidence / maxCount : null;
            
            logger.info("Aggregated Emotion analysis for answerId {} completed: {} ({})", answerId, overallEmotion, overallConfidence);

            // Update the database record
            Optional<InterviewAnswer> optionalAnswer = answerRepository.findById(answerId);
            if (optionalAnswer.isPresent()) {
                InterviewAnswer answer = optionalAnswer.get();
                answer.setEmotion(overallEmotion);
                answer.setEmotionConfidence(overallConfidence);
                answerRepository.save(answer);
            } else {
                logger.warn("Emotion analysis result ignored: answerId {} not found", answerId);
            }

        } catch (Exception e) {
            logger.error("Unexpected error during emotion analysis aggregation for answer " + answerId + ": " + e.getMessage(), e);
        }
    }
}
