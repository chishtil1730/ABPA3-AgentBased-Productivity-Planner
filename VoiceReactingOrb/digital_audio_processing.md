# 🎧 Audio Waveform Normalization & Digital Signal Processing (DSP)

This document formalizes the **mathematics and signal-processing logic** used to normalize, scale, and analyze digital audio waveforms.

It is derived from handwritten DSP notes covering waveform scaling, normalization, RMS smoothing, and envelope extraction.

---

## 1. Digital Audio Signal Representation

A digital audio signal is a discrete-time sequence:

x[n] ∈ ℝ

Common ranges:
- 16-bit PCM audio: [-32768, 32767]
- Floating-point audio: [-1.0, 1.0]

---

## 2. Peak Amplitude Detection

Peak amplitude is the maximum absolute value in the signal:

A_max = max(|x[n]|)

### Code
```python
import numpy as np

def peak_amplitude(signal):
    return np.max(np.abs(signal))
```

---

## 3. Peak Normalization

x_norm[n] = x[n] / A_max

### Code
```python
def peak_normalize(signal, eps=1e-9):
    peak = np.max(np.abs(signal))
    return signal / (peak + eps)
```

---

## 4. Gain Scaling

y[n] = g · x[n]

### Code
```python
def apply_gain(signal, gain):
    return signal * gain
```

---

## 5. RMS (Root Mean Square)

RMS = sqrt((1/N) · Σ x[n]²)

### Code
```python
def rms(signal):
    return np.sqrt(np.mean(signal ** 2))
```

---

## 6. RMS Normalization

x_rms_norm[n] = x[n] · (R_target / R_current)

### Code
```python
def rms_normalize(signal, target_rms=0.1, eps=1e-9):
    current_rms = rms(signal)
    return signal * (target_rms / (current_rms + eps))
```

---

## 7. Absolute Envelope

e[n] = |x[n]|

### Code
```python
def absolute_envelope(signal):
    return np.abs(signal)
```

---

## 8. Smoothed RMS Envelope

### Code
```python
def rms_envelope(signal, window_size=1024):
    envelope = np.zeros(len(signal))
    for i in range(len(signal)):
        start = max(0, i - window_size)
        window = signal[start:i+1]
        envelope[i] = np.sqrt(np.mean(window ** 2))
    return envelope
```

---

## 9. Clipping Protection

x[n] = min(max(x[n], -1), 1)

### Code
```python
def clip(signal, min_val=-1.0, max_val=1.0):
    return np.clip(signal, min_val, max_val)
```

---

## 10. Typical DSP Pipeline

Raw Audio → Analysis → Normalization → Gain → Clipping → Output
