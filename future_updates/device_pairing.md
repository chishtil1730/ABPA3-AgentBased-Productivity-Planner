# Device Pairing & Real-Time Sync (Draft)

## Overview
ABPA3 supports secure, local-first **device-to-device pairing** using a QR-based trust exchange.
Pairing is required only once per device and enables automatic reconnection via WebSockets.

---

## Pairing Goals
- One-time user-approved trust establishment
- No cloud dependency
- No repeated pairing on reconnect
- Local network (LAN) only

---

## Pairing Flow (One-Time)

### 1. Host Generates Pairing QR
The ABPA3 Gateway generates a temporary pairing token and embeds it in a QR code.

**QR Payload Example**
```json
{
  "host": "192.168.1.42",
  "port": 8080,
  "pairToken": "a8f9c1d2e4",
  "expires": 1736764800
}
```

The QR is displayed only on the host device.

---

### 2. Client Scans QR
The client device scans the QR and sends a pairing request to the gateway.

```http
POST /api/pair
```

```json
{
  "pairToken": "a8f9c1d2e4",
  "deviceInfo": {
    "name": "Pixel 7",
    "type": "mobile"
  }
}
```

---

### 3. Gateway Issues Device Key
If the pairing token is valid and not expired, the gateway generates a persistent device key.

```json
{
  "deviceId": "pixel7",
  "deviceKey": "dev_92fd8a71e5c4"
}
```

The gateway stores the device in its registry.

---

### 4. Client Stores Device Key
The client securely stores:
- deviceKey
- host IP
- gateway port

This completes pairing. QR is no longer required.

---

## Automatic Reconnection

On subsequent launches:
1. Client reads stored deviceKey
2. Attempts connection to last known host
3. Sends deviceKey for authentication
4. Gateway validates and restores session

---

## WebSocket Connection

After pairing, clients connect via WebSocket:

```
ws://<host-ip>:8080/ws
Authorization: Device <deviceKey>
```

This channel is used for:
- Real-time agent updates
- Voice state streaming
- UI sync events

---

## Device Registry (Host Side)

Example structure:
```json
{
  "devices": [
    {
      "deviceId": "pixel7",
      "deviceKey": "dev_92fd8a71e5c4",
      "lastSeen": "2026-01-11T18:30:00Z",
      "revoked": false
    }
  ]
}
```

---

## Security Notes
- Pairing tokens are one-time and short-lived
- deviceKeys are never displayed again
- Only the gateway is exposed on the LAN
- Internal services (n8n, STT/TTS) remain private

---

## Network Assumption
All paired devices must be on the same local network.
No internet connectivity is required after initial UI load.
