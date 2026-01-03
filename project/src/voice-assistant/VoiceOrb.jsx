import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FaMicrophone, FaMicrophoneSlash, FaWifi } from "react-icons/fa";
import { MdWifiOff } from "react-icons/md";

import Prism from "./Prism";
import { useAudioLevel } from "./useAudioLevel";
import { startWhisperRecording, stopWhisperRecording } from "./whisperSTT";

import muteSound from "../assets/sounds/MicOfd.mp3";
import unmuteSound from "../assets/sounds/MicOn.mp3";

const smoothSlow = (c, t, f = 0.055) => c + (t - c) * f;
const smoothFast = (c, t, f = 0.22) => c + (t - c) * f;
const waitOscillator = (time, min = 0.1, max = 1.1, speed = 0.004) => {
    const t = (Math.sin(time * speed) + 1) / 2;
    return min + t * (max - min);
};

// FIXED: Default global state to false
let _isOnline = false;
export function isVoiceOrbOnline() { return _isOnline; }

export default function VoiceOrb({ micOn, setMicOn, isWaitingForResponse, setIsWaitingForResponse, onTranscript }) {
    const muteAudioRef = useRef(null);
    const unmuteAudioRef = useRef(null);
    const [prismKey, setPrismKey] = useState(0);

    const audioLevelRef = useAudioLevel(micOn);

    const slowAudio = useRef(0);
    const fastAudio = useRef(0);
    const lastWaitUpdate = useRef(0);
    const WAIT_FPS = 20;

    // FIXED: Initial state set to 0 (Offline)
    const [online, setOnline] = useState(0);
    useEffect(() => { _isOnline = online === 1; }, [online]);

    const BASE = { baseWidth: 5.5, scale: 1.8, height: 3.5, glow: 1.0, hueShift: 0.0 };
    const paramsRef = useRef(BASE);

    const [, forceRender] = useState(0);
    useEffect(() => {
        const id = setInterval(() => forceRender(v => v + 1), 33);
        return () => clearInterval(id);
    }, []);

    const HUE_MIN = -0.74;
    const HUE_MAX = 0.66;

    const refreshState = () => {
        slowAudio.current = 0;
        fastAudio.current = 0;
        paramsRef.current = BASE;
        setPrismKey(k => k + 1);
    };

    useEffect(() => {
        muteAudioRef.current = new Audio(muteSound);
        unmuteAudioRef.current = new Audio(unmuteSound);
    }, []);

    useEffect(() => {
        if (!micOn && !isWaitingForResponse) refreshState();
    }, [micOn, isWaitingForResponse]);

    useEffect(() => {
        let raf;
        const loop = () => {
            const now = performance.now();

            if (isWaitingForResponse && !micOn) {
                const breath = waitOscillator(now);
                slowAudio.current = smoothSlow(slowAudio.current, breath, 0.04);
                fastAudio.current = smoothFast(fastAudio.current, breath, 0.12);

                if (now - lastWaitUpdate.current > 1000 / WAIT_FPS) {
                    lastWaitUpdate.current = now;
                    const a = slowAudio.current;
                    paramsRef.current = {
                        baseWidth: BASE.baseWidth + a * 1.6,
                        scale: BASE.scale + a * 0.35,
                        height: BASE.height + a * 0.45,
                        glow: BASE.glow + a * 0.3,
                        hueShift: BASE.hueShift + a * 0.2,
                    };
                }
            }
            else if (!micOn) {
                slowAudio.current = smoothSlow(slowAudio.current, 0, 0.05);
                fastAudio.current = smoothFast(fastAudio.current, 0, 0.15);
                const p = paramsRef.current;
                paramsRef.current = {
                    baseWidth: smoothSlow(p.baseWidth, BASE.baseWidth, 0.10),
                    scale: smoothSlow(p.scale, BASE.scale, 0.10),
                    height: smoothSlow(p.height, BASE.height, 0.10),
                    glow: smoothSlow(p.glow, BASE.glow, 0.10),
                    hueShift: smoothSlow(p.hueShift, BASE.hueShift, 0.10),
                };
            }
            else {
                const level = audioLevelRef.current;
                slowAudio.current = smoothSlow(slowAudio.current, level);
                fastAudio.current = smoothFast(fastAudio.current, level);

                const aSlow = slowAudio.current;
                const aFast = fastAudio.current;

                paramsRef.current = {
                    baseWidth: BASE.baseWidth + Math.pow(aFast, 0.2) * 3.2,
                    scale: BASE.scale + Math.pow(aFast, 1.8) * 0.7,
                    height: BASE.height + Math.pow(aFast, 1.9) * 0.45,
                    glow: BASE.glow + Math.pow(aSlow, 2.4) * 0.3,
                    hueShift: HUE_MIN + Math.pow(aFast, 1.6) * (HUE_MAX - HUE_MIN),
                };
            }
            raf = requestAnimationFrame(loop);
        };
        loop();
        return () => cancelAnimationFrame(raf);
    }, [micOn, isWaitingForResponse]);

    const params = paramsRef.current;

    return (
        <div>
            <motion.div style={orbStyle} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}>
                <Prism {...params} key={prismKey} animationType="rotate" timeScale={0.5} noise={0} />
            </motion.div>

            <div style={controlsStyle}>
                <button
                    onClick={async () => {
                        if (!micOn) {
                            unmuteAudioRef.current?.play();
                            await startWhisperRecording();
                            setMicOn(true);
                            setIsWaitingForResponse(false);
                        } else {
                            muteAudioRef.current?.play();
                            setMicOn(false);
                            setIsWaitingForResponse(true);
                            const text = await stopWhisperRecording();
                            if (text?.trim()) onTranscript(text);
                        }
                    }}
                    style={micButtonBase}
                >
                    <OrbBG params={params} />
                    <div style={micIconLayer}>{micOn ? <FaMicrophone /> : <FaMicrophoneSlash />}</div>
                </button>

                {/* The WiFi Toggle Button */}
                <button onClick={() => setOnline(v => (v ? 0 : 1))} style={{ ...micButtonBase, marginLeft: 14 }}>
                    <OrbBG params={params} hue={online ? 0.25 : -0.5} />
                    <div style={micIconLayer}>{online ? <FaWifi /> : <MdWifiOff />}</div>
                </button>
            </div>
        </div>
    );
}

// --- Styles and Sub-components ---
const ORB_SIZE = 110;

const orbStyle = {
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: "50%",
    overflow: "hidden",
    position: "relative",
    top: -35,
    boxShadow: `0 12px 30px rgba(0,0,0,0.55), inset 0 1px 2px rgba(255,255,255,0.12)`
};
const controlsStyle = {
    position: "absolute",
    bottom: 20,
    left: 85,
    display: "flex"
};
const micButtonBase = {
    width: 56,
    height: 56,
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(20,20,30,0.45)",
    backdropFilter: "blur(14px) saturate(180%)",
    color: "#fff",
    fontSize: 22,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden"
};
const micOrbContainer = {
    position: "absolute",
    inset: -20,
    filter: "blur(10px) saturate(200%) brightness(1.15)",
    opacity: 0.85,
    transform: "scale(1.35)",
    pointerEvents: "none"
};
const micGlassOverlay = {
    position: "absolute",
    inset: 0,
    borderRadius: "50%",
    background: `radial-gradient(circle at top left, rgba(255,255,255,0.28), rgba(255,255,255,0.08) 42%, rgba(255,255,255,0.02) 70%)`,
    backdropFilter: "blur(10px)",
    pointerEvents: "none"
};
const micIconLayer = {
    position: "relative",
    zIndex: 3,
    textShadow: "0 1px 6px rgba(0,0,0,0.35)"
};

const OrbBG = ({ params, hue }) => (
    <>
        <div style={micOrbContainer}>
            <Prism
                animationType="rotate"
                timeScale={0.6}
                noise={0}
                scale={params.scale * 0.55}
                height={params.height * 0.55}
                baseWidth={params.baseWidth * 0.6}
                glow={params.glow * 0.9}
                hueShift={hue ?? params.hueShift}
            />
        </div>
        <div style={micGlassOverlay} />
    </>
);