import { useMemo } from "react";
import "./DatePanel.css";

export default function DatePanel() {
    const today = new Date();

    const monthName = today.toLocaleString("default", { month: "long" });
    const dayNumber = today.getDate();
    const year = today.getFullYear();
    const month = today.getMonth();

    /* ───────── Weekly data ───────── */
    const weekDays = useMemo(() => {
        const start = new Date(today);
        start.setDate(today.getDate() - today.getDay());

        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            return d;
        });
    }, [today]);

    /* ───────── Month progress ───────── */
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const progress = Math.round((dayNumber / daysInMonth) * 100);

    const isToday = (d) =>
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear();

    return (
        <div className="date-panel-wrapper">
            <div className="date-panel">
                {/* Header */}
                <div className="header">
                    <span className="month">{monthName}</span>
                    <span className="big-date">{dayNumber}</span>
                </div>

                {/* Week */}
                <div className="week">
                    {weekDays.map((date) => (
                        <div key={date.toISOString()} className="day">
              <span className="day-label">
                {date.toLocaleString("default", { weekday: "short" })[0]}
              </span>
                            <span
                                className={`day-number ${
                                    isToday(date) ? "active-day" : ""
                                }`}
                            >
                {date.getDate()}
              </span>
                            <span className="dot" />
                        </div>
                    ))}
                </div>

                {/* Month progress */}
                <div className="month-progress">
                    <div className="progress-text">
                        77% Day 24 of 31
                    </div>

                    <div className="progress-track">
                        <div
                            className="progress-fill"
                            style={{ "--progress": `${progress}%` }}
                        />

                    </div>
                </div>

            </div>
        </div>
    );
}
