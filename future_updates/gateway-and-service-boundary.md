# Gateway Design & Service Boundaries

The ABPA3 Gateway acts as a **Backend-for-Frontend (BFF)**.

It is the **only service** that client devices communicate with.

---

## Responsibilities of the Gateway

The gateway:
- Routes requests to internal services
- Enforces device trust
- Aggregates responses
- Maintains system state

The gateway does NOT:
- Perform STT/TTS
- Execute agent logic
- Run workflows
- Store sensitive content long-term

---

## API Surface (Minimal)

The gateway exposes capability-based APIs:

```http
POST /api/voice/transcribe
POST /api/voice/speak
POST /api/agent/run
GET  /api/ping
