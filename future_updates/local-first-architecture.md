# ABPA3 – Local-First Architecture Overview

ABPA3 is designed as a **local-first, agent-driven system**, not a traditional SaaS web application.

The system prioritizes:
- Privacy
- Low latency
- User-owned computation
- Offline-first capability

---

## Core Principle

> ABPA3 is a **local operating environment**, not just a frontend.

The React UI is a **control surface**, while intelligence and automation live locally.

---

## Local Service Topology

The ABPA3 host device runs the following services:

| Service | Port | Responsibility |
|------|------|----------------|
| Gateway (Node/FastAPI) | 8080 | Single entry point |
| Image Proxy (Node) | 5000 | CORS-safe asset access |
| Voice Server (Python) | 5002 | STT + TTS |
| n8n | 5678 | Agent orchestration |

Only the **gateway** is accessible externally (LAN).

---

## Why This Architecture

- Prevents direct exposure of internal services
- Keeps n8n private and secure
- Enables future packaging (Desktop / Docker)
- Simplifies client-side logic

---

## What ABPA3 Is NOT

- ❌ A static website
- ❌ A cloud SaaS backend
- ❌ A publicly exposed automation server

ABPA3 is intentionally **local by default**.
