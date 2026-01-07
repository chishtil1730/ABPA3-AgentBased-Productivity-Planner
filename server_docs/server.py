from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from piper import PiperVoice
import wave
import io
import subprocess
import tempfile
import os
import threading

# STT imports
from pywhispercpp.model import Model
import soundfile as sf

# ===============================
# CONFIG
# ===============================

WARMUP_AUDIO_PATH = "Chsihti2.wav"  # <-- YOUR real speech file

# ===============================
# APP SETUP
# ===============================

app = Flask(__name__)
CORS(app)

# ===============================
# LOAD MODELS (ONCE)
# ===============================

print("[INIT] Loading Piper TTS model...")
voice = PiperVoice.load("models/en_US-hfc_female-medium.onnx")

print("[INIT] Loading Whisper STT model...")
stt_model = Model(
    "base",
    n_threads=os.cpu_count(),
)

# ===============================
# REAL-SPEECH DOUBLE WARM-UP
# ===============================

def warmup_models():
    print("[WARMUP] Starting REAL-SPEECH double warm-up...")

    if not os.path.exists(WARMUP_AUDIO_PATH):
        print(f"[WARMUP ERROR] Missing {WARMUP_AUDIO_PATH}")
        return

    try:
        # Ensure 16kHz mono (exact Whisper path)
        warmup_wav = "warmup_16k.wav"
        subprocess.run(
            [
                "ffmpeg", "-y",
                "-i", WARMUP_AUDIO_PATH,
                "-ac", "1",
                "-ar", "16000",
                warmup_wav,
            ],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=True
        )

        for i in range(2):
            print(f"[WARMUP] Pass {i + 1}/2 — real speech")

            stt_model.transcribe(
                warmup_wav,
                language="en",
                no_context=True,
                max_len=448,
                print_progress=False,
            )

        os.remove(warmup_wav)
        print("[WARMUP] Whisper fully hot")

        # ---- Piper warm-up (already fast, but keep it symmetric) ----
        buffer = io.BytesIO()
        with wave.open(buffer, "wb") as wav_file:
            wav_file.setnchannels(1)
            wav_file.setsampwidth(2)
            voice.synthesize_wav("This is a warm up.", wav_file)

        print("[WARMUP] Piper ready")

    except Exception as e:
        print("[WARMUP ERROR]", e)

# Run warmup in background
threading.Thread(target=warmup_models, daemon=True).start()

# ===============================
# TTS ENDPOINT
# ===============================

@app.route("/tts", methods=["POST"])
def tts():
    text = request.json.get("text", "").strip()
    if not text:
        return jsonify({"error": "No text"}), 400

    buffer = io.BytesIO()
    with wave.open(buffer, "wb") as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        voice.synthesize_wav(text, wav_file)

    buffer.seek(0)
    return send_file(buffer, mimetype="audio/wav")

# ===============================
# STT ENDPOINT
# ===============================

@app.route("/stt", methods=["POST"])
def stt():
    if "audio" not in request.files:
        return jsonify({"error": "No audio file"}), 400

    audio_file = request.files["audio"]

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp_webm:
            audio_file.save(tmp_webm.name)
            webm_path = tmp_webm.name

        wav_path = webm_path.replace(".webm", ".wav")
        subprocess.run(
            [
                "ffmpeg", "-y",
                "-i", webm_path,
                "-ac", "1",
                "-ar", "16000",
                wav_path,
            ],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=True,
            timeout=6
        )

        segments = stt_model.transcribe(
            wav_path,
            language="en",
            no_context=True,
            max_len=448,
            print_progress=False,
        )

        text = " ".join(s.text for s in segments).strip()
        return jsonify({"text": text})

    finally:
        for p in (locals().get("webm_path"), locals().get("wav_path")):
            if p and os.path.exists(p):
                os.remove(p)

# ===============================
# RUN SERVER
# ===============================

if __name__ == "__main__":
    print("[SERVER] Starting on port 5002")
    app.run(port=5002)
