# Voice Reacting Orb — Normalization (Internal)

> *Short internal note. Visual-first. This is how the orb reacts to voice, without reacting to noise.*

---

## Start Here — What Actually Happens

### 1️⃣ Raw Audio (What the mic gives us)

![Raw waveform](./RawWaveform.png)

* Continuous waveform
* Always noisy
* Never flat, even in silence

---

### 2️⃣ Absolute / Magnitude View (Still not usable)

![Absolute signal](./absolute_sin_function.png)

* Magnitude only
* Noise still present
* Peaks exist, but too chaotic

---

### 3️⃣ RMS + Smoothing (This is the control signal)

![Smoothed RMS](./smoothened_rms.png)

* One value per time window
* Noise collapses near zero
* Speech creates clear energy envelopes

👉 **This is the only signal the orb uses**

---

## What I’m Doing (In Simple Terms)

* Take mic input
* Convert waveform → energy (RMS)
* Ignore values below noise floor
* Normalize
* Smooth over time

```
Raw audio → RMS → gate → normalize → smooth
```

---

## Why This Works

* Noise has low RMS → becomes 0
* Speech has higher RMS → survives
* Smoothing removes jitter

So:

* Silence → still orb
* Noise → still orb
* Speech → animation

---

## How It Drives the Orb

One amplitude value drives multiple parameters:

```
scale  = 2.5 × a
height = 1.5 × a
glow   = 0.1 × a
```

Different strengths, same source → cohesive motion.

---

## Important Note

This **does not denoise audio**.

It removes noise **from the animation behavior**, not from the sound itself.

---

> *Honestly, seeing chaotic audio turn into a clean, live control signal is still kind of mind‑boggling.*
