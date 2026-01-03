import React, { useEffect, useState } from "react";
import { useSyncExternalStore } from "react"; // ✅ NEW
import VoiceOrb from "./VoiceOrb";
import ChatUI from "./ChatUI";



/* ===============================
   GLOBAL VOICE FLAGS (UNCHANGED)
================================ */
let _micOn = false;
let _isWaiting = false;

/* ===============================
   IDLE CHECK (UNCHANGED — AS REQUESTED)
================================ */
export function isVoiceAssistantIdle() {
    return _micOn === false && _isWaiting === false;
}

/* ===============================
   SUBSCRIPTION MECHANISM (NEW)
================================ */
const listeners = new Set();

function emitChange() {
    listeners.forEach((l) => l());
}

/* ===============================
   REACTIVE HOOK (WRAPS YOUR FUNCTION)
================================ */
export function useVoiceAssistantIdle() {
    return useSyncExternalStore(
        (callback) => {
            listeners.add(callback);
            return () => listeners.delete(callback);
        },
        isVoiceAssistantIdle // ✅ reuse existing logic
    );
}

/* ===============================
   COMPONENT
================================ */
export default function IntegratedContainer({
                                                width = 300,
                                                height = 220,
                                                onWaitingChange,
                                            }) {
    const [micOn, setMicOn] = useState(false);
    const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
    const [voiceText, setVoiceText] = useState("");

    /* 🔹 Sync React state → globals (PLUS notify subscribers) */
    useEffect(() => {
        _micOn = micOn;
        _isWaiting = isWaitingForResponse;
        emitChange(); // ✅ CRITICAL: triggers Layout re-render
    }, [micOn, isWaitingForResponse]);

    /* 🔹 Sync waiting state → parent (unchanged) */
    useEffect(() => {
        if (typeof onWaitingChange === "function") {
            onWaitingChange(isWaitingForResponse);
        }
    }, [isWaitingForResponse, onWaitingChange]);

    return (
        <div
            style={{
                width: `${width}px`,
                height: `${height}px`,

                /* TRUE DARK GLASS */
                background: `
                    linear-gradient(
                        180deg,
                        rgba(18, 18, 18, 0.72),
                        rgba(8, 8, 8, 0.78)
                    )
                `,

                backdropFilter: "blur(28px) saturate(140%)",
                WebkitBackdropFilter: "blur(28px) saturate(140%)",

                borderRadius: "20px",
                border: "1px solid rgba(255, 255, 255, 0.12)",

                boxShadow: `
                    0 30px 70px rgba(0, 0, 0, 0.75),
                    inset 0 1px 0 rgba(255, 255, 255, 0.08)
                `,

                color: "#eaeaea",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",

                position: "relative",
                overflow: "hidden",
                boxSizing: "border-box",
            }}
        >
            <div className="VoiceAssistant">
                <VoiceOrb
                    micOn={micOn}
                    setMicOn={setMicOn}
                    isWaitingForResponse={isWaitingForResponse}
                    setIsWaitingForResponse={setIsWaitingForResponse}
                    onTranscript={setVoiceText}
                />

                {/* ChatUI stays mounted (logic intact, UI hidden) */}
                <div style={{ display: "none" }}>
                    <ChatUI
                        setMicOn={setMicOn}
                        setIsWaitingForResponse={setIsWaitingForResponse}
                        externalInput={voiceText}
                        clearExternalInput={() => setVoiceText("")}

                    />
                </div>
            </div>
        </div>
    );
}
