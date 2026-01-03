import React, { useState, useEffect } from 'react';
import {CustomKanban, getKanbanMetrics} from '../kanban_components/CustomKanban';
import "./TaskTracker.css"
import DatePanel from "./DatePanel";

const TaskTracker = () => {
    const [metrics, setMetrics] = useState({ percentage: 0, remainingTasks: 0 });

    const updateMetrics = () => {
        const saved = localStorage.getItem("kanban-cards");
        if (saved) {
            const cards = JSON.parse(saved);
            setMetrics(getKanbanMetrics(cards, 100));
        }
    };

    useEffect(() => {
        updateMetrics();
        const interval = setInterval(updateMetrics, 1000);
        return () => clearInterval(interval);

    }, []);


    const now = new Date();

    const daysInMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0
    ).getDate();

    const dayOfMonth = now.getDate();

    const monthProgress = Math.round((dayOfMonth / daysInMonth) * 100);



    return (
        <div
            style={{
                position: "fixed",
                bottom: 9,
                right: 2,
                zIndex: 40,
            }}
        >
            {/* STACK CONTAINER */}
            <div className="flex flex-col gap-4">

                {/* TASK TRACKER CARD */}
                {/* Replace the inner "TASK TRACKER CARD" div with this */}
                <div className="progress-card">
                    {/* Header */}
                    <div className="progress-header">
                        <div>
                            <h2 className="header-title">Project Progress</h2>
                            <div className="progress-value">
                                {metrics.percentage}
                                <span className="progress-percent">%</span>
                            </div>
                        </div>

                        <div className="tasks-left">
                            {metrics.remainingTasks > 0
                                ? `${metrics.remainingTasks} tasks left`
                                : "Completed 🎉"}
                        </div>
                    </div>

                    {/* Progress Row (Tasks) */}
                    <div className="progress-row">
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{ width: `${metrics.percentage}%`, "--progress": `${metrics.percentage}%` }}
                            />
                        </div>
                        <div className="progress-due">Goal 100%</div>
                    </div>

                    {/* Month Progress Row (Time) */}
                    <div className="progress-row">
                        <div className="progress-bar">
                            <div
                                className="progress-fill time"
                                style={{ "--progress": `${monthProgress}%`, width: `${monthProgress}%` }}
                            />
                        </div>
                        <div className="progress-due">
                            {dayOfMonth}/{daysInMonth} days
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

};

export default TaskTracker;
