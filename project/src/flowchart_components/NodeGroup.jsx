import { memo, useEffect, useState } from "react";
import { useReactFlow } from "@xyflow/react";

/* ---------- CONSTANTS ---------- */
const HEADER_HEIGHT = 64;
const PADDING = 24;

const COLORS = [
    { name: "Purple", bg: "rgba(139,92,246,0.15)", border: "rgba(139,92,246,0.6)" },
    { name: "Blue", bg: "rgba(59,130,246,0.15)", border: "rgba(59,130,246,0.6)" },
    { name: "Green", bg: "rgba(16,185,129,0.15)", border: "rgba(16,185,129,0.6)" },
    { name: "Orange", bg: "rgba(251,146,60,0.15)", border: "rgba(251,146,60,0.6)" },
];

function NodeGroup({ id, data, selected }) {
    const { getNodes, setNodes } = useReactFlow();

    const [editing, setEditing] = useState(false);
    const [title, setTitle] = useState(data.title || "Group");
    const [pickerOpen, setPickerOpen] = useState(false);

    const color = COLORS.find(c => c.bg === data.color) || COLORS[0];

    /* ---------- SYNC TITLE → DATA ---------- */
    useEffect(() => {
        setNodes(nodes =>
            nodes.map(n =>
                n.id === id
                    ? { ...n, data: { ...n.data, title } }
                    : n
            )
        );
    }, [title, id, setNodes]);

    /* ---------- AUTO RESIZE TO CHILDREN ---------- */
    useEffect(() => {
        if (data.collapsed) return;

        const nodes = getNodes();
        const children = nodes.filter(n => n.parentNode === id);

        if (!children.length) return;

        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;

        children.forEach(c => {
            minX = Math.min(minX, c.position.x);
            minY = Math.min(minY, c.position.y);
            maxX = Math.max(maxX, c.position.x + (c.width || 0));
            maxY = Math.max(maxY, c.position.y + (c.height || 0));
        });

        const width = maxX - minX + PADDING * 2;
        const height = maxY - minY + PADDING * 2 + HEADER_HEIGHT;

        setNodes(nodes =>
            nodes.map(n =>
                n.id === id
                    ? {
                        ...n,
                        style: {
                            ...n.style,
                            width,
                            height,
                        },
                    }
                    : n
            )
        );
    });

    /* ---------- APPLY COLOR ---------- */
    const applyColor = c => {
        setNodes(nodes =>
            nodes.map(n =>
                n.id === id
                    ? { ...n, data: { ...n.data, color: c.bg } }
                    : n
            )
        );
        setPickerOpen(false);
    };

    /* ---------- COLLAPSE / EXPAND ---------- */
    const toggleCollapse = () => {
        setNodes(nodes =>
            nodes.map(n => {
                if (n.id === id) {
                    return {
                        ...n,
                        data: { ...n.data, collapsed: !data.collapsed },
                        style: {
                            ...n.style,
                            height: data.collapsed ? n.style?.height : HEADER_HEIGHT,
                        },
                    };
                }

                if (n.parentNode === id) {
                    return {
                        ...n,
                        hidden: !data.collapsed,
                        draggable: data.collapsed,
                    };
                }

                return n;
            })
        );
    };

    return (
        <div
            style={{
                width: "100%",
                height: "100%",

                /* 🔑 ZOOM-SAFE TRANSPARENT GLASS */
                background: `
            linear-gradient(
                to bottom right,
                rgba(255,255,255,0.08),
                rgba(255,255,255,0.02)
            )
        `,

                fontFamily: "Epilogue",

                border: selected
                    ? `2px solid ${color.border}`
                    : `1.5px solid ${color.border}`,

                borderRadius: 24,
                boxSizing: "border-box",
                position: "relative",

                /* IMPORTANT */
                outline: "none",
            }}
        >


        {/* ---------- HEADER ---------- */}
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    height: HEADER_HEIGHT,
                    display: "flex",
                    fontFamily:"Epilogue",
                    alignItems: "center",
                    gap: 12,
                    padding: "0 16px",
                }}
            >
                {editing ? (
                    <input
                        autoFocus
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        onBlur={() => setEditing(false)}
                        onKeyDown={e => e.key === "Enter" && setEditing(false)}
                        style={{
                            flex: 1,
                            fontSize: 18,
                            fontFamily:"Epilogue",
                            fontWeight: 700,
                            color: "white",
                            background: "transparent",
                            border: "none",
                            outline: "none",
                        }}
                    />
                ) : (
                    <div
                        onDoubleClick={() => setEditing(true)}
                        style={{
                            flex: 1,
                            fontSize: 18,
                            fontWeight: 700,
                            color: "white",
                            cursor: "text",
                            userSelect: "none",
                        }}
                    >
                        {title}
                    </div>
                )}

                {/* COLLAPSE */}
                <button
                    onClick={toggleCollapse}
                    title="Collapse"
                    style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        background: "rgba(255,255,255,0.15)",
                        border: "none",
                        color: "white",
                        cursor: "pointer",
                    }}
                >
                    {data.collapsed ? "▸" : "▾"}
                </button>

                {/* COLOR PICKER */}
                <div style={{ position: "relative" }}>
                    <button
                        onClick={() => setPickerOpen(v => !v)}
                        style={{
                            width: 28,
                            height: 28,
                            borderRadius: 8,
                            background: color.bg,
                            border: `2px solid ${color.border}`,
                            cursor: "pointer",
                        }}
                    />

                    {pickerOpen && (
                        <div
                            style={{
                                position: "absolute",
                                top: 36,
                                right: 0,
                                display: "flex",
                                gap: 8,
                                padding: 8,
                                background: "rgba(20,20,20,0.95)",
                                borderRadius: 12,
                                border: "1px solid rgba(255,255,255,0.15)",
                            }}
                        >
                            {COLORS.map(c => (
                                <button
                                    key={c.name}
                                    onClick={() => applyColor(c)}
                                    style={{
                                        width: 26,
                                        height: 26,
                                        borderRadius: 8,
                                        background: c.bg,
                                        border: `2px solid ${c.border}`,
                                        cursor: "pointer",
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default memo(NodeGroup);
