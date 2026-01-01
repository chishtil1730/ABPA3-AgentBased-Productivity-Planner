from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from piper import PiperVoice
import wave
import io
import subprocess
import tempfile
import os

# STT imports
from pywhispercpp.model import Model
import librosa
import soundfile as sf

app = Flask(__name__)
CORS(app)

# ===============================
# TTS (UNCHANGED)
# ===============================

voice = PiperVoice.load("models/en_US-hfc_female-medium.onnx")

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

    return send_file(
        buffer,
        mimetype="audio/wav",
        as_attachment=False
    )

# ===============================
# STT (pywhispercpp – BASE)
# ===============================

# Load model ONCE at startup (important!)
stt_model = Model(
    "base",#could also use "small" for better transcription but slower.
    n_threads=os.cpu_count(),
)

@app.route("/stt", methods=["POST"])
def stt():
    if "audio" not in request.files:
        return jsonify({"error": "No audio file"}), 400

    audio_file = request.files["audio"]

    try:
        # 1. Save uploaded webm
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp_webm:
            audio_file.save(tmp_webm.name)
            webm_path = tmp_webm.name

        # 2. Convert to 16kHz mono WAV (FFmpeg)
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

        # 3. Transcribe
        segments = stt_model.transcribe(
            wav_path,
            language="en",
            no_context=True,
            max_len=448,
            print_progress=False,
        )

        text = " ".join(s.text for s in segments).strip()
        return jsonify({ "text": text })

    finally:
        # 4. Cleanup
        for p in [locals().get("webm_path"), locals().get("wav_path")]:
            if p and os.path.exists(p):
                os.remove(p)


# ===============================

app.run(port=5002)
