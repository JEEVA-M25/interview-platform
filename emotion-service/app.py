import os
import io
import time
import tempfile
import uvicorn
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import librosa
import numpy as np
import torch
from transformers import Wav2Vec2ForSequenceClassification, Wav2Vec2FeatureExtractor

app = FastAPI(title="Speech Emotion Recognition Service")

# Allow all origins for testing/development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_ID = "Dpngtm/wav2vec2-emotion-recognition"
TARGET_SR = 16000
CHUNK_DURATION = 10.0 # seconds

model = None
feature_extractor = None

@app.on_event("startup")
def load_model():
    global model, feature_extractor
    print(f"Loading model: {MODEL_ID} ...")
    feature_extractor = Wav2Vec2FeatureExtractor.from_pretrained(MODEL_ID)
    model = Wav2Vec2ForSequenceClassification.from_pretrained(MODEL_ID)
    
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model.to(device)
    model.eval()
    print(f"Model loaded successfully on {device}.")

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    start_time = time.time()
    if not file:
        raise HTTPException(status_code=400, detail="No file provided")
    
    # 1. Read audio bytes
    audio_bytes = await file.read()
    
    # 2. Decode Audio (using a temp file is more robust for WebM/Ogg from browsers)
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
            tmp.write(audio_bytes)
            tmp_path = tmp.name
        
        # librosa load will automatically resample and convert to mono
        audio_array, sr = librosa.load(tmp_path, sr=TARGET_SR, mono=True)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Audio decoding failed: {str(e)}")
    finally:
        if 'tmp_path' in locals() and os.path.exists(tmp_path):
            os.remove(tmp_path)

    # 3. Chunking logic for long audio (> 10s)
    chunk_samples = int(TARGET_SR * CHUNK_DURATION)
    total_samples = len(audio_array)
    
    chunks = []
    for i in range(0, total_samples, chunk_samples):
        chunks.append(audio_array[i:i + chunk_samples])
        
    if not chunks:
        raise HTTPException(status_code=400, detail="Empty audio recording")

    device = "cuda" if torch.cuda.is_available() else "cpu"
    all_scores = []
    
    # 4. Predict on each chunk
    with torch.no_grad():
        for chunk in chunks:
            inputs = feature_extractor(
                chunk, 
                sampling_rate=TARGET_SR, 
                return_tensors="pt", 
                padding=True
            )
            inputs = {k: v.to(device) for k, v in inputs.items()}
            
            outputs = model(**inputs)
            logits = outputs.logits
            scores = torch.nn.functional.softmax(logits, dim=-1)[0].cpu().numpy()
            all_scores.append(scores)
            
    # 5. Aggregate predictions (Average across all chunks)
    avg_scores = np.mean(all_scores, axis=0)
    
    # Get labels from model config
    labels = model.config.id2label
    
    # Prepare response
    scores_list = []
    for idx, score in enumerate(avg_scores):
        scores_list.append({
            "emotion": labels[idx].lower(),
            "score": float(score)
        })
        
    # Sort by score descending
    scores_list.sort(key=lambda x: x["score"], reverse=True)
    
    primary_emotion = scores_list[0]["emotion"]
    confidence = scores_list[0]["score"]
    
    inference_time = time.time() - start_time
    
    return {
        "emotion": primary_emotion,
        "confidence": round(confidence, 4),
        "scores": [{"emotion": s["emotion"], "score": round(s["score"], 4)} for s in scores_list],
        "latency_seconds": round(inference_time, 3)
    }

if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8001"))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=False)
