import { useEffect, useState } from "react";
import {
    motion,
    useMotionValue,
    useSpring,
    useVelocity,
    useTransform
} from "framer-motion";
import defaultCursor from "../assets/cursors/hand-cursor.png";
import typingCursor from "../assets/cursors/white-typing.png";

export function CustomCursor() {
    const [isTyping, setIsTyping] = useState(false);

    // 1. Position Tracking
    const mouseX = useMotionValue(-100);
    const mouseY = useMotionValue(-100);

    // 2. Physics - Slightly heavier damping for a "fluid" feel
    const springConfig = { damping: 50, stiffness: 800 };
    const x = useSpring(mouseX, springConfig);
    const y = useSpring(mouseY, springConfig);

    // 3. Velocity & Blur Calculation
    const xVelocity = useVelocity(x);
    const yVelocity = useVelocity(y);

    // Map velocity to blur (0px to 6px) and stretch (1 to 1.5)
    const blur = useTransform(
        [xVelocity, yVelocity],
        ([latestX, latestY]) => {
            const speed = Math.sqrt(Math.pow(latestX, 2) + Math.pow(latestY, 2));
            return `blur(${Math.min(speed / 400, 4.5)}px)`;
        }
    );

    useEffect(() => {
        const moveCursor = (e) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };

        const handleFocus = () => {
            const el = document.activeElement;
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable) {
                setIsTyping(true);
            } else {
                setIsTyping(false);
            }
        };

        window.addEventListener("mousemove", moveCursor);
        window.addEventListener("focusin", handleFocus);
        window.addEventListener("focusout", handleFocus);

        return () => {
            window.removeEventListener("mousemove", moveCursor);
            window.removeEventListener("focusin", handleFocus);
            window.removeEventListener("focusout", handleFocus);
        };
    }, [mouseX, mouseY]);

    return (
        <motion.div
            style={{
                position: "fixed",
                left: 0,
                top: 0,
                width: isTyping ? 24 : 32, // Adjust sizes for each image
                height: isTyping ? 24 : 32,
                pointerEvents: "none",
                zIndex: 999999,
                x,
                y,
                filter: blur, // Applies the motion blur
                backgroundImage: `url(${isTyping ? typingCursor : defaultCursor})`,
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                transition: "background-image 0.2s ease, width 0.2s, height 0.2s"
            }}
        />
    );
}

export default CustomCursor;