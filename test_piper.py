from piper import PiperVoice
import wave

VOICE_PATH = "models/en_US-hfc_female-medium.onnx"

voice = PiperVoice.load(VOICE_PATH)

with wave.open("test.wav", "wb") as wav_file:
    # Piper will configure sample rate internally,
    # but channels + sample width must exist
    wav_file.setnchannels(1)
    wav_file.setsampwidth(2)

    voice.synthesize_wav(
        "Hello, I am your personal-agent. Today is my first day. How can I help you?",
        wav_file
    )

print("Saved test.wav")
