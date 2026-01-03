import { useState } from "react";
import CustomKanban from "./CustomKanban";
import GooeyNav from "./GooeyNav";
import "./KanbanWidget.css"
import {speakDailySummary} from "../extensions/speakDailySummary";

const COLLAPSED_SIZE = {
    width: 500,
    height: 430,
};

const EXPANDED_SIZE = {
    width: 1200,
    height: 650,
};

export default function KanbanWidget({ parentAnimationComplete = true }) {
    const [expanded, setExpanded] = useState(false);

    const size = expanded ? EXPANDED_SIZE : COLLAPSED_SIZE;

    const navItems = [
        { label: "Expand" },
        { label: "Contract" },
    ];

    const [processing, setProcessing] = useState(false);


    return (
        <>
            {/* Backdrop Blur */}
            {expanded && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-[2px]"
                    style={{ willChange: "backdrop-filter" }}
                />
            )}

            {/* Widget */}
            <div
                style={{
                    width: size.width,
                    height: size.height,
                    transition: "width 0.35s ease, height 0.35s ease",
                    transformOrigin: "top right",
                }}
                className="kanban-widget-shell absolute top-1 right-1 overflow-hidden rounded-3xl border border-white/10 shadow-xl z-[35]"
            >
                {/* Gooey Controls (bottom-left) */}
                <div className="absolute left-3 bottom-3 z-[30] flex flex-col gap-3">
                    {/* 🔊 SUMMARIZE BUTTON */}
                    <button
                        type="button"
                        disabled={processing}
                        onClick={async () => {
                            if (processing) return;

                            setProcessing(true);
                            try {
                                await speakDailySummary(); // waits for Piper TTS
                            } finally {
                                setProcessing(false);
                            }
                        }}
                        className={`summarize-btn ${processing ? "processing" : ""}`}
                    >
                        {processing ? "Summarizing…" : "Today's Tasks"}
                    </button>

                    {/* Gooey Expand / Contract */}
                    <GooeyNav
                        items={navItems}
                        initialActiveIndex={expanded ? 0 : 1}
                        particleCount={15}
                        particleDistances={[90, 10]}
                        particleR={100}
                        animationTime={600}
                        timeVariance={300}
                        colors={[1, 3, 2, 3, 4, 2, 1, 2]}
                        parentAnimationComplete={parentAnimationComplete}
                        onItemSelect={(index) => {
                            setExpanded(index === 0);
                        }}
                    />
                </div>

                {/* Kanban */}
                <div className="h-full w-full overflow-hidden bg-transparent">
                    <CustomKanban
                        visibleColumns={
                            expanded
                                ? ["backlog", "todo", "doing", "done"]
                                : ["todo", "doing"]
                        }
                    />
                </div>
            </div>
        </>
    );

}