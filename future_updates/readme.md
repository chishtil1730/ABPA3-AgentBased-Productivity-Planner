# Future Work & System Extensions

This document outlines **planned future extensions** to the system, focusing on
**latency reduction, user comprehension, portability, and research-oriented agent experimentation**.
All proposals strictly preserve the core invariant of the system:

> **AI assists, users decide.  
> Capture is fast, commitment is intentional.  
> No system acts silently on the user’s behalf.**

---

##  Inter-Server Communication for Latency Reduction

### Motivation
The primary perceptible latency in the system arises from **voice-based interactions**:
speech-to-text (STT), agent reasoning, and text-to-speech (TTS).
Currently, these services operate as **independent endpoints**, coordinated by the web application.

### Proposed Extension
Introduce **inter-server communication** between STT, TTS, and agent services to enable:

- Model pre-warming
- Shared intermediate representations (e.g., partial transcripts)
- Pipelined execution instead of strictly sequential requests

Example:
- STT server streams partial text to the agent server
- Agent pre-computes intent while transcription completes
- TTS prepares synthesis as soon as final text is confirmed

### Design Constraint
- The **web application remains the sole orchestrator**
- Servers may communicate for optimization, but **never bypass user intent or UI confirmation**
- No autonomous server-side task mutation is permitted

This upgrade is **purely infrastructural** and does not alter user-facing behavior.

---

##  Replayable Onboarding / Tutorial Overlay

### Motivation
The system supports multiple interaction modes (thinking, voice capture, planning, execution).
While powerful, this reduces immediate discoverability for first-time users.

### Proposed Extension
Add a **non-blocking, replayable onboarding layer** that explains the workflow at a conceptual level.

Key properties:
- Displayed only on first launch
- Fully skippable
- Replayable on demand
- Implemented as a fullscreen overlay above the workspace
- No coupling to individual widgets or layout logic

### Rationale
The onboarding explains **how the system is meant to be used**, not how each feature works.
This preserves flexibility while improving approachability.

---

##  Cross-Workspace Portability via Intent Graphs

### Motivation
Traditional exports focus on tasks as flat lists.
This system models **intent, structure, and relationships** that are lost in such exports.

### Proposed Extension
Support export and import of **intent graphs**, including:
- Flow canvas nodes and edges
- Task relationships
- Links between voice notes, flow nodes, and tasks

Rather than exporting “tasks”, the system exports:
- Thought structure
- Decision points
- Execution state

### Benefits
- Enables replication across devices or installations
- Supports research reproducibility
- Allows interoperability with other tools without semantic loss

---

##  Latency-Aware UI Feedback

### Motivation
AI systems often hide latency to appear instantaneous, which can reduce user trust.
This system already distinguishes between **instant UI response** and **slower AI operations**.

### Proposed Extension
Introduce **explicit but minimal latency-aware UI states**, such as:
- “Listening…”
- “Thinking…”
- “Ready”

These states:
- Are informational, not blocking
- Avoid spinners or artificial delays
- Reflect real system state honestly

### Rationale
Transparent latency handling reinforces trust and sets accurate user expectations,
especially in voice-driven interactions.

---

## 9. Multi-Agent Experiments (Research-Oriented)

### Motivation
The architecture supports multiple agents, but unrestrained agent autonomy risks violating
user control and system coherence.

### Proposed Extension
Allow **experimental multi-agent configurations** behind explicit feature flags, such as:
- Planning agents
- Reflection agents
- Summarization agents

All agents must:
- Operate in advisory mode
- Produce suggestions, not actions
- Require explicit user confirmation before any commitment

### Scope
These experiments are **research-focused**, not default product behavior.
They serve to explore collaboration patterns between agents without compromising user intent.

---

## Closing Note

All proposed extensions are **additive**, **optional**, and **reversible**.
None alter the core workflow of:

**Think → Capture → Decide → Commit → Reflect**

This ensures that future evolution strengthens the system
without undermining its foundational design principles.
