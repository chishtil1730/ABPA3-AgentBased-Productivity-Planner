# Local-First Sync, Tags & Versioning Strategy

## User Tags
- Tags are designed to be **live and always up to date**.
- They evolve dynamically with user actions.

## Version Control
- All user changes are tracked.
- Version control enables:
  - Rollbacks
  - Auditing
  - Change history

## Local-First Architecture
- Data is written locally first (browser/storage).
- Server/database sync happens **gradually**.

## Sync Strategy
- When the system is idle:
  - Begin pushing data to the database.
  - Slowly clear browser/local memory.
  - Push to DB and sync data to the local connected device.
- This avoids blocking the user and improves perceived performance.

## Goal
- Maximum responsiveness
- Offline resilience
- Safe, incremental persistence
