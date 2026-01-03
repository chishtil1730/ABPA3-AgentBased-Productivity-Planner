import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { Handle, useReactFlow } from "@xyflow/react";



export default function NodeLabel({ id, data, selected }) {
    const textRef = useRef(null);
    const { setNodes } = useReactFlow();
    const [isHovered, setIsHovered] = useState(false);

    const [text, setText] = useState(data.text || "Connects with");

    // update node data
    useEffect(() => {
        setNodes(nds =>
            nds.map(n =>
                n.id === id ? { ...n, data: { ...n.data, text } } : n
            )
        );
    }, [text, id, setNodes]);

    useLayoutEffect(() => {
        const t = textRef.current;
        if (!t) return;

        // 1. Reset height to calculate actual content height (enables shrinking)
        t.style.height = "0px";
        const currentScrollHeight = t.scrollHeight;
        t.style.height = `${currentScrollHeight}px`;

        // 2. Define your desired width behavior
        // If you want it to stop expanding horizontally, use a fixed value or base it
        // on a different metric than scrollWidth (which reflects the largest line ever seen).
        const fixedWidth = 190; // Set your desired constant width here
        const dynamicHeight = currentScrollHeight + 30;

        setNodes(nds =>
            nds.map(n =>
                n.id === id ? { ...n, style: { ...n.style, width: fixedWidth, height: dynamicHeight } } : n
            )
        );
    }, [text, id, setNodes]);



    // Ensure you have: const [isHovered, setIsHovered] = useState(false);

    const box = {
        padding: "10px 10px",
        borderRadius: 40,

        // Combined your existing transitions with the transform logic
        transition: `
        transform 420ms cubic-bezier(0.4, 1, 0.1, 1),
        box-shadow 430ms ease,
        background 300ms ease
    `,

        willChange: "transform",
        transformOrigin: "center center",

        // Scaling logic: 1.04 is subtle and professional
        transform: isHovered ? "scale(1.04)" : "scale(1)",

        background: selected
            ? "linear-gradient(180deg, rgba(255,255,255,0.32), rgba(255,255,255,0.12))"
            : isHovered
                ? "linear-gradient(180deg, rgba(255,255,255,0.28), rgba(255,255,255,0.08))" // Slight brightening on hover
                : "linear-gradient(180deg, rgba(255,255,255,0.22), rgba(255,255,255,0.05))",

        border: selected
            ? "2px solid rgba(255,255,255,0.85)"
            : "1.5px solid rgba(255,255,255,0.28)",

        boxShadow: selected || isHovered
            ? "inset 0 0 45px rgba(255,255,255,0.30), 0 15px 35px rgba(0,0,0,0.45)" // Increased depth on hover
            : "inset 0 0 25px rgba(255,255,255,0.18), 0 8px 24px rgba(0,0,0,0.32)",

        color: "white",
        fontFamily: "Epilogue",
        fontSize: 10,
        overflow: "hidden",
        backdropFilter: "blur(22px) saturate(150%)",
        cursor: "pointer",
        zIndex: isHovered ? 10 : 1,
    };

    return (
        <div style={box}>
            <textarea
                ref={textRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                spellCheck={false}
                style={{
                    width: "100%",
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    resize: "none",
                    overflow: "hidden",
                    textAlign: "center",
                    color: "#fff",
                    fontFamily: "Epilogue",
                    fontSize: 18,
                    lineHeight: "24px",
                }}
            />

            <Handle type="target" position="left" style={{ opacity: 0 }} />
            <Handle type="source" position="right" style={{ opacity: 0 }} />
        </div>
    );
}
