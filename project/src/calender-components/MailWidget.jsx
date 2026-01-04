import React, { useEffect, useMemo, useState } from "react";
import Fuse from "fuse.js";
import { Mic, Send, X, ChevronUp } from "lucide-react";
import {
    startWhisperRecording,
    stopWhisperRecording
} from "../voice-assistant/whisperSTT";


import muteSound from "../assets/sounds/MicOfd.mp3";
import unmuteSound from "../assets/sounds/MicOn.mp3";

/* =========================
   ISSUE TEMPLATES
========================= */
const ISSUE_TEMPLATES = [
    {
        label: "Leave Permission",
        value: "leave",
        text: "I would like to request leave permission for today due to personal reasons."
    },
    {
        label: "Outing Permission",
        value: "outing",
        text: "I request permission to go out of the campus for a short duration today."
    },
    {
        label: "Attendance Issue",
        value: "attendance",
        text: "There seems to be an issue with my attendance record. Kindly look into this.."
    },
    {
        label: "Free Hours",
        value: "free_hours",
        text: "I would like to know if there are any free hours available today."
    }
];

/* =========================
   CSV PARSER
========================= */
function parseCSV(text) {
    const rows = [];
    const lines = text.split(/\r?\n/).filter(Boolean);
    const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));

    for (let i = 1; i < lines.length; i++) {
        const values = [];
        let current = "";
        let insideQuotes = false;

        for (let char of lines[i]) {
            if (char === '"') insideQuotes = !insideQuotes;
            else if (char === "," && !insideQuotes) {
                values.push(current);
                current = "";
            } else {
                current += char;
            }
        }

        values.push(current);
        const obj = {};
        headers.forEach((h, idx) => {
            obj[h] = values[idx]?.trim().replace(/^"|"$/g, "");
        });
        rows.push(obj);
    }
    return rows;
}

/* =========================
   MAIL WIDGET
========================= */
export default function MailWidget() {
    const [faculty, setFaculty] = useState([]);
    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState(null);
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [imageSrc, setImageSrc] = useState("");
    const [imgError, setImgError] = useState(false);
    const [email, setEmail] = useState("");

    const [micOn, setMicOn] = useState(false);
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const muteAudio = useState(() => new Audio(muteSound))[0];
    const unmuteAudio = useState(() => new Audio(unmuteSound))[0];

    const [issueType, setIssueType] = useState("");
    const [templateOpen, setTemplateOpen] = useState(false);
    const [tempActiveIndex, setTempActiveIndex] = useState(-1);

    // Custom Template Selection Handler
    function handleTemplateClick(item) {
        setIssueType(item.value);
        setMessage(item.text);
        setTemplateOpen(false);
        setTempActiveIndex(-1);
    }

    /* ---------- LOAD CSV ---------- */
    useEffect(() => {
        async function loadCSV() {
            try {
                const csvUrl = new URL(
                    "../assets/faculty_details/faculty_details.csv",
                    import.meta.url
                );
                const res = await fetch(csvUrl);
                const text = await res.text();
                setFaculty(parseCSV(text));
            } catch (e) {
                console.error("Failed to load CSV", e);
            }
        }
        loadCSV();
    }, []);

    /* ---------- ANIMATIONS ---------- */
    useEffect(() => {
        const styleId = "mail-button-animations";
        if (!document.getElementById(styleId)) {
            const style = document.createElement("style");
            style.id = styleId;
            style.textContent = `
    @keyframes mic-breathe {
        0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 12px rgba(255, 59, 59, 0.4);
        }
        50% {
            transform: scale(1.08);
            box-shadow: 0 0 22px rgba(255, 59, 59, 0.9);
        }
    }

    @keyframes send-pulse {
        0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 16px rgba(34, 236, 117, 0.45);
        }
        50% {
            transform: scale(1.15);
            box-shadow: 0 0 30px rgba(34, 236, 117, 0.75);
        }
    }

    @keyframes toast-in {
        from {
            transform: translate(-50%, -20px);
            opacity: 0;
        }
        to {
            transform: translate(-50%, 0);
            opacity: 1;
        }
    }

    .mail-button {
        transition: transform 0.1s ease, box-shadow 0.1s ease;
    }

    .mail-button:active:not(:disabled) {
        transform: scale(0.92) !important;
    }

    .mail-button:focus {
        outline: none;
    }

    .mail-button:focus-visible {
        outline: none;
    }

    .template-item:hover {
        background: rgba(255,255,255,0.08) !important;
    }
`;
            document.head.appendChild(style);

        }
    }, []);

    useEffect(() => {
        if (selected?.email) setEmail(selected.email);
    }, [selected]);

    const fuse = useMemo(
        () => new Fuse(faculty, { keys: ["name", "email", "office"], threshold: 0.35 }),
        [faculty]
    );

    const results = query
        ? fuse.search(query).slice(0, 6).map(r => r.item)
        : faculty.slice(0, 6);

    useEffect(() => setActiveIndex(-1), [query]);

    useEffect(() => {
        if (!selected?.photo) {
            setImageSrc("");
            return;
        }
        const fileName = selected.photo.split("/").pop();
        setImgError(false);
        setImageSrc(`http://localhost:5000/faculty-photo/${fileName}`);
    }, [selected]);

    const handleKeyDown = (e) => {
        if (!open || results.length === 0) return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex(i => (i + 1) % results.length);
        }
        if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex(i => (i - 1 + results.length) % results.length);
        }
        if (e.key === "Enter" && activeIndex >= 0) {
            e.preventDefault();
            setSelected(results[activeIndex]);
            setQuery("");
            setOpen(false);
        }
        if (e.key === "Escape") setOpen(false);
    };

    // Keyboard navigation for the Template Dropdown
    const handleTemplateKeyDown = (e) => {
        if (!templateOpen) {
            if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
                e.preventDefault();
                setTemplateOpen(true);
            }
            return;
        }

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setTempActiveIndex(i => (i + 1) % ISSUE_TEMPLATES.length);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setTempActiveIndex(i => (i - 1 + ISSUE_TEMPLATES.length) % ISSUE_TEMPLATES.length);
        } else if (e.key === "Enter" && tempActiveIndex >= 0) {
            e.preventDefault();
            handleTemplateClick(ISSUE_TEMPLATES[tempActiveIndex]);
        } else if (e.key === "Escape") {
            setTemplateOpen(false);
            setTempActiveIndex(-1);
        }
    };

    async function toggleMic() {
        if (!micOn) {
            unmuteAudio.currentTime = 0;
            unmuteAudio.play();
            await startWhisperRecording();
            setMicOn(true);
        } else {
            muteAudio.currentTime = 0;
            muteAudio.play();
            setMicOn(false);
            try {
                const text = await stopWhisperRecording();
                if (text?.trim()) {
                    setMessage(prev => prev ? `${prev} ${text.trim()}` : text.trim());
                }
            } catch (err) { console.error("Whisper error:", err); }
        }
    }

    async function handleSend() {
        if (!email.trim() || !message.trim()) {
            alert("Email and message are required");
            return;
        }
        setShowConfirm(true);
    }

    async function confirmSend() {
        setShowConfirm(false);
        setSending(true);
        try {
            await fetch("http://localhost:5678/webhook/512ee95d-db62-4528-a368-550ff4e7c13d/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chatInput: `mail-id is "${email.trim()}" , do "${message.trim()}".` })
            });
            setMessage("");
            setEmail("");
            setSelected(null);
            setIssueType("");
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
        } catch (err) {
            console.error("Send failed:", err);
            alert("Failed to send message");
        } finally { setSending(false); }
    }

    function cancelSend() { setShowConfirm(false); }

    return (
        <div style={styles.container}>
            <div style={styles.header}>Mail</div>

            <div style={styles.content}>
                <div style={styles.form}>
                    <div style={styles.inputRow}>
                        <label style={styles.label}>To:</label>
                        <div style={styles.selectWrapper}>
                            <input
                                value={selected ? selected.name : query}
                                placeholder="Search recipient"
                                style={styles.input}
                                onChange={(e) => { setQuery(e.target.value); setSelected(null); setOpen(true); }}
                                onFocus={() => setOpen(true)}
                                onKeyDown={handleKeyDown}
                            />
                            {open && (
                                <div style={styles.dropdown}>
                                    {results.map((p, i) => (
                                        <div
                                            key={i}
                                            style={{ ...styles.option, background: i === activeIndex ? "rgba(255,255,255,0.12)" : "transparent" }}
                                            onMouseDown={() => { setSelected(p); setQuery(""); setOpen(false); }}
                                        >
                                            <div style={styles.optionName}>{p.name}</div>
                                            <div style={styles.optionSub}>{p.office}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={styles.inputRow}>
                        <label style={styles.label}>Email:</label>
                        <input
                            style={styles.input}
                            value={email}
                            placeholder="Enter email address"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div style={styles.bottomArea}>
                        <textarea
                            style={styles.textarea}
                            placeholder="Type your message..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />

                        <div style={styles.circleButtonRow}>
                            <div style={styles.customSelectWrapper}>
                                <div
                                    style={styles.templateTrigger}
                                    onClick={() => setTemplateOpen(!templateOpen)}
                                    onKeyDown={handleTemplateKeyDown}
                                    tabIndex={0}
                                >
                                    <span style={styles.triggerText}>
                                        {ISSUE_TEMPLATES.find(i => i.value === issueType)?.label || "Select Issue"}
                                    </span>
                                    <ChevronUp size={14} style={{ transform: templateOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.2s', opacity: 0.6 }} />
                                </div>

                                {templateOpen && (
                                    <>
                                        <div style={styles.templateOverlay} onClick={() => { setTemplateOpen(false); setTempActiveIndex(-1); }} />
                                        <div style={styles.templateMenu}>
                                            {ISSUE_TEMPLATES.map((item, idx) => (
                                                <div
                                                    key={item.value}
                                                    className="template-item"
                                                    style={{
                                                        ...styles.templateOption,
                                                        background: idx === tempActiveIndex || issueType === item.value
                                                            ? "rgba(255,255,255,0.12)"
                                                            : "transparent"
                                                    }}
                                                    onClick={() => handleTemplateClick(item)}
                                                >
                                                    {item.label}
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            <div style={styles.actionButtons}>
                                <button
                                    className="mail-button"
                                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(false); toggleMic(); }}
                                    style={styles.micButton(micOn)}
                                    title={micOn ? "Stop recording" : "Start recording"}
                                >
                                    <Mic size={18} color="white" />
                                </button>

                                <button
                                    className="mail-button"
                                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(false); handleSend(); }}
                                    style={styles.sendButton(sending)}
                                    title="Send message"
                                    disabled={sending}
                                >
                                    <Send size={16} color="white" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={styles.rightPane}>
                    {selected ? (
                        <>
                            <div style={styles.imageWrapper}>
                                {!imgError && imageSrc ? (
                                    <img src={imageSrc} alt={selected.name} style={styles.photo} onError={() => setImgError(true)} />
                                ) : (
                                    <div style={styles.fallbackAvatar}>{selected.name?.[0] || "?"}</div>
                                )}
                            </div>
                            <div style={styles.personInfo}>
                                <div style={styles.personName}>{selected.name}</div>
                                <div style={styles.personCabin}>Cabin: {selected.office}</div>
                            </div>
                        </>
                    ) : (
                        <div style={styles.previewCard}><div style={styles.fallbackAvatar}>?</div></div>
                    )}
                </div>
            </div>

            {showSuccess && (
                <div style={styles.successToast}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={styles.successIcon}>✓</div>
                        <span style={{ fontSize: 11, fontWeight: 500, color: '#fff' }}>Mail Sent</span>
                    </div>
                    <button style={styles.toastClose} onClick={() => setShowSuccess(false)}><X size={14} /></button>
                </div>
            )}

            {showConfirm && (
                <>
                    <div style={styles.localOverlay} onClick={cancelSend}></div>
                    <div style={styles.confirmDialog}>
                        <div style={styles.confirmTitle}>Confirm Send</div>
                        <div style={styles.confirmText}>Send email to <strong>{email}</strong>?</div>
                        <div style={styles.confirmMessage}>{message.length > 100 ? message.substring(0, 100) + "..." : message}</div>
                        <div style={styles.confirmButtons}>
                            <button style={styles.cancelButton} onClick={cancelSend}>Cancel</button>
                            <button style={styles.confirmButton} onClick={confirmSend}>Send</button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

/* =========================
   STYLES
========================= */
const styles = {
    container: {
        width: 442,
        height: 232,
        borderRadius: 24,
        position: "relative",
        overflow: "hidden",
        color: "#eaf5ef",

        background: `
        radial-gradient(
            140% 120% at 5% 0%,
            rgba(124, 255, 178, 0.22),
            rgba(0,0,0,0) 55%
        ),
        linear-gradient(
            180deg,
            rgba(10, 18, 14, 0.55),
            rgba(4, 6, 5, 0.65)
        )
    `,

        backdropFilter: "blur(12px) saturate(135%)",
        WebkitBackdropFilter: "blur(24px) saturate(135%)",

        boxShadow: `
        0 0 0 1px rgba(124,255,178,0.35),
        0 0 45px rgba(124,255,178,0.25),
        0 40px 90px rgba(0,0,0,0.8),
        inset 0 1px 0 rgba(255,255,255,0.08)
    `,

        padding: "14px 16px",
        display: "flex",
        flexDirection: "column"
    },

    header: {
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: "0.08em",
        opacity: 0.7,
        color: "#dff5ea"
    },

    label: {
        fontSize: 10,
        opacity: 0.55,
        width: 40,
        color: "#a7c2b6"
    },

    content: { display: "flex", gap: 12, flex: 1 },
    form: { flex: 1, display: "flex", flexDirection: "column", gap: 6 },
    inputRow: { display: "flex", alignItems: "center", gap: 8 },
    selectWrapper: { flex: 1, position: "relative" },
    input: {
        width: "100%",
        height: 28,
        borderRadius: 14,
        background: "rgba(255,255,255,0.035)",
        border: "1px solid rgba(255,255,255,0.1)",
        padding: "0 12px",
        color: "#eaf5ef",
        fontSize: 11,
        outline: "none",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        boxShadow: "inset 0 1px 1px rgba(255,255,255,0.06)"
    },

    dropdown: {
        position: "absolute",
        top: 32,
        left: 0,
        right: 0,
        background: "rgba(12, 22, 18, 0.65)",
        borderRadius: 16,
        backdropFilter: "blur(28px) saturate(140%)",
        WebkitBackdropFilter: "blur(28px) saturate(140%)",
        boxShadow: `
        0 30px 70px rgba(0,0,0,0.85),
        inset 0 1px 0 rgba(255,255,255,0.06)
    `,
        border: "1px solid rgba(255,255,255,0.14)",
        zIndex: 100,
        maxHeight: 150,
        overflowY: "auto"
    },

    option: { padding: "6px 10px", cursor: "pointer", transition: "background 0.15s ease" },
    optionName: { fontSize: 11 },
    optionSub: { fontSize: 9, opacity: 0.5 },
    bottomArea: { display: "flex", flexDirection: "column", flex: 1, gap: 8 },
    textarea: {
        flex: "0 0 52%",
        borderRadius: 16,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.1)",
        padding: "10px 12px",
        color: "#eaf5ef",
        fontSize: 11,
        resize: "none",
        outline: "none",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        boxShadow: "inset 0 1px 1px rgba(255,255,255,0.06)"
    },

    circleButtonRow: {
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 10, position: "relative", zIndex: 300, marginTop: 'auto'
    },
    actionButtons: { display: "flex", gap: 8, alignItems: "center" },

    /* --- CUSTOM DROPDOWN STYLES --- */
    /* --- UPDATED TRANSPARENT GLASS STYLES --- */

    customSelectWrapper: {
        position: "relative",
        flex: 1,
        maxWidth: 190,
        zIndex: 400
    },

    templateTrigger: {
        height: 36,
        borderRadius: 12,
        // Reduced from 0.06 to 0.03 for more transparency
        background: "rgba(255, 255, 255, 0.03)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        color: "#eaeaea",
        fontSize: 11,
        padding: "0 12px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        userSelect: "none",
        outline: "none",
        // Added blur to the trigger for consistency
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)"
    },

    triggerText: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        fontWeight: 500
    },

    templateMenu: {
        position: "absolute",
        bottom: "calc(100% + 10px)",
        left: 0,
        right: 0,

        background: `
        radial-gradient(
            140% 120% at 10% 0%,
            rgba(124,255,178,0.18),
            transparent 55%
        ),
        linear-gradient(
            180deg,
            rgba(8,14,11,0.75),
            rgba(3,5,4,0.85)
        )
    `,

        backdropFilter: "blur(28px) saturate(140%)",
        WebkitBackdropFilter: "blur(28px) saturate(140%)",

        borderRadius: 16,
        border: "1px solid rgba(124,255,178,0.25)",

        boxShadow: `
        0 0 0 1px rgba(124,255,178,0.18),
        0 25px 60px rgba(0,0,0,0.85),
        inset 0 1px 0 rgba(255,255,255,0.06)
    `,

        overflow: "hidden",
        padding: "6px",
        zIndex: 401
    },


    templateOption: {
        padding: "10px 14px",
        fontSize: 11,
        color: "rgba(234,245,239,0.85)",
        cursor: "pointer",
        borderRadius: 12,
        transition: "background 0.2s ease, color 0.2s ease"
    },


    templateOverlay: {
        position: "fixed",
        inset: -1000,
    },

    micButton: (on) => ({
        width: 38,
        height: 38,
        borderRadius: "50%",
        border: "1px solid rgba(255,255,255,0.14)",
        cursor: "pointer",
        background: on
            ? "rgba(250,28,28,0.55)"
            : "rgba(255,255,255,0.05)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: on ? "mic-breathe 1.4s ease-in-out infinite" : "none",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        boxShadow: on
            ? "0 0 18px rgba(255,80,80,0.5)"
            : `
            inset 0 1px 1px rgba(255,255,255,0.1),
            0 8px 22px rgba(0,0,0,0.5)
        `
    }),

    sendButton: (sending) => ({
        width: 38,
        height: 38,
        borderRadius: "50%",
        border: "1px solid rgba(255,255,255,0.14)",
        cursor: sending ? "not-allowed" : "pointer",
        background: sending
            ? "rgba(34,236,117,0.55)"
            : "rgba(255,255,255,0.05)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: sending ? "send-pulse 1s ease-in-out infinite" : "none",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        boxShadow: sending
            ? "0 0 20px rgba(0,236,0,0.55)"
            : `
            inset 0 1px 1px rgba(255,255,255,0.05),
            0 8px 22px rgba(0,0,0,0.5)
        `
    }),

    rightPane: { width: 110, display: "flex", flexDirection: "column", gap: 8 },
    imageWrapper: {
        width: "100%",
        height: 112,
        borderRadius: 18,
        overflow: "hidden",
        background: "rgba(255,255,255,0.035)",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "inset 0 1px 1px rgba(255,255,255,0.06)"
    },

    photo: { width: "100%", height: "100%", objectFit: "cover" },
    fallbackAvatar: {
        width: "100%", height: 110, borderRadius: 14, background: "rgba(255,255,255,0.08)",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: "rgba(255,255,255,0.25)"
    },
    personInfo: { textAlign: "center" },
    personName: { fontSize: 11, fontWeight: 600 },
    personCabin: { fontSize: 9, opacity: 0.5 },
    previewCard: {
        flex: 1, borderRadius: 14, background: "rgba(255,255,255,0.03)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)"
    },
    localOverlay: {
        position: "absolute",
        inset: 0,
        zIndex: 5000,
        borderRadius: 24,
        background: `
        radial-gradient(
            120% 120% at 50% 20%,
            rgba(124,255,178,0.12),
            rgba(0,0,0,0.55)
        )
    `,
        backdropFilter: "blur(2px)",
        WebkitBackdropFilter: "blur(10px)"
    },

    confirmDialog: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 340,
        padding: "22px 26px",
        borderRadius: 20,
        zIndex: 5001,
        color: "#eaf5ef",

        background: `
    radial-gradient(
        140% 120% at 10% 0%,
        rgba(124,255,178,0.18),
        transparent 60%
    ),
    linear-gradient(
        180deg,
        rgba(10,18,14,0.45),
        rgba(4,6,5,0.55)
    )
`,


        backdropFilter: "blur(12px) saturate(140%)",
        WebkitBackdropFilter: "blur(12px) saturate(140%)",

        boxShadow: `
        0 0 0 1px rgba(124,255,178,0.35),
        0 0 40px rgba(124,255,178,0.25),
        0 40px 100px rgba(0,0,0,0.8),
        inset 0 1px 0 rgba(255,255,255,0.08)
    `
    },

    confirmTitle: {
        fontSize: 15,
        fontWeight: 600,
        marginBottom: 12,
        color: "#f0fff7"
    },

    confirmText: {
        fontSize: 11,
        marginBottom: 10,
        color: "rgba(234,245,239,0.7)"
    },

    confirmMessage: {
        fontSize: 11,
        padding: "10px 12px",
        background: "rgba(255,255,255,0.04)",
        borderRadius: 12,
        marginBottom: 18,
        color: "rgba(234,245,239,0.75)",
        border: "1px solid rgba(255,255,255,0.08)",
        maxHeight: 60,
        overflow: "auto",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)"
    },

    confirmButtons: { display: "flex", gap: 10, justifyContent: "flex-end" },
    cancelButton: {
        padding: "8px 18px",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.14)",
        background: "rgba(255,255,255,0.04)",
        color: "rgba(234,245,239,0.75)",
        fontSize: 11,
        cursor: "pointer",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        boxShadow: `
        inset 0 1px 1px rgba(255,255,255,0.08),
        0 6px 18px rgba(0,0,0,0.45)
    `
    },

    confirmButton: {
        padding: "8px 22px",
        borderRadius: 12,
        border: "1px solid rgba(124,255,178,0.6)",
        fontWeight: 600,
        background: "rgba(124,255,178,0.22)",
        color: "#eafff4",
        fontSize: 11,
        cursor: "pointer",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        boxShadow: `
        0 0 14px rgba(124,255,178,0.45),
        inset 0 1px 1px rgba(255,255,255,0.2)
    `
    },

    successToast: {
        position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)",
        width: 140, height: 32, padding: "0 10px", borderRadius: 12, zIndex: 6000,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        // Lowered alpha from 0.7 to 0.3 for a much clearer glass look
        background: "rgba(255, 255, 255, 0.05)",
        border: "1px solid rgba(255, 255, 255, 0.15)",
        backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        animation: "toast-in 0.3s ease-out"
    },
    successIcon: {
        width: 16, height: 16, borderRadius: "50%",
        // Changed to a transparent green glow instead of solid green
        background: "rgba(20,223,156,0.2)",
        border: "1px solid rgba(16, 185, 129, 0.4)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#10b981", fontSize: 10, fontWeight: "bold"
    },
    toastClose: {
        background: "none", border: "none",
        // Lowered opacity for the 'X' button to blend in better
        color: "rgba(255,255,255,0.3)",
        cursor: "pointer", display: "flex", alignItems: "center", padding: 2,
        transition: "color 0.2s ease"
    }
};
