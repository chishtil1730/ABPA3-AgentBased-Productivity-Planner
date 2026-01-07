# Local STT / TTS Server – Architecture Overview

## Overview
This project uses a **local HTTP server** to handle speech-related tasks for a voice assistant.  
The server is designed for **low-latency, single-user operation** and runs entirely on the local machine.

The server exposes **two core functions**:
- Speech-to-Text (STT)
- Text-to-Speech (TTS)

Both functions are accessed via HTTP and are **never called simultaneously**, ensuring predictable latency and no resource contention.

---

## Server
- Built using **Node.js (client)** and **Python (processing server)**
- Accepts **local HTTP requests only**
- Runs on a **single port: `5002`**
- No load balancer is used, as requests are serialized by design
- Optimized for **local-first, real-time interaction**

---

## Architecture

```
Local Client (Node.js)
        |
        v
+-----------------------+
|   Python STT/TTS      |
|       Server          |
|                       |
|   /stt     /tts       |
|                       |
+-----------------------+
        |
     Port 5002
```

---

## Speech-to-Text (STT)

- Engine: **whisper.cpp** (via `pywhispercpp`)
- Model: **base** (optionally `small` for higher accuracy)
- Input: **16 kHz mono WAV**
- Output: **Transcribed text**
- Max latency (warm): **200–300 ms**

### STT Flow
1. Audio is received as a file
2. Converted to **16 kHz mono WAV**
3. Processed by whisper.cpp
4. Text transcription is returned

---

## Text-to-Speech (TTS)

- Engine: **Piper TTS**
- Voice: **High-quality female voice model**
- Input: **Text**
- Output: **WAV audio**
- Max latency: **150–200 ms**

### TTS Flow
1. Text is received via HTTP
2. Piper generates speech audio
3. WAV audio is returned to the client

---

## Warm-Up Strategy (Critical for Low Latency)

### Why Warm-Up Is Required
Although models are loaded at startup, **Whisper does not fully initialize its inference pipeline until real audio is processed**.

The first real transcription normally triggers:
- FFT and mel-spectrogram plan creation
- Decoder graph initialization
- Token generation paths
- CPU cache and SIMD warm-up

If this happens during a user request, the first interaction feels slow.

---

### Real-Speech Warm-Up
To eliminate cold-start latency, the server performs **real-speech warm-up at startup**:

- Uses a **real recorded speech file** (not silence)
- Matches real acoustic and linguistic patterns
- Exercises the full decoder and token generation path

This warm-up is run **twice**:
1. First pass initializes internal structures
2. Second pass stabilizes hot CPU and cache paths

This ensures the **first user request has near-optimal latency**.

---

## Design Notes
- Models are **loaded once at startup**
- Warm-up is executed **before user interaction**
- Requests are handled **sequentially**
- Designed for **desktop / local assistant use**
- Optimized for simplicity and predictable performance

---

## Latency Summary

| Function | Typical Latency |
|--------|-----------------|
| STT    | 200–300 ms     |
| TTS    | 150–200 ms     |

---

## Status
This server is stable under normal operation and optimized for **local, real-time voice interactions** with no perceptible cold-start delay.
