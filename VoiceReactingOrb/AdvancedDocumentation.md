# Voice Reacting Orb — Advanced Signal Processing Documentation

> **Internal / Technical**
> This document explains the full signal-processing pipeline used to drive the voice-reactive orb. It expands on the short visual explainer and captures the *complete reasoning*, trade-offs, and math behind the implementation.

---

## 1. Problem Statement

Microphone input is **never silent.**

Even when the user is not speaking, the raw signal contains:

* Mic hiss
* Electrical noise
* Room tone
* Environmental hum

**This is basically us wasting computation on something unnecessary**
If raw audio is mapped directly to visuals, the orb:

* Never stops moving
* Jitters in idle state
* Has no clear distinction between silence and speech

**Goal:**

> Convert chaotic audio into a **clean, intention-aware control signal** that animates *only when the user speaks*.

This system is **not audio denoising** — it is **control-signal conditioning**.

---

## 2. High-Level Pipeline

```
Microphone Input
→ Time-Domain Samples
→ Buffering
→ RMS Energy Extraction
→ Noise Floor Suppression
→ Normalization
→ Temporal Smoothing
→ Visual Parameter Mapping
```

The orb never sees raw audio — it only sees the **final smoothed amplitude value**.
This, way it is easy to add keyframes for the orb to react.

---

## 3. Raw Audio Input

### Representation

* Input sample rate: typically 44.1–48 kHz
* Converted to **16 kHz mono** for processing
* Samples are **32-bit floating-point values** in range:

```
[-1.0, +1.0]
```

### Problem with Raw Waveforms

Raw waveforms:

* Oscillate around zero
* Encode frequency, not energy
* Are visually meaningless for direct animation

**Reference — Raw waveform:**

![Raw waveform](./RawWaveform.png)

Even silence produces motion here.

---

## 4. Buffering Strategy

Instead of processing individual samples, audio is processed in **small time windows**.

Typical configuration:

* Sample rate: `16000 Hz`
* Buffer size: `~100 samples`

This yields:

```
16000 / 100 ≈ 160 amplitude frames per second
```

### Trade-off

| Buffer Size | Effect                      |
| ----------- | --------------------------- |
| Smaller     | Faster response, more noise |
| Larger      | Smoother, more latency      |

The chosen size balances **responsiveness** and **stability**.

---

## 5. Magnitude Extraction

Waveforms contain positive and negative values. For energy estimation, **sign is irrelevant**.

So we first collapse polarity:

```
|x[n]|
```

This produces a magnitude-only signal.

**Reference — Absolute / magnitude view:**

![Absolute signal](./absolute_sin_function.png)

This still contains noise, but energy is now visible.

---

## 6. RMS Energy Computation

To obtain a single energy value per buffer, **Root Mean Square (RMS)** is used:

```
RMS = sqrt((v₀² + v₁² + ... + vₙ²) / N)
```

### Why RMS

* Represents average signal energy
* Less sensitive than peak detection
* Closely matches human perception of loudness
* Naturally forms speech envelopes

Speech becomes clearly separable from background noise at this stage.

---

## 7. Noise Floor Suppression (Critical Step)

Normalization alone does **not** remove noise.

The real noise control happens via **threshold gating**:

```
if (RMS < noiseFloor)
    RMS = 0
```

### Effect

* Silence → 0
* Background noise → 0
* Speech → survives

This is effectively a **noise gate applied to the control signal**, not the audio.

---

## 8. Normalization

After gating, the remaining energy is normalized:

```
a_norm = clamp(RMS / RMS_max, 0, 1)
```

This ensures:

* Predictable ranges
* Stable parameter mapping
* Device-independent behavior

---

## 9. Temporal Smoothing

Even RMS energy fluctuates rapidly.

To prevent jitter, the signal is smoothed over time:

```
a_smooth = lerp(prev, a_norm, α)
```

Where `α` is a smoothing factor (e.g. `0.1–0.2`).

### Result

* Removes spikes
* Preserves motion continuity
* Produces organic animation

**Reference — Smoothed RMS envelope:**

![Smoothed RMS](./smoothened_rms.png)

This is the **final control signal**.

---

## 10. Visual Parameter Mapping

A single smoothed amplitude value drives multiple visual parameters.

Example mappings:

```
scale  = 2.5 × a_smooth
height = 1.5 × a_smooth
glow   = 0.1 × a_smooth
```

### Why This Works

* One coherent source of truth
* Different sensitivities per parameter
* Unified, expressive motion

No parameter is animated independently.

---

## 11. Behavioral Summary

| Condition        | RMS    | Orb Behavior       |
| ---------------- | ------ | ------------------ |
| Silence          | 0      | Completely still   |
| Background noise | 0      | Still              |
| Soft speech      | Low    | Subtle motion      |
| Normal speech    | Medium | Pulsing / glow     |
| Loud speech      | High   | Strong deformation |

---

## 12. Important Clarification

This system **does not clean the audio signal**.

It removes noise **from the animation response**, not from the sound itself.

Loud non-speech sounds will still drive the orb — by design.

---

## 13. Why This Approach Is Ideal

* Extremely low latency
* Computationally cheap
* Stable visuals
* Easy to tune
* No FFT or ML required

For animation control, this is more effective than complex denoising pipelines.

---

## 14. One-Line Summary

> Raw audio is transformed into a normalized, smoothed energy signal so that only intentional speech drives expressive visual motion.

---

*Watching chaotic audio become a clean, real-time control signal is still genuinely mind-boggling — even after implementing it.*
