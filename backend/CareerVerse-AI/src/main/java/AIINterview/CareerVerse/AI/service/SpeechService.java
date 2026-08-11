package AIINterview.CareerVerse.AI.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SpeechService {

    @Value("${groq.api.key}")
    private String groqApiKey;

    @Value("${sarvam.api.key}")
    private String sarvamApiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public String transcribeAudio(MultipartFile audioFile) throws Exception {
        String url = "https://api.groq.com/openai/v1/audio/transcriptions";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        headers.setBearerAuth(groqApiKey);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new ByteArrayResource(audioFile.getBytes()) {
            @Override
            public String getFilename() {
                // Must provide a filename for multipart form data
                return audioFile.getOriginalFilename() != null ? audioFile.getOriginalFilename() : "audio.webm";
            }
        });
        body.add("model", "whisper-large-v3");

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(url, requestEntity, Map.class);
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            return (String) response.getBody().get("text");
        } else {
            throw new RuntimeException("Failed to transcribe audio with Groq: " + response.getStatusCode());
        }
    }

    public byte[] synthesizeSpeech(String text) {
        String url = "https://api.sarvam.ai/text-to-speech";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("api-subscription-key", sarvamApiKey);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("inputs", List.of(text));
        requestBody.put("target_language_code", "en-IN");
        requestBody.put("speaker", "sumit");
        requestBody.put("model", "bulbul:v3"); // Using latest version bulbul:v3
        requestBody.put("pace", 1.0);
        requestBody.put("speech_sample_rate", 22050);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                List<String> audios = (List<String>) response.getBody().get("audios");
                if (audios != null && !audios.isEmpty()) {
                    return Base64.getDecoder().decode(audios.get(0));
                }
            }
            throw new RuntimeException("Invalid response from Sarvam AI");
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to synthesize speech with Sarvam: " + e.getMessage());
        }
    }
}
