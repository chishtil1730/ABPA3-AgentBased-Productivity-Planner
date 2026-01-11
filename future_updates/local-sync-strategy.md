# Mobile-Friendly UI & Local Sync Strategy

ABPA3 is delivered as a **responsive web application**, not a native mobile app.

Mobile devices act as **thin clients**.

---

## Mobile-First UI Philosophy

- Voice-first interaction
- Single-column layout
- Large touch targets
- Minimal cognitive load

Mobile UI focuses on:
- Voice input
- Agent feedback
- Quick actions

Complex views remain desktop-only.

---

## Responsive Design Rules

- No hover-only interactions
- Buttons ≥ 44px
- Bottom-anchored primary actions
- Conditional rendering based on screen size

Mobile and desktop share the same codebase.

---

## Connection-Aware UI States

The UI must handle:
- Disconnected
- Connecting
- Connected

These states map directly to WebSocket lifecycle events.

---

## Local Sync Integration

Once mobile UI is responsive:
- QR pairing establishes trust
- WebSocket enables real-time sync
- No UI rewrite is required

Transport changes do not affect UI logic.

---

## Design Goal

> Any device on the same network should feel like a **remote control for the same local intelligence**.
