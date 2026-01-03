import { useEffect, useState, useCallback, useRef } from "react";
import { Trash2, Mic, Send,SquareArrowOutUpRight } from "lucide-react";
import Stack from "./Stack";
import "./VoiceNotes.css"
import { startWhisperRecording, stopWhisperRecording } from "./whisperSTT";
import muteSound from "../assets/sounds/MicOfd.mp3";
import unmuteSound from "../assets/sounds/MicOn.mp3";

export default function VoiceNotes() {
    const [micOn, setMicOn] = useState(false);

    const [notes, setNotes] = useState(() => {
        const saved = localStorage.getItem("voice_notes");
        return saved ? JSON.parse(saved) : [];
    });

    const historyRef = useRef({
        past: [],
        future: []
    });

    const [editingId, setEditingId] = useState(null);
    const [selectedId, setSelectedId] = useState(null);
    const [isSending, setIsSending] = useState(false);

    const muteAudioRef = useState(() => new Audio(muteSound))[0];
    const unmuteAudioRef = useState(() => new Audio(unmuteSound))[0];

    useEffect(() => {
        const styleId = "pulsate-animation";
        if (!document.getElementById(styleId)) {
            const style = document.createElement("style");
            style.id = styleId;
            style.textContent = `
                @keyframes pulsate {
                    0%, 100% {
                        box-shadow: 0 0 15px rgba(96, 165, 250, 0.4);
                        transform: scale(1);
                    }
                    50% {
                        box-shadow: 0 0 25px rgba(96, 165, 250, 0.8);
                        transform: scale(1.05);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("voice_notes", JSON.stringify(notes));
    }, [notes]);

    // Keyboard shortcuts for undo/redo
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                undo();
            } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
                e.preventDefault();
                redo();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [notes]);

    async function sendTextToAgentAndAddToKanban(text) {
        setIsSending(true);
        try {
            const res = await fetch(
                "http://localhost:5678/webhook/1f1ab95a-2126-46b2-96e0-20de14b8a199/chat",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ chatInput: text }),
                }
            );

            if (!res.ok) throw new Error("Agent request failed");

            const data = await res.json();
            const taskString = Array.isArray(data)
                ? data[0]?.output || ""
                : data?.output || "";

            if (!taskString) return;

            const tasks = taskString
                .split(/,\s*/g)
                .map(t => t.replace(/\s+/g, " ").trim())
                .filter(Boolean);

            for (let i = 0; i < tasks.length; i++) {
                setTimeout(() => {
                    window.dispatchEvent(
                        new CustomEvent("add-kanban-card", {
                            detail: { title: tasks[i], column: "todo" },
                        })
                    );
                }, i * 50);
            }
        } catch (err) {
            console.error("Agent error:", err);
        } finally {
            setIsSending(false);
        }
    }

    const updateNotesWithHistory = useCallback((newNotes) => {
        historyRef.current.past.push([...notes]);
        historyRef.current.future = [];
        setNotes(newNotes);
    }, [notes]);

    const undo = () => {
        if (historyRef.current.past.length === 0) return;

        const previous = historyRef.current.past.pop();
        historyRef.current.future.push([...notes]);
        setNotes(previous);
    };

    const redo = () => {
        if (historyRef.current.future.length === 0) return;

        const next = historyRef.current.future.pop();
        historyRef.current.past.push([...notes]);
        setNotes(next);
    };

    async function toggleMic() {
        if (!micOn) {
            unmuteAudioRef.currentTime = 0;
            unmuteAudioRef.play();
            await startWhisperRecording();
            setMicOn(true);
        } else {
            muteAudioRef.currentTime = 0;
            muteAudioRef.play();
            setMicOn(false);
            try {
                const text = await stopWhisperRecording();
                if (text?.trim()) {
                    updateNotesWithHistory([
                        ...notes,
                        {
                            id: crypto.randomUUID(),
                            title: "Voice Note",
                            content: text.trim()
                        }
                    ]);
                }
            } catch (err) {
                console.error("Whisper error:", err);
            }
        }
    }

    const deleteNote = (id) => {
        updateNotesWithHistory(notes.filter(n => n.id !== id));
    };

    const cards = notes.map(note => (
        <VoiceNoteCard
            key={note.id}
            note={note}
            isSelected={selectedId === note.id}
            onSelect={() =>
                setSelectedId(prev => prev === note.id ? null : note.id)
            }
            onUpdate={(updated) =>
                setNotes(prev => prev.map(n => n.id === updated.id ? updated : n))
            }
            onEditingChange={(isEditing) =>
                setEditingId(isEditing ? note.id : null)
            }
        />
    ));

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <span style={titleStyle}>Voice Notes</span>

                <div style={actionGroupStyle}>
                    {notes.length > 0 && (
                        <>
                            {/* SEND BUTTON */}
                            <button
                                onClick={(e) => {
                                    const noteToUse = selectedId
                                        ? notes.find(n => n.id === selectedId)
                                        : notes[notes.length - 1];

                                    if (!noteToUse) return;

                                    if (e.ctrlKey || e.metaKey) {
                                        window.dispatchEvent(
                                            new CustomEvent("add-flow-node", {
                                                detail: {
                                                    title: noteToUse.title,
                                                    content: noteToUse.content
                                                }
                                            })
                                        );
                                        return;
                                    }

                                    sendTextToAgentAndAddToKanban(noteToUse.content);
                                }}
                                style={sendButtonStyle(isSending)}
                                title="Click: Send to agent • Ctrl/Cmd+Click: Add to Flow"
                                disabled={isSending}
                            >
                                <SquareArrowOutUpRight size={16} />
                            </button>

                            <button
                                onClick={() =>
                                    deleteNote(notes[notes.length - 1].id)
                                }
                                style={deleteButtonStyle}
                                title="Delete top card"
                            >
                                <Trash2 size={16} />
                            </button>
                        </>
                    )}

                    <button onClick={toggleMic} style={micButtonStyle(micOn)}>
                        <Mic size={20} color="white" />
                    </button>
                </div>
            </div>

            <div style={{ flex: 1, position: "relative" }}>
                {notes.length === 0 ? (
                    <div style={emptyStateStyle}>
                        <div style={emptyIconStyle}>🎙️</div>
                        <div style={emptyTextStyle}>Record to add notes</div>
                    </div>
                ) : (
                    <Stack
                        cards={cards}
                        randomRotation
                        sensitivity={30}
                        pauseOnHover
                        mobileClickOnly={Boolean(editingId)}
                    />
                )}
            </div>
        </div>
    );
}

function VoiceNoteCard({ note, isSelected, onSelect, onUpdate, onEditingChange }) {
    const [editingTitle, setEditingTitle] = useState(false);
    const [editingContent, setEditingContent] = useState(false);

    const isEditing = editingTitle || editingContent;

    useEffect(() => {
        onEditingChange(isEditing);
        return () => onEditingChange(false);
    }, [isEditing]);

    const stopTrigger = (e) => e.stopPropagation();

    return (
        <div
            style={{
                ...cardStyle,
                border: isSelected ? "2px solid rgba(96, 165, 250, 0.6)" : "2px solid transparent",
                boxShadow: isSelected ? "0 0 20px rgba(96, 165, 250, 0.3)" : "none"
            }}
            onClick={(e) => {
                e.stopPropagation();
                onSelect();
            }}
        >
            {editingTitle ? (
                <input
                    autoFocus
                    value={note.title}
                    onChange={(e) =>
                        onUpdate({ ...note, title: e.target.value })
                    }
                    onBlur={() => setEditingTitle(false)}
                    onClick={stopTrigger}
                    style={titleInputStyle}
                />
            ) : (
                <div
                    style={cardTitleStyle}
                    onClick={(e) => {
                        e.stopPropagation();
                        setEditingTitle(true);
                    }}
                >
                    {note.title}
                </div>
            )}

            {editingContent ? (
                <textarea
                    autoFocus
                    value={note.content}
                    onChange={(e) =>
                        onUpdate({ ...note, content: e.target.value })
                    }
                    onBlur={() => setEditingContent(false)}
                    onClick={stopTrigger}
                    style={contentInputStyle}
                />
            ) : (
                <div
                    style={cardTextStyle}
                    onClick={(e) => {
                        e.stopPropagation();
                        setEditingContent(true);
                    }}
                >
                    {note.content}
                </div>
            )}
        </div>
    );
}



const containerStyle = {
    width: 300,
    height: 200,
    padding: 16,
    borderRadius: 26,
    background: "rgba(17, 18, 22, 0.6)",
    backdropFilter: "blur(16px) saturate(180%)",
    WebkitBackdropFilter: "blur(16px) saturate(180%)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    boxShadow: `
        inset 0 1px 1px rgba(255, 255, 255, 0.05),
        0 10px 30px rgba(0, 0, 0, 0.4)
    `,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    color: "#F4F4F5",
    fontFamily: "Epilogue",
    overflow: "hidden"
};

const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
};

const titleStyle = {
    fontSize: "18px",
    fontWeight: 600,
    letterSpacing: "-0.02em"
};

const actionGroupStyle = {
    display: "flex",
    alignItems: "center",
    gap: 8
};

const deleteButtonStyle = {
    width: 40,
    height: 40,
    borderRadius: "50%",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    cursor: "pointer",
    background: "rgba(255, 59, 59, 0.15)",
    color: "#ff4d4d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(4px)",
    padding: 0,
    transition: "all 0.2s ease",
    transform: "scale(1)",
};

const sendButtonStyle = (isSending) => ({
    width: 40,
    height: 40,
    borderRadius: "50%",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    cursor: isSending ? "not-allowed" : "pointer",
    background: "rgba(59, 130, 246, 0.15)",
    color: "#60a5fa",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(4px)",
    padding: 0,
    transition: "all 0.2s ease",
    transform: "scale(1)",
    opacity: isSending ? 0.8 : 1,
    animation: isSending ? "pulsate 1.5s ease-in-out infinite" : "none",
});

const micButtonStyle = (on) => ({
    width: 40,
    height: 40,
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",

    background: on
        ? "rgba(255, 59, 59, 0.9)"
        : "rgba(255, 255, 255, 0.1)",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    /* Smooth base transition */
    transition: "background 0.25s ease, transform 0.25s ease",

    /* 🎤 Recording animation */
    animation: on ? "mic-breathe 1.4s ease-in-out infinite" : "none",

    padding: 0
});

const cardStyle = {
    width: "100%",
    height: "100%",
    padding: 16,
    borderRadius: 18,
    background:
        "linear-gradient(180deg, rgba(25,25,25,0.95), rgba(15,15,15,0.95))",
    display: "flex",
    flexDirection: "column",
    gap: 8
};

const cardTitleStyle = {
    fontSize: 12,
    opacity: 0.6,
    cursor: "text"
};

const cardTextStyle = {
    fontSize: 13,
    lineHeight: 1.4,
    overflow: "hidden",
    cursor: "text"
};

const titleInputStyle = {
    fontSize: 12,
    background: "transparent",
    border: "none",
    color: "white",
    outline: "none"
};

const contentInputStyle = {
    fontSize: 13,
    lineHeight: 1.4,
    background: "transparent",
    border: "none",
    color: "white",
    outline: "none",
    resize: "none",
    flex: 1
};

const emptyStateStyle = {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    opacity: 0.6,
    pointerEvents: "none"
};

const emptyIconStyle = {
    fontSize: 28
};

const emptyTextStyle = {
    fontSize: 13,
    letterSpacing: "0.01em"
};