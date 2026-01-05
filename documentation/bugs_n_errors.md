# 🧠 Bugs, Fixes & Lessons Learned  
### An Engineering Log from Building a Local-First Agentic System

> This document is a **curated engineering log** extracted from handwritten development notes.  
> It captures **real bugs**, **why they happened**, **how they were fixed**, and the **engineering lessons learned** while building a local-first, agent-driven productivity system.

---

## 1. Voice Didn’t React to Sound (Mic UI Felt “Dead”)

### ❌ The Bug
The microphone UI was active, but the voice orb / waveform did not react to actual speech.

### 🔍 Root Cause
- Raw microphone amplitude was sampled directly
- Values were noisy and inconsistent
- No temporal smoothing → UI appeared static

### ✅ The Fix
- Read raw audio buffer values
- Apply **RMS-based smoothing** over time
- Normalize amplitude before mapping to UI scale

### 🧠 Lesson Learned
> **Human perception ≠ raw signal data.**  
UI feedback must match *perceived loudness*, not raw amplitude.

---

## 2. Voice Recording Stopped Too Early

### ❌ The Bug
Recording ended while the user was still speaking.

### 🔍 Root Cause
- Silence detection threshold too aggressive
- No minimum recording window

### ✅ The Fix
- Increased silence timeout
- Added minimum recording duration
- Required sustained silence before auto-stop

### 🧠 Lesson Learned
> Voice systems must be **forgiving**, not “technically correct.”  
Humans pause while thinking — systems must expect that.

---

## 3. Whisper STT Returned Empty / Partial Text

### ❌ The Bug
Speech-to-text occasionally returned blank or incomplete output.

### 🔍 Root Cause
- Audio not consistently in 16kHz mono
- Improper preprocessing before Whisper

### ✅ The Fix
- Force FFmpeg preprocessing:
  - 16kHz sample rate
  - Mono channel
- Validate WAV format before inference

### 🧠 Lesson Learned
> ML models are **extremely strict about input contracts**.  
Most “model bugs” are actually *data bugs*.

---

## 4. Frontend Couldn’t Fetch Images (CORS Errors)

### ❌ The Bug
Images hosted on AWS / external sources failed to load in the browser.

### 🔍 Root Cause
- Browser-enforced CORS restrictions
- S3 hotlink protection

### ✅ The Fix
- Introduced a **backend proxy**
- Frontend → Local Proxy → External Resource
- Proxy injects proper headers

### 🧠 Lesson Learned
> Browsers are not servers.  
If you want control, **own the network boundary**.

---

## 5. API Keys Accidentally Exposed

### ❌ The Bug
Sensitive keys were visible in frontend code.

### 🔍 Root Cause
- Misuse of environment variables
- Secrets handled in client-side logic

### ✅ The Fix
- Move all secret-dependent logic to backend
- Frontend only talks to local server/proxy

### 🧠 Lesson Learned
> If the browser can see it, **it’s already compromised**.

---

## 6. Agent Outputs Didn’t Fit UI Needs

### ❌ The Bug
Single agent response hard to map into multiple UI fields.

### 🔍 Root Cause
- Unstructured, free-form text outputs

### ✅ The Fix
- Enforced **structured JSON responses**
- Split outputs into:
  - display text
  - metadata
  - actions

### 🧠 Lesson Learned
> Agents should talk to **machines first**, humans second.

---

## 7. Agents Blocking Each Other

### ❌ The Bug
One agent’s task delayed others.

### 🔍 Root Cause
- Shared responsibilities
- Synchronous execution

### ✅ The Fix
- Strict **agent responsibility isolation**
- Async execution via n8n

### 🧠 Lesson Learned
> Agents scale by **separation**, not intelligence.

---

## 8. UI Layout Broke on Resize

### ❌ The Bug
Widgets overlapped or clipped when resizing.

### 🔍 Root Cause
- Absolute positioning without constraints

### ✅ The Fix
- Switched to container-based layouts
- Introduced bounded responsive regions

### 🧠 Lesson Learned
> Absolute positioning is a shortcut that always charges interest later.

---

## 9. Animations Caused Frame Drops

### ❌ The Bug
UI lag when multiple animations ran together.

### 🔍 Root Cause
- Layout-triggering animations
- Heavy shadow recalculations

### ✅ The Fix
- Use transform-based animations only
- Reduce expensive visual effects

### 🧠 Lesson Learned
> Smooth UX is less about *more effects* and more about *cheaper effects*.

---

## 10. Progress Bar Showed Wrong Percentage

### ❌ The Bug
Visual progress didn’t match actual task completion.

### 🔍 Root Cause
- Incorrect total task count
- Early rounding

### ✅ The Fix
- Compute progress after full evaluation
- Round only at render time

### 🧠 Lesson Learned
> Numbers lie when calculated too early.

---

## 11. Data Lost on Refresh

### ❌ The Bug
Notes and tasks vanished on reload.

### 🔍 Root Cause
- State only lived in memory

### ✅ The Fix
- Persist critical state in `localStorage`
- Sync on app startup

### 🧠 Lesson Learned
> If users can lose data, **they will**.

---

## 12. Duplicate Tasks Created

### ❌ The Bug
Same task added multiple times rapidly.

### 🔍 Root Cause
- No idempotency checks
- UI allowed rapid re-submission

### ✅ The Fix
- Unique IDs
- Temporary submission locks

### 🧠 Lesson Learned
> Users click faster than your assumptions.

---

## 13. Over-Coupled Components

### ❌ The Bug
Fixing one widget broke others.

### 🔍 Root Cause
- Logic tightly bound to UI components

### ✅ The Fix
- Clear separation:
  - UI
  - logic
  - agents

### 🧠 Lesson Learned
> Coupling feels productive — until it isn’t.

---

## 14. Feature Creep Before Stability

### ❌ The Bug
System became fragile as features piled up.

### 🔍 Root Cause
- Shipping features faster than understanding them

### ✅ The Fix
- Feature freeze
- Refactors and cleanup

### 🧠 Lesson Learned
> Stability is a feature — and it’s expensive if delayed.

---

## 🧩 Final Engineering Takeaways

- Local-first systems are **easier to reason about**
- Structured data beats clever prompts
- Proxies are mandatory in real-world browsers
- UI polish must follow correctness
- *“Everything that is chaotic is beautiful — but must be controlled”*

---

