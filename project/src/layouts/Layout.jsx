import React, { useState, useRef, useEffect } from "react";
import "./Layout.css";

import LayoutBackground from "../assets/backgrounds/LayoutBackground";
import FlowCanvasContainer from "../flowchart_components/FlowCanvasContainer";
import UpcomingPanelContainer from "../calender-components/UpcomingPanelContainer";
import TaskTrackerContainer from "../calender-components/TaskTrackerContianer";
import KanbanWidget from "../kanban_components/KanbanWidget";
import IntegratedContainer, {
    useVoiceAssistantIdle,
} from "../voice-assistant/IntegratedContainer";
import Prism from "../voice-assistant/Prism"
import TimeWidgetContainer from "../calender-components/TimeWidgetContainer";

// 🔹 Fallback static image (prevents black frame)
import bgImage from "../assets/backgrounds/gradientbg.png";
import SwipeableContainer from "../calender-components/SwipeableContainer";

const Layout = ({ animationComplete = true }) => {
    const [snapshot, setSnapshot] = useState(null);

    const isIdle = useVoiceAssistantIdle();
    const bgRef = useRef(null);

    /**
     * 🔹 Capture snapshot ONCE when leaving idle
     * IMPORTANT: Do NOT clear snapshot on idle
     * Snapshot is cached memory, not a toggle
     */
    useEffect(() => {
        if (!isIdle && bgRef.current) {
            const snap = bgRef.current.captureSnapshot();
            if (snap) {
                setSnapshot(snap);
            }
        }
    }, [isIdle]);

    return (
        <div className="layout-root">
            {/* =====================================================
               BACKGROUND LAYER (ALWAYS EXACTLY ONE)
               ===================================================== */}

            {/* 🔹 STATIC SNAPSHOT / FALLBACK (WHEN NOT IDLE) */}
            {/*{!isIdle && (
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        zIndex: 0,
                        backgroundImage: `url(${snapshot || bgImage})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                    }}
                />
            )}

             🔹 LIVE WEBGL BACKGROUND (ONLY WHEN IDLE)
            {isIdle && (
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        zIndex: 0,
                    }}
                >
                    <LayoutBackground ref={bgRef} />
                </div>
            )}*/}
            <div
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",  // Use vw to force full width immediately
                    height: "100vh", // Use vh to force full height immediately
                    zIndex: 0,
                    pointerEvents:"auto",
                    overflow: "hidden" // Prevents internal canvas bleeding
                }}
            >
                <LayoutBackground />
            </div>
            {/* =====================================================
               FOREGROUND CONTENT
               ===================================================== */}
            <div className="bento-container">
                <div className="Flowchart">
                    <FlowCanvasContainer />
                </div>

                <div className="RightPanel">
                    <UpcomingPanelContainer />
                </div>

                <div className="LeftPanel">
                    <TaskTrackerContainer />
                </div>

                <div className="Kanban">
                    <KanbanWidget parentAnimationComplete={animationComplete} />
                </div>

                <div className="Voice">
                    <IntegratedContainer />
                </div>

                <div style={{
                    zIndex:20,
                    pointerEvents:"auto"
                }}>
                    <SwipeableContainer/>
                </div>
            </div>
        </div>
    );
};

export default Layout;
