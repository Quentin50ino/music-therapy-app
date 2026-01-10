from fastapi import FastAPI, UploadFile, File
import librosa
import numpy as np
import io

app = FastAPI()

@app.post("/analizza-audio")
async def analizza(file: UploadFile = File(...)):
    # 1. Leggi il file audio che arriva dall'app
    contents = await file.read()
    
    # 2. Caricalo in Librosa (usando io.BytesIO per non salvarlo su disco)
    y, sr = librosa.load(io.BytesIO(contents), sr=None)
    
    # 3. Calcola le feature (es. BPM e Energia)
    tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
    rms = librosa.feature.rms(y=y) # Root Mean Square (indicatore di energia/volume)
    energia_media = float(np.mean(rms))
    
    # 4. Restituisci il risultato in JSON
    return {
        "nome_file": file.filename,
        "bpm": round(tempo),
        "energia": round(energia_media, 4),
        "danceability_proxy": "Non calcolabile esattamente come Spotify, ma stimabile"
    }

# Per avviarlo userai: uvicorn main:app --reload