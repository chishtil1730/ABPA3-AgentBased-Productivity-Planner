'use client';

import React, { useEffect, useState } from "react";
import "./TimeWidget.css";

import MonumentImage from "../assets/backgrounds/minar.png";
import { RollingDigit } from "../assets/ui/RollingDigit.tsx";

const TimeWidget = ({
                        country = "India",
                        utc = "UTC   +5:30",
                        timeZone = "Asia/Kolkata",
                    }) => {
    const [time, setTime] = useState({ h: "00", m: "00" });

    const [isHovered, setIsHovered] = useState(false);


    useEffect(() => {
        const updateTime = () => {
            const now = new Date();

            const formatter = new Intl.DateTimeFormat("en-US", {
                timeZone,
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            });

            const [h, m] = formatter.format(now).split(":");
            setTime({ h, m });
        };

        updateTime();
        const id = setInterval(updateTime, 1000);
        return () => clearInterval(id);
    }, [timeZone]);

    const hourDigits = time.h.split("").map(Number);
    const minuteDigits = time.m.split("").map(Number);

    return (
        <div className="time-widget">
            <div className="time-content">
                <div className="time-header">
                    <span className="country">{country}</span>
                    <span className="utc-pill">UTC  +5:30</span>
                </div>

                <div
                    className="time-display"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <div className="time-row">
                        {hourDigits.map((d, i) => (
                            <RollingDigit key={`h-${i}`} value={d} hovered={isHovered} />
                        ))}
                    </div>

                    <div className="time-row">
                        {minuteDigits.map((d, i) => (
                            <RollingDigit key={`m-${i}`} value={d} hovered={isHovered} />
                        ))}
                    </div>
                </div>

            </div>

            <div className="monument-wrapper">
                <img src={MonumentImage} alt="Monument" />
            </div>

            <div className="favorite">⭐</div>
        </div>
    );
};

export default TimeWidget;
