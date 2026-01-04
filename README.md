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


---
## ❗Read files from documentation

Documentation has:
- All the theory
- Encountered errors
- Handled solutions

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
## Concepts used in the development of ABPA3:
| Concept                                  | Where Used                  | What It Means                                                                      | Why It Was Needed                                                                                  |
| ---------------------------------------- | --------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| **Digital Audio Signal Processing**      | `useAudioLevel` hook        | Real-time analysis of microphone audio levels using time-domain amplitude sampling | To drive responsive UI feedback (voice orb, mic intensity, animations) based on actual voice input |
| **RMS Smoothing (Root Mean Square)**     | Audio level visualization   | A mathematical technique to smooth fluctuating audio signals                       | Prevents jittery UI and produces natural, human-like mic animations                                |
| **Local Speech-to-Text Pipeline**        | Whisper integration         | Running STT fully offline using Whisper.cpp                                        | Ensures privacy, low latency, and no cloud dependency                                              |
| **Agent-Based System Architecture**      | n8n + AI agents             | Independent agents handling specific responsibilities (mail, planning, analysis)   | Makes the system modular, extensible, and easier to reason about                                   |
| **Proxy Server for CORS & Hotlinking**   | Image / asset fetching      | A backend intermediary that fetches external resources on behalf of the frontend   | Bypasses AWS S3 CORS restrictions and prevents broken image loading                                |
| **CORS (Cross-Origin Resource Sharing)** | AWS image access            | Browser security mechanism restricting cross-domain requests                       | Required architectural workaround to safely access external assets                                 |
| **Local-First Architecture**             | Entire app design           | Data and intelligence run on the user’s machine first                              | Improves privacy, reliability, and offline usability                                               |
| **Natural Language → Structured Action** | Planner & agents            | Translating free-form user input into structured tasks/events                      | Core productivity goal of ABPA3                                                                    |
| **Fuzzy Search & Approximate Matching**  | Faculty search dropdown     | Matching user input even with typos or partial names                               | Improves UX and avoids exact-match limitations                                                     |
| **Natural Sorting Algorithms**           | Image → PDF pipeline        | Sorting filenames numerically instead of lexicographically                         | Ensures correct page order (1, 2, 10 instead of 1, 10, 2)                                          |
| **Media Preprocessing & Compression**    | Image-to-PDF conversion     | Resizing, rotating, and compressing images before PDF generation                   | Reduces file size while keeping readability                                                        |
| **EXIF Orientation Handling**            | Image processing            | Reading camera metadata to correct image rotation                                  | Prevents incorrect orientation from phone-captured images                                          |
| **Event-Driven UI Updates**              | Voice & Kanban interactions | UI reacts to internal state changes and custom events                              | Enables smooth real-time feedback without polling                                                  |
| **State History (Undo / Redo)**          | Notes & Kanban              | Tracking past and future states                                                    | Allows non-destructive editing and experimentation                                                 |
| **Visual Thinking Interfaces**           | Flow canvas                 | Representing thoughts as spatial, visual structures                                | Mirrors how humans actually think and plan                                                         |



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



