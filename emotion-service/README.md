# CareerVerse AI - Speech Emotion Service

This is an independent ML module for Speech Emotion Recognition using `Dpngtm/wav2vec2-emotion-recognition`.

## 1. Setup

1. Open a new terminal.
2. Navigate to this directory:
   ```bash
   cd C:\Users\user\Desktop\interview-platform\emotion-service
   ```
3. (Optional but recommended) Create a virtual environment:
   ```bash
   python -m venv venv
   venv\Scripts\activate
   ```
4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## 2. Run the Service

Start the FastAPI server:
```bash
uvicorn app:app --host 0.0.0.0 --port 8001 --reload
```
*(The first time you run this, it will download the Hugging Face model, which might take a minute or two.)*

## 3. Test Manually

### Using the Swagger UI (Browser)
1. Go to http://localhost:8001/docs
2. Click on the `POST /predict` endpoint.
3. Click "Try it out".
4. Upload an audio file (WebM, WAV, MP3, etc.).
5. Click "Execute" and verify the response and latency!

### Using cURL
```bash
curl -X POST "http://localhost:8001/predict" -H "accept: application/json" -H "Content-Type: multipart/form-data" -F "file=@path_to_your_audio.webm"
```

## Features
- **Auto-resampling**: Automatically converts audio to 16 kHz and mono.
- **Chunking**: Splits recordings longer than 10 seconds into chunks to prevent memory issues and aggregates the score.
- **Fail-safe**: Used asynchronously by Spring Boot, so it will never crash the main interview process.
