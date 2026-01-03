import { useEffect, useState, useRef } from "react";
import { CalendarData } from "./CalendarContext";
import "./UpcomingPanel.css";
import Silk from "../assets/backgrounds/Silk";
import { isVoiceAssistantIdle } from "../voice-assistant/IntegratedContainer";

/* =========================================================
   COMPONENT
========================================================= */

export default function UpcomingPanel() {
    const isIdle = isVoiceAssistantIdle();

    const today = new Date();
    const month = today.toLocaleString("default", { month: "short" });
    const weekday = today.toLocaleString("default", { weekday: "long" });

    const [manualRefreshing, setManualRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const silkRef = useRef(null);
    const [silkSnapshot, setSilkSnapshot] = useState(null);
    const captureIntervalRef = useRef(null);
    const [showSnapshot, setShowSnapshot] = useState(false);

    const MONTH_COLORS = {
        0: "#505867",
        1: "#9E8FBF",
        2: "#8FBFA8",
        3: "#7FB3A6",
        4: "#9dc865",
        5: "#7BA6A6",
        6: "#6F9CA6",
        7: "#8FA6B0",
        8: "#9FA6A0",
        9: "#A68F8F",
        10: "#9A8FA6",
        11: "#8F9AA6",
    };

    const silkColor = MONTH_COLORS[today.getMonth()];

    /* ===============================
       SNAPSHOT CAPTURE (IDLE)
    =============================== */

    useEffect(() => {
        if (!isIdle) return;

        const captureFrame = () => {
            if (silkRef.current?.captureSnapshot) {
                const snapshot = silkRef.current.captureSnapshot();
                if (snapshot && snapshot.length > 1000) {
                    setSilkSnapshot(snapshot);
                }
            }
        };

        captureIntervalRef.current = setInterval(captureFrame, 100);

        return () => clearInterval(captureIntervalRef.current);
    }, [isIdle]);

    /* ===============================
       FADE TRANSITION
    =============================== */

    useEffect(() => {
        setShowSnapshot(!isIdle);
    }, [isIdle]);

    useEffect(() => {
        if (!isLoading && manualRefreshing) {
            setManualRefreshing(false);
        }
    }, [isLoading, manualRefreshing]);

    /* ===============================
       HELPERS
    =============================== */

    const formatTime = (event) => {
        const start = event.start?.dateTime || event.start?.date;
        const end = event.end?.dateTime || event.end?.date;
        if (!start || !end) return "All day";

        return `${new Date(start).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        })} – ${new Date(end).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        })}`;
    };

    const getEventDay = (event) => {
        const start = event.start?.dateTime || event.start?.date;
        const eventDate = new Date(start);

        if (eventDate.toDateString() === today.toDateString()) return "Today";

        return eventDate.toLocaleString("default", {
            weekday: "short",
            month: "short",
            day: "numeric",
        });
    };

    /* ===============================
       RENDER
    =============================== */

    return (
        <div className="Full-Comp upcoming-root">
            <div className="upcoming-wrapper">
                <CalendarData range="week" autoRefresh={1000}>
                    {({ events, loading, refresh }) => {
                        const upcoming = events.slice(0, 2);

                        const handleManualRefresh = () => {
                            setManualRefreshing(true);
                            refresh();
                        };

                        return (
                            <>
                                {/* 🔑 CACHE EVENTS FOR AGENTS (MUST BE RENDERED) */}
                                <CacheUpcomingEvents events={events} />

                                <div className={`upcoming-panel ${manualRefreshing ? "loading" : ""}`}>
                                    {/* LEFT DATE CARD */}
                                    <div className="date-card">
                                        <div className="date-bg">
                                            <div
                                                style={{
                                                    position: "absolute",
                                                    inset: 0,
                                                    opacity: isIdle ? 1 : 0,
                                                    transition: "opacity 0.6s ease-in-out",
                                                }}
                                            >
                                                <Silk
                                                    ref={silkRef}
                                                    speed={5}
                                                    scale={1}
                                                    color={silkColor}
                                                    noiseIntensity={1.5}
                                                    rotation={0}
                                                />
                                            </div>

                                            {silkSnapshot && (
                                                <img
                                                    src={silkSnapshot}
                                                    alt="Silk snapshot"
                                                    style={{
                                                        position: "absolute",
                                                        inset: 0,
                                                        width: "100%",
                                                        height: "100%",
                                                        objectFit: "cover",
                                                        opacity: showSnapshot ? 1 : 0,
                                                        transition: "opacity 0.6s ease-in-out",
                                                        pointerEvents: "none",
                                                    }}
                                                />
                                            )}
                                        </div>

                                        <div className="date-overlay" />

                                        <div className="date-content">
                                            <div className="date-month">{month}</div>
                                            <div className="date-day">{today.getDate()}</div>
                                            <div className="date-sub">{weekday}</div>
                                            <div className="date-meta">
                                                {manualRefreshing ? "Refreshing…" : `${events.length} events`}
                                            </div>
                                        </div>
                                    </div>

                                    {/* RIGHT EVENTS */}
                                    <div className="events">
                                        <div className="events-header">
                                            <div className="events-title">UPCOMING</div>

                                            <button
                                                className={`refresh-btn ${manualRefreshing ? "is-spinning" : ""}`}
                                                onClick={handleManualRefresh}
                                                disabled={manualRefreshing}
                                                aria-label="Refresh Calendar"
                                            >
                                                <svg
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    style={{ width: '1.2rem', height: '1.2rem' }}
                                                >
                                                    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                                                    <path d="M21 3v5h-5" />
                                                </svg>
                                            </button>
                                        </div>

                                        {upcoming.length === 0 && (
                                            <div className="event-time">
                                                {loading ? "Loading…" : "No upcoming events"}
                                            </div>
                                        )}

                                        {upcoming.map((event, i) => (
                                            <div className="event" key={event.id}>
                                            <span
                                                className={`event-bar ${i === 0 ? "green" : "yellow"}`}
                                            />

                                                <div className="event-info">
                                                    <div className="event-title">
                                                        {event.summary || "Task"}
                                                    </div>

                                                    <div className="event-day">
                                                        {getEventDay(event)}
                                                    </div>

                                                    <div className="event-time">
                                                        {formatTime(event)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        );
                    }}
                </CalendarData>
            </div>
        </div>
    );

}

/* =========================================================
   EXPORT: AGENT-SAFE SUMMARY READER (NO PARAMS)
========================================================= */

export function getUpcomingTaskSummary() {
    const saved = localStorage.getItem("upcoming-events");
    if (!saved) return null;

    const events = JSON.parse(saved);
    if (!events.length) return null;

    const event = events[0];
    const title = event.summary || "an upcoming task";

    const start = event.start?.dateTime || event.start?.date;
    const time = start
        ? new Date(start).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        })
        : "sometime today";

    return { title, time };
}
function CacheUpcomingEvents({ events }) {
    useEffect(() => {
        if (!events) return;
        localStorage.setItem("upcoming-events", JSON.stringify(events));
    }, [events]);

    return null;
}
