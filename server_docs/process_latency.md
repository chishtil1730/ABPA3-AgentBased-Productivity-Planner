# Voice Assistant Processing Pipeline

## Overview
This document describes the **end-to-end processing flow** of a local voice assistant that listens, reasons, and talks back.  
The system is optimized for **low latency**, **deterministic behavior**, and **natural conversational turn-taking**.

Total response time is typically **under 1 second**, and rarely exceeds **~2 seconds in worst cases**.


---

## Step-by-Step Processing

### 1. Audio Capture
- User speaks into the microphone
- Audio is captured and sent as a **WAV file**

---

### 2. Speech-to-Text (STT)
- Audio is converted to **16 kHz mono** using FFmpeg
- Transcription is performed using **Whisper.cpp**
- Output is plain text

**Latency:** ~**200–300 ms**

---

### 3. AI Agent Processing
- Transcribed text is sent to an **AI agent workflow**
- Agent performs reasoning, decision-making, or task handling
- Output is a text response

**Latency:** ~**400–600 ms**

---

### 4. Text-to-Speech (TTS)
- Response text is passed to **Piper TTS**
- High-quality speech is synthesized
- Output is a WAV audio file

**Latency:** ~**150–200 ms**

---

### 5. Playback
- Generated audio is played back to the user
- Completes one conversational turn

---

## Latency Breakdown

| Stage | Approx. Time |
|-----|--------------|
| STT (FFmpeg + Whisper.cpp) | 200–300 ms |
| AI Agent Processing | 400–600 ms |
| TTS (Piper) | 150–200 ms |
| **Total End-to-End** | **~900–1100 ms** |

---

## Key Design Characteristics

- Fully **local** STT and TTS
- AI logic handled separately (e.g. via n8n)
- Sequential, turn-based interaction
- No overlapping speech or interruptions
- Optimized for **perceived responsiveness** over raw throughput

---

## Summary
This pipeline enables a natural, conversational voice assistant where:
- The system listens
- Thinks briefly
- Responds audibly

The resulting interaction feels intentional, responsive, and human-like, making it ideal for a talking voice assistant.

# Voice Assistant Processing Pipeline

## Overview
This document describes the **end-to-end processing flow** of a local voice assistant that listens, reasons, and talks back.  
The system is optimized for **low latency**, **deterministic behavior**, and **natural conversational turn-taking**.

Total response time is typically **under 1 second**, and rarely exceeds **~2 seconds in worst cases**.

---

## High-Level Flow

```mermaid
flowchart TD
    Mic["🎤 Mic Input"]
    AudioIn["Audio WAV"]
    STT["STT"]
    FFmpeg["FFmpeg\n16 kHz Mono Conversion"]
    Whisper["Whisper.cpp"]
    TextOut["Transcribed Text"]
    Agent["AI Agent (n8n)"]
    Response["Response Text"]
    TTS["TTS"]
    Piper["Piper TTS"]
    AudioOut["Audio WAV"]
    Speaker["🔊 Play Audio"]

    Mic --> AudioIn --> STT
    STT --> FFmpeg --> Whisper --> TextOut
    TextOut --> Agent --> Response
    Response --> TTS --> Piper --> AudioOut --> Speaker

