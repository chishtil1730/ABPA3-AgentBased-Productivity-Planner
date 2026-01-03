import { useEffect, useRef } from "react";

export function useAudioLevel(enabled = true) {
    // 💡 Using a ref instead of state prevents the "lag" caused by constant re-renders
    const levelRef = useRef(0);
    const rafRef = useRef(null);

    useEffect(() => {
        if (!enabled) {
            levelRef.current = 0;
            return;
        }

        let audioCtx;
        let analyser;
        let source;
        let data;

        async function init() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                audioCtx = new AudioContext({ sampleRate: 16000 });
                analyser = audioCtx.createAnalyser();
                analyser.fftSize = 256;
                // 💡 Increased from 0.4 to 0.8 for smoother, less sharp transitions
                analyser.smoothingTimeConstant = 0.8;

                source = audioCtx.createMediaStreamSource(stream);
                source.connect(analyser);
                data = new Uint8Array(analyser.fftSize);

                const tick = () => {
                    analyser.getByteTimeDomainData(data);
                    let sum = 0;
                    for (let i = 0; i < data.length; i++) {
                        const v = (data[i] - 128) / 128;
                        sum += v * v;
                    }
                    const rms = Math.sqrt(sum / data.length);

                    // Update the ref value directly
                    levelRef.current = Math.min(Math.pow(rms * 3, 0.6), 1);
                    rafRef.current = requestAnimationFrame(tick);
                };
                tick();
            } catch (err) {
                console.error("Audio initialization failed:", err);
            }
        }

        init();

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            if (audioCtx) audioCtx.close();
        };
    }, [enabled]);

    return levelRef;
}