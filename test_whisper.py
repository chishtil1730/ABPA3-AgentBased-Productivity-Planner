from pywhispercpp.model import Model
import librosa
import soundfile as sf
import os


# Install if needed: pip install librosa soundfile

# Convert your audio file to the correct format
audio, sr = librosa.load('Chsihti2.wav', sr=16000, mono=True)
sf.write('test_16k.wav', audio, 16000)

# Now test
model = Model('base', n_threads=os.cpu_count())  # Try this first!
segments = model.transcribe(
    'test_16k.wav',
    language='en',           # Skip language detection            # Default is 5, lower = faster
)

for segment in segments:
    print(f"[{segment.t0:.2f}s -> {segment.t1:.2f}s] {segment.text}")