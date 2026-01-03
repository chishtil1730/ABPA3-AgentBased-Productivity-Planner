import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { speakWithPiper } from "./piperTTS";
import {isVoiceOrbOnline} from "./VoiceOrb";
/* =========================
   Webhook URLs
========================= */

// 🌐 ONLINE (previously commented link)
const ONLINE_URL =
    "http://localhost:5678/webhook/726e228f-4b66-4ef0-b5e7-41d7d42b7be6/chat";

// 📴 OFFLINE (previously active link)
const OFFLINE_URL =
    "http://localhost:5678/webhook/90296261-208f-4d35-a6a0-4c7f8959dd3d/chat";

export default function ChatUI({
                                   setMicOn,
                                   setIsWaitingForResponse,
                                   externalInput,
                                   clearExternalInput,
                               }) {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const endRef = useRef(null);

    const online = isVoiceOrbOnline()

    /* =========================
       External Voice Input
    ========================= */

    useEffect(() => {
        if (externalInput && externalInput.trim()) {
            setInput(externalInput);
            sendMessage(externalInput);
            clearExternalInput();
        }
    }, [externalInput]);

    /* =========================
       Auto-scroll
    ========================= */

    useEffect(() => {
        if (endRef.current) {
            const container = endRef.current.parentElement;
            container.scrollTop = container.scrollHeight;
        }
    }, [messages]);

    /* =========================
       Helpers
    ========================= */

    function extractN8nText(data) {
        if (Array.isArray(data) && data.length > 0) {
            return data[0].output || data[0].text || JSON.stringify(data[0]);
        }
        if (typeof data === "object") {
            return data.output || data.text || JSON.stringify(data);
        }
        return String(data);
    }

    /* =========================
       Send Message
    ========================= */

    async function sendMessage(forcedText) {
        const userText = (forcedText ?? input).trim();
        if (!userText) return;

        setMessages(prev => [...prev, { sender: "user", text: userText }]);
        setInput("");

        setMicOn(false);
        setIsWaitingForResponse(true);
        setLoading(true);

        try {
            const response = await fetch(
                online ? ONLINE_URL : OFFLINE_URL,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ chatInput: userText }),
                }
            );

            const data = await response.json();
            const botText = extractN8nText(data);

            const cleanText = botText
                .replace(/```[\s\S]*?```/g, "")
                .replace(/`([^`]+)`/g, "$1")
                .replace(/\*\*(.*?)\*\*/g, "$1")
                .replace(/\*(.*?)\*/g, "$1");

            try {
                await speakWithPiper(cleanText);
            } catch (err) {
                setMessages(prev => [
                    ...prev,
                    { sender: "bot", text: "🔊 TTS unavailable." },
                ]);
            }

            setMessages(prev => [
                ...prev,
                { sender: "bot", text: cleanText },
            ]);
        } catch (err) {
            setMessages(prev => [
                ...prev,
                {
                    sender: "bot",
                    text: online
                        ? "❌ Error contacting online agent."
                        : "📴 Offline agent unreachable.",
                },
            ]);
        }

        setIsWaitingForResponse(false);
        setLoading(false);
    }

    /* =========================
       Render
    ========================= */

    return (
        <div style={styles.chatContainer}>
            <div style={styles.messages}>
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        style={{
                            ...styles.messageBubble,
                            alignSelf:
                                msg.sender === "user"
                                    ? "flex-end"
                                    : "flex-start",
                            backgroundColor:
                                msg.sender === "user"
                                    ? "#007bff"
                                    : "#e0e0e0",
                            color:
                                msg.sender === "user"
                                    ? "white"
                                    : "black",
                        }}
                    >
                        {msg.sender === "bot" ? (
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    code({ inline, children, ...props }) {
                                        return inline ? (
                                            <code
                                                {...props}
                                                style={{
                                                    backgroundColor: "#eee",
                                                    padding: "2px 4px",
                                                    borderRadius: "4px",
                                                }}
                                            >
                                                {children}
                                            </code>
                                        ) : (
                                            <pre
                                                style={{
                                                    backgroundColor: "#eee",
                                                    padding: "10px",
                                                    borderRadius: "6px",
                                                    whiteSpace: "pre-wrap",
                                                }}
                                            >
                                                <code {...props}>
                                                    {children}
                                                </code>
                                            </pre>
                                        );
                                    },
                                }}
                            >
                                {msg.text}
                            </ReactMarkdown>
                        ) : (
                            msg.text
                        )}
                    </div>
                ))}

                {loading && (
                    <div
                        style={{
                            ...styles.messageBubble,
                            backgroundColor: "#e0e0e0",
                        }}
                    >
                        Typing…
                    </div>
                )}

                <div ref={endRef} />
            </div>

            <div style={styles.inputContainer}>
                <input
                    style={styles.input}
                    type="text"
                    value={input}
                    placeholder={
                        online
                            ? "Type a message (online)…"
                            : "Type a message (offline)…"
                    }
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e =>
                        e.key === "Enter" && sendMessage()
                    }
                />
                <button
                    style={styles.button}
                    onClick={sendMessage}
                >
                    Send
                </button>
            </div>
        </div>
    );
}

/* =========================
   Styles
========================= */

const styles = {
    chatContainer: {
        width: "90%",
        maxWidth: "600px",
        height: "80vh",
        backgroundColor: "white",
        borderRadius: "10px",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
    },
    messages: {
        flex: 1,
        padding: "15px",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        scrollBehavior: "smooth",
    },
    messageBubble: {
        maxWidth: "80%",
        padding: "10px 14px",
        borderRadius: "12px",
        fontSize: "15px",
        lineHeight: 1.4,
        whiteSpace: "pre-wrap",
    },
    inputContainer: {
        display: "flex",
        borderTop: "1px solid #ddd",
        padding: "10px",
        gap: "10px",
    },
    input: {
        flex: 1,
        padding: "10px",
        borderRadius: "20px",
        border: "1px solid #ccc",
    },
    button: {
        padding: "10px 20px",
        backgroundColor: "#007bff",
        color: "white",
        borderRadius: "20px",
        border: "none",
        cursor: "pointer",
    },
};
