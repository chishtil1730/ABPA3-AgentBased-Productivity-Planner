# ABPA3 – Agent-Based Productivity Planner
> A local-first, agent-driven productivity workspace designed to turn thoughts into structured action.

---

<!-- ===================================================== -->
<!-- 🎥 DEMO VIDEO                                          -->
<!-- ===================================================== -->

## 🎥 Checkout ABPA3

<div align="center">

https://github.com/user-attachments/assets/3a09838b-e2f4-4a22-b2df-0033e2720c1e

<br/>
<em>ABPA3 in action: from visual thinking to voice-driven automation</em>

</div>

<br/>

---

## ✨ What is ABPA3?

ABPA3 is an experimental productivity system built around **agent-based automation** and **visual-first thinking**.

Instead of juggling disconnected tools, ABPA3 brings together:
- Visual flowcharts for thinking
- Kanban boards for execution
- Calendar-aware actions
- A fully local voice assistant

All inside a single, cohesive workspace.

### ⏱ Focused Build Time

![Focused Build Time](https://img.shields.io/badge/Focused%20Build%20Time-140%2B%20hours-blueviolet?style=for-the-badge)



---
## ❗Read files from "documentation" folder

Documentation has:
- All the theory
- Encountered errors
- Handled solutions

---

---
## ❗❗Agent workflows & explanation in "n8n_workflows" folder

Images have:
- All workflows
- Settings for certains workflows
- System prompts.

---

## 🧠 From Thought → Action

The interface is designed as a **natural progression** of how work actually happens.

---

## 🟢 1. Think — Capture & Orient

<p align="center">
  <img src="dashboard_ui/landing_page.png" width="820"/>
</p>

### Landing Page

*A calm, minimal entry point that orients you inside your productivity space.*

- Reduces cognitive overload
- Surfaces only what matters now
- Acts as the starting point for all workflows

---

<p align="center">
  <img src="dashboard_ui/changeable_background.png" width="820"/>
</p>

### Changeable Background

*Dynamic backgrounds that adapt to focus, time, and working context.*

- Helps set mental state
- Visually separates modes of work
- Keeps the workspace from feeling static

---

<hr/>

## 🟡 2. Plan — Structure the Work

<p align="center">
  <img src="dashboard_ui/expanded_kanban.png" width="820"/>
</p>

### Expanded Kanban

*A full-scale Kanban board for planning and tracking execution.*

- Clear task states
- Visual progress tracking
- Designed for deep, uninterrupted work

---

<p align="center">
  <img src="dashboard_ui/addeventfromflowchart.png" width="820"/>
</p>

### Flowchart → Kanban

*Convert visual thinking directly into scheduled actions.*

- Flowcharts aren't just diagrams
- Decisions become calendar events
- Planning turns into commitment

---

<hr/>

## 🔵 3. Act — Speak & Automate

<p align="center">
  <img src="dashboard_ui/local_voice_assistant.png" width="820"/>
</p>

### Local Voice Assistant

*A fully local, low-latency voice assistant integrated into the system.*

- No cloud dependency
- Fast, private, and predictable
- Designed for frequent, natural use

---

<p align="center">
  <img src="dashboard_ui/voice_notes_stack_cards.png" width="820"/>
</p>

### Voice Notes

*Spoken thoughts captured as structured, interactive cards.*

- Think out loud
- Automatically organized
- Easy to refine later

---

<p align="center">
  <img src="dashboard_ui/voice_notes_mail.png" width="820"/>
</p>

### Voice → Mail

*Turn voice notes into ready-to-send emails instantly.*

- Removes friction from communication
- Keeps context intact
- Saves time on repetitive writing

---
## 🧠 Non-Obvious Technical Concepts Used

| Concept | Where It Appears | Why It’s Non-Obvious |
|------|----------------|----------------------|
| **Real-Time Audio Signal Sampling** | `useAudioLevel` | Continuously sampling microphone amplitude and mapping it to UI feedback crosses into digital signal processing, which is uncommon in typical frontend apps |
| **RMS-Based Temporal Smoothing** | Voice orb / mic intensity | Applying RMS smoothing stabilizes noisy audio signals and aligns UI response with human loudness perception |
| **EXIF-Aware Media Normalization** | Image → PDF pipeline | Correcting orientation using EXIF metadata avoids subtle double-rotation bugs common in media pipelines |
| **Proxy Server Architecture** | Image proxy service | Introducing a backend proxy to fetch third-party assets requires understanding browser security boundaries and request delegation |
| **AWS S3 CORS Constraint Handling** | External image loading | Navigating AWS S3 CORS policies and hotlink restrictions requires backend mediation rather than frontend workarounds |
| **Proxy-Mediated Asset Fetching** | Frontend ↔ backend boundary | Routing requests through a controlled server layer enables secure, compliant access to restricted resources |
| **Local-First STT & TTS Architecture** | Whisper.cpp, piperTTS integration | Running speech-to-text locally prioritizes privacy, determinism, and latency over cloud convenience |
| **Agent Responsibility Isolation** | n8n agents | Decomposing system intelligence into specialized agents avoids monolithic AI logic and improves scalability |
| **Event-Driven UI Synchronization** | Voice + Kanban | Custom event dispatching enables real-time UI reactions without polling or tight component coupling |
| **Inter Component Communication** | Voice <-> Kanban etc |Component dependent sub components just like inheritance and also info gathers and acts as security layers for more abstraction |
| **Natural Ordering Algorithms** | Media batching | Numeric-aware sorting prevents subtle ordering bugs caused by lexicographic file sorting |
| **UI as a Signal Consumer** | Voice visualization | Treating UI as a consumer of real-world signals (audio input) rather than only user actions is a paradigm shift |
| **Constraint-Driven UX Design** | CORS, offline-first | UX decisions shaped by platform and security constraints rather than idealized assumptions |





## ✨ What is ABPA3?

ABPA3 is an experimental productivity system built around **agent-based automation** and **visual-first thinking**.

Instead of juggling disconnected tools, ABPA3 brings together:
- Visual flowcharts for thinking
- Kanban boards for execution
- Calendar-aware actions
- A fully local voice assistant

All inside a single, cohesive workspace.

---

## ▶️ How to Run ABPA3 Locally

### 1. Install Dependencies
Follow instructions inside:
```
install_dependencies.txt
```

### 2. Clone the Repository
```
git clone https://github.com/chishtil1730/ABPA3-AgentBased-Productivity-Planner.git
cd ABPA3-AgentBased-Productivity-Planner
```

### 3. Start Services

**Python Server**

use the server.py file from server_docs and run it directly or<br>
with this command in terminal.

```
python server.py
```

**React App**
```
npm install
npm start
```

**Image Proxy**
```
node server.js
```

Open http://localhost:3000

<hr/>

## 🔁 4. Reflect — Stay in Control

ABPA3 is designed to **close the loop**:
- Thoughts become plans
- Plans become actions
- Actions leave artifacts you can review and refine

The system supports **iteration**, not perfection.

---

## 🧠 Core Philosophy

- 🧩 Agent-based automation over monolithic tools  
- 🔒 Local-first, privacy-respecting design  
- ⚡ Low-latency interactions  
- 🎯 Visual clarity over feature overload  

ABPA3 treats productivity as a **system**, not a checklist.

---

## 🚧 Project Status

This project is under active development.  
UI previews represent evolving, experimental features and internal tooling.

---

## 📌 Notes

- This repository is intentionally **read-only**
- Forks and pull requests are welcome
- Direct pushes are disabled by design

---



