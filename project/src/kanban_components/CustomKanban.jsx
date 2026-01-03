import React, { useState, useEffect } from "react";
import { FiPlus, FiTrash } from "react-icons/fi";
import { motion } from "framer-motion";
import { FaFire } from "react-icons/fa";
import "./CustomKanban.css"
import backgroundImage from "../assets/backgrounds/bg5.png";



export const CustomKanban = ({ visibleColumns }) => {
    return (
         <div className="h-full w-full bg-transparent text-neutral-50 m-0 overflow-hidden">
        <Board visibleColumns={visibleColumns} />
        </div>
    );
};
export const getKanbanMetrics = (cards = [], targetPercentage = 100) => {
    if (!cards || cards.length === 0) return { percentage: 0, remainingPoints: 0 };

    const totalCards = cards.length;
    const completedCount = cards.filter(c => c.column === "done").length;
    const inProgressCount = cards.filter(c => c.column === "doing").length;

    // 1. Current Progress Calculation
    const currentPoints = completedCount + (inProgressCount / 3);
    const percentage = Math.round((currentPoints / totalCards) * 100);

    // 2. Goal Calculation
    // Target points needed = (Target% / 100) * TotalCards
    const targetPoints = (targetPercentage / 100) * totalCards;
    const pointsNeeded = targetPoints - currentPoints;

    // We use Math.ceil because you can't complete half a task to hit a goal
    const remainingTasks = Math.max(0, Math.ceil(pointsNeeded));

    return {
        percentage,
        remainingTasks,
        totalCards
    };
};



const Board = ({ visibleColumns }) => {
    // --- Load initial cards from localStorage ---
    const [history, setHistory] = useState(() => {
        const saved = localStorage.getItem("kanban-cards");

        // ALWAYS ensure history is: [cardsArray]
        return saved ? [JSON.parse(saved)] : [DEFAULT_CARDS];
    });

    const [historyIndex, setHistoryIndex] = useState(0);

    // current cards
    const cards = history[historyIndex] ?? [];

    // --- SAVE ONLY CURRENT CARDS (NOT ENTIRE HISTORY) ---
    useEffect(() => {
        localStorage.setItem("kanban-cards", JSON.stringify(cards));
    }, [cards]);

    // --- updateCards must add new cards into history properly ---
    const updateCards = (newCardsOrFn) => {
        const newCards =
            typeof newCardsOrFn === "function"
                ? newCardsOrFn(cards)
                : newCardsOrFn;

        const updatedHistory = [
            ...history.slice(0, historyIndex + 1),
            newCards,
        ];

        setHistory(updatedHistory);
        setHistoryIndex(updatedHistory.length - 1);
    };

    // Undo / Redo
    const undo = () => {
        setHistoryIndex((i) => Math.max(0, i - 1));
    };
    const redo = () => {
        setHistoryIndex((i) => Math.min(history.length - 1, i + 1));
    };


    //Add from FlowChart:
    useEffect(() => {
        const handler = (e) => {
            const { title, column } = e.detail;
            if (!title || !column) return;

            const newCard = {
                id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
                title,
                column,
                subProgress: 0,
                progressTimestamps: [],
                _createdAtDone: column === "done",
            };

            updateCards(prev => [...prev, newCard]);
        };

        window.addEventListener("add-kanban-card", handler);
        return () => window.removeEventListener("add-kanban-card", handler);
    }, [updateCards]);


    useEffect(() => {
        const handler = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "z") undo();
            if ((e.ctrlKey || e.metaKey) && e.key === "y") redo();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [historyIndex, history]);

    const ALL_COLUMNS = [
        { title: "Backlog", column: "backlog", headingColor: "text-white" },
        { title: "TODO", column: "todo", headingColor: "text-[#FFD801]" },
        { title: "In progress", column: "doing", headingColor: "text-[#5CD1FA]" },
        { title: "Complete", column: "done", headingColor: "text-[#46cb18]" },
    ];

    const columnsToRender = visibleColumns
        ? ALL_COLUMNS.filter(col => visibleColumns.includes(col.column))
        : ALL_COLUMNS;


    return (
        <div className="kanban-bg flex h-full w-full gap-3 overflow-hidden p-6">
            {columnsToRender.map(col => (
                <Column
                    key={col.column}
                    title={col.title}
                    column={col.column}
                    headingColor={col.headingColor}
                    cards={cards}
                    setCards={updateCards}
                />
            ))}

            {/* Burn barrel only makes sense when all columns are visible */}
            {(!visibleColumns || visibleColumns.includes("done")) && (
                <BurnBarrel cards={cards} setCards={updateCards} />
            )}
        </div>
    );

};


const Column = ({ title, headingColor, cards, column, setCards }) => {
    const [active, setActive] = useState(false);
    // Track which card is currently hovered within this column
    const [hoveredCardId, setHoveredCardId] = useState(null);

    useEffect(() => {
        const updateProgress = (e) => {
            const { id, subProgress, progressTimestamps } = e.detail;
            const updated = cards.map((c) =>
                c.id === id ? { ...c, subProgress, progressTimestamps } : c
            );
            setCards(updated);
        };
        window.addEventListener("update-progress", updateProgress);
        return () => window.removeEventListener("update-progress", updateProgress);
    }, [cards, setCards]);

    useEffect(() => {
        const autoMove = (e) => {
            const { id } = e.detail;
            const updated = cards.map((c) => (c.id === id ? { ...c, column: "done" } : c));
            setCards(updated);
        };
        window.addEventListener("move-to-complete", autoMove);
        return () => window.removeEventListener("move-to-complete", autoMove);
    }, [cards, setCards]);

    useEffect(() => {
        const update = (e) => {
            const { id, value } = e.detail;
            const newCards = cards.map((c) => (c.id === id ? { ...c, title: value } : c));
            setCards(newCards);
        };
        window.addEventListener("edit-card", update);
        return () => window.removeEventListener("edit-card", update);
    }, [cards, setCards]);

    const handleDragStart = (e, card) => {
        e.dataTransfer.setData("cardId", card.id);
    };

    const handleDragEnd = (e) => {
        const cardId = e.dataTransfer.getData("cardId");
        setActive(false);
        clearHighlights();
        const indicators = getIndicators();
        const { element } = getNearestIndicator(e, indicators);
        const before = element?.dataset?.before || "-1";
        if (before !== cardId) {
            let copy = [...cards];
            let cardToTransfer = copy.find((c) => c.id === cardId);
            if (!cardToTransfer) return;
            cardToTransfer = { ...cardToTransfer, column };
            copy = copy.filter((c) => c.id !== cardId);
            const moveToBack = before === "-1";
            if (moveToBack) {
                copy.push(cardToTransfer);
            } else {
                const insertAtIndex = copy.findIndex((el) => el.id === before);
                if (insertAtIndex === -1) {
                    copy.push(cardToTransfer);
                } else {
                    copy.splice(insertAtIndex, 0, cardToTransfer);
                }
            }
            setCards(copy);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        highlightIndicator(e);
        setActive(true);
    };

    const clearHighlights = (els) => {
        const indicators = els || getIndicators();
        indicators.forEach((i) => {
            i.style.opacity = "0";
        });
    };

    const highlightIndicator = (e) => {
        const indicators = getIndicators();
        clearHighlights(indicators);
        const el = getNearestIndicator(e, indicators);
        if (el && el.element) el.element.style.opacity = "1";
    };

    const getNearestIndicator = (e, indicators) => {
        const DISTANCE_OFFSET = 50;
        if (!indicators || indicators.length === 0) {
            return { offset: 0, element: { dataset: { before: "-1" }, style: {} } };
        }
        return indicators.reduce(
            (closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = e.clientY - (box.top + DISTANCE_OFFSET);
                if (offset < 0 && offset > closest.offset) {
                    return { offset, element: child };
                }
                return closest;
            },
            {
                offset: Number.NEGATIVE_INFINITY,
                element: indicators[indicators.length - 1],
            }
        );
    };

    const getIndicators = () => {
        return Array.from(document.querySelectorAll(`.drop-indicator[data-column="${column}"]`));
    };

    const handleDragLeave = () => {
        clearHighlights();
        setActive(false);
    };

    const filteredCards = cards.filter((c) => c.column === column);

    return (
        <div className="w-56 shrink-0">
            <div className="mb-3 flex items-center justify-between">
                <h3 className={`font-heading font-medium ${headingColor}`}>
                    <motion.h3
                        whileHover={{ scale: 1.08, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 12 }}
                        className={`font-heading font-medium cursor-pointer ${headingColor}`}
                    >
                        {title}
                    </motion.h3>
                </h3>
                <span className="font-indicator rounded text-sm text-neutral-400">{filteredCards.length}</span>
            </div>

            <div
                onDrop={handleDragEnd}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`h-full w-full transition-all duration-200 ${
                    active
                        ? "bg-neutral-800/50 scale-[1.01] border border-neutral-700"
                        : "bg-neutral-800/0 scale-100 border border-transparent"
                }`}
            >
                {filteredCards.map((c) => {
                    return (
                        <Card
                            key={c.id}
                            {...c}
                            handleDragStart={handleDragStart}
                            // Track if this card is the one hovered
                            isHovered={hoveredCardId === c.id}
                            // Track if some OTHER card in this column is hovered
                            isAnyHovered={hoveredCardId !== null}
                            onMouseEnter={() => setHoveredCardId(c.id)}
                            onMouseLeave={() => setHoveredCardId(null)}
                        />
                    );
                })}

                <DropIndicator beforeId={null} column={column} />
                <AddCard column={column} setCards={setCards} />
            </div>
        </div>
    );
};

const Card = ({
                  title,
                  id,
                  column,
                  handleDragStart,
                  subProgress = 0,
                  progressTimestamps = [],
                  // Added props for the group hover effect
                  isHovered,
                  isAnyHovered,
                  onMouseEnter,
                  onMouseLeave
              }) => {
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState(title);
    useEffect(() => setValue(title), [title]);

    const isDone = column === "done";
    const isDoing = column === "doing";

    const increaseProgress = () => {
        if (!isDoing) return;
        const next = Math.min(3, subProgress + 1);
        const newTimestamps = next > subProgress ? [...progressTimestamps, Date.now()] : progressTimestamps;
        window.dispatchEvent(
            new CustomEvent("update-progress", {
                detail: { id, subProgress: next, progressTimestamps: newTimestamps },
            })
        );
        if (next === 3) {
            setTimeout(() => {
                window.dispatchEvent(new CustomEvent("move-to-complete", { detail: { id } }));
            }, 300);
        }
    };

    const decreaseProgress = (e) => {
        e.preventDefault();
        if (!isDoing) return;
        const next = Math.max(0, subProgress - 1);
        const newTimestamps = progressTimestamps.slice(0, next);
        window.dispatchEvent(
            new CustomEvent("update-progress", {
                detail: { id, subProgress: next, progressTimestamps: newTimestamps },
            })
        );
    };

    const stopEditing = () => {
        setEditing(false);
        window.dispatchEvent(new CustomEvent("edit-card", { detail: { id, value } }));
    };

    if (editing) {
        return (
            <motion.div layout className="rounded-xl border border-violet-400 bg-violet-400/20 p-2">
                <textarea
                    autoFocus
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onBlur={stopEditing}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            stopEditing();
                        }
                    }}
                    className="font-indicator w-full resize-none bg-transparent text-sm outline-none text-neutral-100"
                />
            </motion.div>
        );
    }

    return (
        <>
            <DropIndicator beforeId={id} column={column} />
            <motion.div
                data-card={id}
                layout
                layoutId={id}
                draggable="true"
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                onContextMenu={decreaseProgress}
                onDoubleClick={increaseProgress}
                onDragStart={(e) => handleDragStart(e, { title, id, column })}
                onClick={(e) => {
                    if (e.detail === 3) setEditing(true);
                }}
                animate={{
                    scale: isHovered ? 1.08 : 1,
                    opacity: isAnyHovered && !isHovered ? 0.7 : 1,
                    filter: isAnyHovered && !isHovered ? "blur(0.85px)" : "blur(0px)",
                }}
                transition={{
                    duration: 0.01,
                    ease: "easeOut"
                }}
                whileTap={{ scale: 0.97 }}
                whileDrag={{ scale: 0.94, opacity: 0.6 }}
                className={`relative cursor-pointer rounded-xl p-3 mb-1 border backdrop-blur-md shadow-md active:cursor-grabbing transition-all overflow-hidden ${
                    isDone
                        ? "border-emerald-400/40 bg-emerald-400/10"
                        : "border-white/10 bg-white/5"
                }`}
            >
                {/* ✨ SHINE LIGHT OVERLAY (visual only) */}
                {/* ✨ ANIMATED LIGHT STREAK (visual only) */}
                <motion.div
                    aria-hidden
                    className="absolute inset-0 pointer-events-none"
                    initial={false}
                    animate={
                        isHovered
                            ? { opacity: 1, x: ["-120%", "120%"] }
                            : { opacity: 0 }
                    }
                    transition={{
                        duration: 0.9,
                        ease: "easeInOut",
                        repeat: isHovered ? Infinity : 0,
                        repeatDelay: 0.6,
                    }}
                    style={{
                        background: `
            linear-gradient(
                120deg,
                transparent 35%,
                rgba(255,255,255,0.28),
                transparent 65%
            )
        `,
                        mixBlendMode: "screen",
                    }}
                />


                <p className="font-indicator text-sm text-neutral-100 relative z-10">
                    {value}
                </p>

                {isDoing && (
                    <div className="flex gap-1 mt-3 relative z-10">
                        {[1, 2, 3].map((n) => {
                            const filled = subProgress >= n;
                            return (
                                <motion.div
                                    key={n}
                                    initial={false}
                                    animate={{
                                        backgroundColor: filled
                                            ? n === 1
                                                ? "rgb(250 204 21)"
                                                : n === 2
                                                    ? "rgb(163 230 53)"
                                                    : "rgb(74 222 128)"
                                            : "rgb(64 64 64)",
                                        width: filled ? "100%" : "0%",
                                    }}
                                    transition={{ duration: 0.35, ease: "easeOut" }}
                                    className="font-indicator h-2 flex-1 rounded-full relative overflow-visible"
                                >
                                    {filled && (
                                        <motion.div
                                            initial={{ scale: 0, opacity: 1 }}
                                            animate={{ scale: 1.8, opacity: 0 }}
                                            transition={{ duration: 0.5, ease: "easeOut" }}
                                            className="absolute inset-0 flex items-center justify-center pointer-events-none"
                                        >
                                            <div className="font-indicator w-2 h-2 bg-white rounded-full shadow-lg" />
                                        </motion.div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {isDone && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.25 }}
                        className="font-indicator mt-2 text-xs text-emerald-300 relative z-10"
                    >
                        ✓ Completed
                    </motion.div>
                )}
            </motion.div>
        </>
    );
};


const DropIndicator = ({ beforeId, column }) => {
    return (
        <div
            data-before={beforeId || "-1"}
            data-column={column}
            className="drop-indicator my-0.5 h-0.5 w-full bg-violet-400 opacity-0"
        />
    );
};

const BurnBarrel = ({ setCards, cards = [] }) => {
    const [active, setActive] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        setActive(true);
    };

    const handleDragLeave = () => {
        setActive(false);
    };

    const handleDrop = (e) => {
        const cardId = e.dataTransfer.getData("cardId");
        if (!cardId) return;
        // safety fallback → no crash even if cards undefined
        const safeCards = Array.isArray(cards) ? cards : [];
        const filtered = safeCards.filter((c) => c.id !== cardId);
        // history-safe state update
        setCards(filtered);
        setActive(false);
    };

    return (
        <motion.div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            animate={
                active
                    ? { scale: 1.05, boxShadow: "0 0 25px rgba(248,113,113,0.4)" }
                    : { scale: 1, boxShadow: "0 0 0 rgba(0,0,0,0)" }
            }
            transition={{ duration: 0.18 }}
            className={`font-indicator mt-10 grid h-56 w-56 shrink-0 place-content-center rounded-2xl border text-3xl ${
                active ? "border-red-800 bg-red-800/20 text-red-500" : "border-neutral-500 bg-neutral-500/20 text-neutral-500"
            }`}
        >
            {active ? <FaFire className="animate-bounce" /> : <FiTrash />}
        </motion.div>
    );
};

const AddCard = ({ column, setCards }) => {
    const [text, setText] = useState("");
    const [adding, setAdding] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!text.trim().length) return;
        const newCard = {
            column,
            title: text.trim(),
            id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`,
            subProgress: 0,
            progressTimestamps: [],
            _createdAtDone: column === "done",
        };
        // setCards accepts an updater function thanks to Board.updateCards implementation
        setCards((pv) => [...pv, newCard]);
        setAdding(false);
        setText("");
    };

    return (
        <>
            {adding ? (
                <motion.form layout onSubmit={handleSubmit}>
          <textarea
              onChange={(e) => setText(e.target.value)}
              value={text}
              autoFocus
              placeholder="Add new task..."
              className="font-indicator w-full rounded border border-violet-400 bg-violet-400/20 p-3 text-sm text-neutral-50 placeholder-violet-300 focus:outline-0"
          />
                    <div className="mt-1.5 flex items-center justify-end gap-1.5">
                        <button
                            onClick={() => {
                                setAdding(false);
                                setText("");
                            }}
                            type="button"
                            className="font-indicator px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-50"
                        >
                            Close
                        </button>
                        <button
                            type="submit"
                            className="font-indicator flex items-center gap-1.5 rounded bg-neutral-50 px-3 py-1.5 text-xs text-neutral-950 transition-colors hover:bg-neutral-300 active:scale-95"
                        >
                            <span>Add</span>
                            <FiPlus />
                        </button>
                    </div>
                </motion.form>
            ) : (
                <motion.button
                    layout
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setAdding(true)}
                    className="font-indicator flex w-full items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-50"
                >
                    <span>Add card</span>
                    <FiPlus />
                </motion.button>
            )}
        </>
    );
};

const DEFAULT_CARDS = [
    { title: "Look into render bug in dashboard", id: "1", column: "backlog" },
    { title: "SOX compliance checklist", id: "2", column: "backlog" },
    { title: "[SPIKE] Migrate to Azure", id: "3", column: "backlog" },
    { title: "Document Notifications service", id: "4", column: "backlog" },
    { title: "Research DB options for new microservice", id: "5", column: "todo" },
    { title: "Postmortem for outage", id: "6", column: "todo" },
    { title: "Sync with product on Q3 roadmap", id: "7", column: "todo" },
    { title: "Refactor context providers to use Zustand", id: "8", column: "doing" },
    { title: "Add logging to daily CRON", id: "9", column: "doing" },
    { title: "Set up DD dashboards for Lambda listener", id: "10", column: "done" },
];

export default CustomKanban;

//Get Current Kanban Tasks:
// ===============================
// EXPORT: Kanban Task Summary
// ===============================
export function getKanbanTaskSummary() {
    const saved = localStorage.getItem("kanban-cards");
    if (!saved) return { todo: null, doing: null };

    const cards = JSON.parse(saved);

    const firstDoing = cards.find(c => c.column === "doing");
    const firstTodo = cards.find(c => c.column === "todo");

    return {
        doing: firstDoing ? firstDoing.title : null,
        todo: firstTodo ? firstTodo.title : null,
    };
}
