import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { Handle, useReactFlow } from "@xyflow/react";
import { motion } from "motion/react";


export default function NodeCustom({ id, data, selected }) {
    const { setNodes, getNode } = useReactFlow();
    const [isHovered, setIsHovered] = useState(false);

    const titleRef = useRef(null);
    const descRef = useRef(null);
    const hasInitialized = useRef(false);

    const [title, setTitle] = useState(data.title || "Title");
    const [desc, setDesc] = useState(data.desc || "Description...");

    function calculateTextWidth(text, font) {
        const canvas = calculateTextWidth.canvas || (calculateTextWidth.canvas = document.createElement("canvas"));
        const context = canvas.getContext("2d");
        context.font = font;
        return context.measureText(text).width;
    }

    // Update node data when title or desc changes
    useEffect(() => {
        setNodes(nds =>
            nds.map(n =>
                n.id === id
                    ? {
                        ...n,
                        data: {
                            ...n.data,
                            title,
                            desc
                        }
                    }
                    : n
            )
        );
    }, [title, desc, id, setNodes]);

    // push text updates
    useLayoutEffect(() => {
        const t = titleRef.current;
        const d = descRef.current;
        if (!t || !d) return;

        const node = getNode(id);

        // Skip recalculation on first render if node already has dimensions
        if (!hasInitialized.current && node?.style?.width && node?.style?.height) {
            hasInitialized.current = true;
            // Force textarea heights to match saved content
            t.style.height = "0px";
            t.style.height = `${t.scrollHeight}px`;
            d.style.height = "0px";
            d.style.height = `${d.scrollHeight}px`;
            return;
        }

        hasInitialized.current = true;

        // 1. Handle Height First (Standard Auto-resize)
        t.style.height = "0px";
        d.style.height = "0px";
        const tHeight = t.scrollHeight;
        const dHeight = d.scrollHeight;
        t.style.height = `${tHeight}px`;
        d.style.height = `${dHeight}px`;

        // 2. Logic for Stable Width
        const MIN_WIDTH = 230;
        const PADDING = 80;

        const titleWidth = calculateTextWidth(title.trim(), "800 26px Altone");
        const descWidth = calculateTextWidth(desc.trim(), "400 19px Altone");

        const contentWidth = Math.max(titleWidth, descWidth) + PADDING;

        const finalWidth = contentWidth > MIN_WIDTH ? contentWidth : MIN_WIDTH;
        const finalHeight = tHeight + dHeight + PADDING;

        setNodes(nds =>
            nds.map(n => {
                if (n.id !== id) return n;

                // Check if node already has saved dimensions that are larger
                const currentWidth = n.style?.width || 0;
                const currentHeight = n.style?.height || 0;

                // Use the larger of calculated or saved dimensions
                const useWidth = Math.max(finalWidth, currentWidth);
                const useHeight = Math.max(finalHeight, currentHeight);

                return {
                    ...n,
                    style: {
                        ...n.style,
                        width: useWidth,
                        height: useHeight,
                        overflow: 'hidden'
                    }
                };
            })
        );
    }, [title, desc, id, setNodes, getNode]);

    const containerStyle = {
        padding: "16px 20px",
        borderRadius: 15,


        transition: `
        transform 420ms cubic-bezier(0.4, 1, 0.1, 1),
        box-shadow 430ms ease
    `,

        willChange: "transform",
        transformOrigin: "center center",

        background: selected
            ? "linear-gradient(180deg, rgba(90, 90, 90, 0.95) 0%, rgba(60, 60, 60, 0.95) 100%)"
            : "linear-gradient(180deg, rgba(40, 40, 40, 0.9) 0%, rgba(30, 30, 30, 0.9) 100%)",

        border: selected
            ? "1.5px solid rgba(255, 255, 255, 0.30)"
            : "1px solid rgba(255, 255, 255, 0.25)",

        boxShadow: selected || isHovered
            ? "0 10px 32px rgba(0, 0, 0, 0.65)"
            : "0 2px 8px rgba(0, 0, 0, 0.3)",

        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        overflow: "hidden",

        /* 🌊 Smooth scale */
        transform: isHovered ? "scale(1.06)" : "scale(1)",

        cursor: "pointer",

        /* Ensure scaled node floats above others */
        zIndex: isHovered ? 20 : selected ? 10 : 1,
    };


    const baseInput = {
        width: "100%",
        resize: "none",
        border: "none",
        outline: "none",
        background: "transparent",
        overflow: "hidden",
        textAlign: "left",
        spellCheck: false,
        color: "#fff",
        fontFamily: "Epilogue",   // ← your font restored
    };

    return (
            <motion.div
                layout={false}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                animate={{
                    scale: isHovered ? 1.06 : 1,
                }}
                transition={{
                    type: "spring",
                    stiffness: 420,
                    damping: 16.5,
                    mass: 0.9,
                }}
                style={{
                    padding: "16px 20px",
                    borderRadius: 15,

                    background: selected
                        ? "linear-gradient(180deg, rgba(90, 90, 90, 0.95) 0%, rgba(60, 60, 60, 0.95) 100%)"
                        : "linear-gradient(180deg, rgba(40, 40, 40, 0.9) 0%, rgba(30, 30, 30, 0.9) 100%)",

                    border: selected
                        ? "1.5px solid rgba(255, 255, 255, 0.30)"
                        : "1px solid rgba(255, 255, 255, 0.25)",

                    boxShadow: selected || isHovered
                        ? "0 10px 32px rgba(0, 0, 0, 0.65)"
                        : "0 2px 8px rgba(0, 0, 0, 0.3)",

                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",

                    cursor: "pointer",
                    zIndex: isHovered ? 20 : selected ? 10 : 1,
                    transformOrigin: "center center",
                }}
            >


            {/* TITLE */}
            <textarea
                ref={titleRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                spellCheck={false}
                style={{
                    ...baseInput,
                    fontSize: 26,
                    fontFamily: "Epilogue",
                    fontWeight: 600,
                    lineHeight: "32px",
                }}
            />
            {/* DESCRIPTION */}
            <textarea
                ref={descRef}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                spellCheck={false}
                style={{
                    ...baseInput,
                    marginTop: 6,
                    fontSize: 19,
                    fontWeight: 320,
                    lineHeight: "26px",
                }}
            />
            <Handle type="source" position="right" style={{ opacity: 0 }} />
            <Handle type="target" position="left" style={{ opacity: 0 }} />
            </motion.div>
    );
}