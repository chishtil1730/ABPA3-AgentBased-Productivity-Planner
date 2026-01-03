import React, {
    useRef,
    forwardRef,
    useImperativeHandle,
    useEffect,
} from "react";
import GradientBlinds from "../backgrounds/GradientBlinds";

const LayoutBackground = forwardRef(({ paused }, ref) => {

    const containerRef = useRef(null);
    const canvasRef = useRef(null);

    // 🔹 Cache canvas once it appears
    useEffect(() => {
        let rafId;

        const findCanvas = () => {
            if (!containerRef.current) return;

            const canvas = containerRef.current.querySelector("canvas");

            if (canvas && canvas.width > 0 && canvas.height > 0) {
                canvasRef.current = canvas;
                return;
            }

            rafId = requestAnimationFrame(findCanvas);
        };

        findCanvas();

        return () => cancelAnimationFrame(rafId);
    }, []);

    useImperativeHandle(ref, () => ({
        captureSnapshot: () => {
            const canvas = canvasRef.current;

            if (!canvas) {
                console.warn("Snapshot failed: canvas not ready");
                return null;
            }

            try {
                return canvas.toDataURL("image/png");
            } catch (err) {
                console.error("Snapshot failed:", err);
                return null;
            }
        },
    }));

    return (
        <div
            ref={containerRef}
            className="layout-bg"
            style={{
                position: "fixed",
                inset: 0,
                width: "100vw",
                height: "100vh",
                overflow: "hidden",
            }}
        >
            <GradientBlinds
                paused={paused}
                gradientColors={["#3dc0d6", "#72cf44"]}
                angle={20}
                noise={0.2}
                blindCount={12}
                blindMinWidth={50}
                spotlightRadius={0.7}
                spotlightSoftness={1.2}
                spotlightOpacity={1}
                mouseDampening={0.6}
                distortAmount={6}
                shineDirection="left"
                mixBlendMode="lighten"
            />

        </div>
    );
});

LayoutBackground.displayName = "LayoutBackground";

export default LayoutBackground;
