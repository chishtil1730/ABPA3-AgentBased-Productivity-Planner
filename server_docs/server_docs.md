# Local STT / TTS Server – Architecture Overview

## Overview
This project uses a **local HTTP server** to handle speech-related tasks for a voice assistant.  
The server is designed for **low-latency, single-user operation** and runs entirely on the local machine.

The server exposes **two core functions**:
- Speech-to-Text (STT)
- Text-to-Speech (TTS)

Both functions are accessed via HTTP and are **never called simultaneously**.

---

## Server
- Built using **Node.js (client)** and **Python (processing server)**
- Accepts **local HTTP requests only**
- Runs on a **single port: `5002`**
- No load balancer is used, as requests are serialized by design

##Architecture
Local HTTP Request

|

v

+--------------------+

| Python Server |

| |

| /stt /tts |

+--------------------+

|

Port 5002



---

## Speech-to-Text (STT)
- Engine: **whisper.cpp** (via `pywhispercpp`)
- Model: **base** (optionally `small` for higher accuracy)
- Input: **16 kHz mono WAV**
- Output: **Transcribed text**
- Max latency: **200-300 ms**

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

## Design Notes
- Models are **loaded once at startup**
- Requests are handled **sequentially**
- Designed for **desktop / local assistant use**
- Optimized for simplicity and predictable latency

---

## Latency Summary

| Function | Max Latency |
|--------|-------------|
| STT    | ~500 ms     |
| TTS    | 150–200 ms  |

---

## Status
This server is stable under normal operation and optimized for local, real-time voice interactions.
