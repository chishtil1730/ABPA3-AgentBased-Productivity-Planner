import { useEffect, useState } from "react";
import FlowCanvas from "./FlowCanvas";
import BoardHeader from "./BoardHeader";

/* ------------------ STORAGE KEYS ------------------ */
const BOARDS_KEY = "flow-boards-v1";

/* ------------------ HELPERS ------------------ */
const createBoard = () => ({
    id: crypto.randomUUID(),
    title: "Your Plans",
    storageKey: "flow-board-" + crypto.randomUUID(),
});

const loadBoards = () => {
    try {
        const raw = localStorage.getItem(BOARDS_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

/* ------------------ COMPONENT ------------------ */
export default function CanvasManager() {
    const [boards, setBoards] = useState(() => {
        const loaded = loadBoards();
        return loaded && loaded.length > 0 ? loaded : [createBoard()];
    });
    const [active, setActive] = useState(0);

    /* -------- Persist board registry -------- */
    useEffect(() => {
        localStorage.setItem(BOARDS_KEY, JSON.stringify(boards));
    }, [boards]);

    /* -------- Navigation -------- */
    const prev = () => {
        if (active > 0) setActive(active - 1);
    };

    const next = () => {
        if (active < boards.length - 1) setActive(active + 1);
    };

    /* -------- Add board -------- */
    const addBoard = () => {
        const newBoard = createBoard();
        setBoards(b => [...b, newBoard]);
        setActive(boards.length);
    };

    /* -------- Rename board -------- */
    const updateTitle = (title) => {
        setBoards(b =>
            b.map((board, i) =>
                i === active ? { ...board, title } : board
            )
        );
    };

    /* -------- Delete board (SAFE) -------- */
    const deleteBoard = () => {
        if (boards.length === 1) {
            alert("At least one canvas is required");
            return;
        }

        const boardToDelete = boards[active];

        // Remove canvas data
        localStorage.removeItem(boardToDelete.storageKey);

        // Remove board from registry
        setBoards(b => b.filter((_, i) => i !== active));

        // Fix active index
        setActive(i => Math.max(0, Math.min(i, boards.length - 2)));
    };

    /* -------- Current board -------- */
    const currentBoard = boards[active] || boards[0];

    return (
        <div style={{ width: "100vw", height: "100vh" }}>
            <BoardHeader
                title={currentBoard.title}
                onPrev={prev}
                onNext={next}
                onAdd={addBoard}
                onDelete={deleteBoard}
                onTitleChange={updateTitle}
            />
            {/*
                KEY IS CRITICAL:
                - Forces clean mount per board
                - Prevents shared memory
            */}
            <FlowCanvas
                key={currentBoard.id}
                STORAGE_KEY={currentBoard.storageKey}
            />
        </div>
    );
}