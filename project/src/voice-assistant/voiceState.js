import { useSyncExternalStore } from "react";

/* ===============================
   INTERNAL STATE (MODULE-LEVEL)
================================ */
let _micOn = false;
let _isWaiting = false;

const listeners = new Set();

function emitChange() {
    listeners.forEach((l) => l());
}

/* ===============================
   SETTERS (USED BY VOICE SYSTEM)
================================ */
export function setMicOn(value) {
    _micOn = value;
    emitChange();
}

export function setIsWaiting(value) {
    _isWaiting = value;
    emitChange();
}

/* ===============================
   SNAPSHOT (NON-REACTIVE, OPTIONAL)
================================ */
export function getVoiceAssistantIdleSnapshot() {
    return _micOn === false && _isWaiting === false;
}

/* ===============================
   REACTIVE HOOK (THIS IS THE KEY)
================================ */
export function useVoiceAssistantIdle() {
    return useSyncExternalStore(
        (callback) => {
            listeners.add(callback);
            return () => listeners.delete(callback);
        },
        () => _micOn === false && _isWaiting === false
    );
}
