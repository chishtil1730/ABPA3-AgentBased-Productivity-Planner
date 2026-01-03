'use client';

import React from "react";
import TimeWidget from "./TimeWidget";
import "./TimeWidgetContainer.css";

const TimeWidgetContainer = ({
                                 country = "India",
                                 utc = "UTC +5:30",
                                 timeZone = "Asia/Kolkata",
                             }) => {
    return (
        <div className="time-widget-container">
            <TimeWidget
                country={country}
                utc={utc}
                timeZone={timeZone}
            />
        </div>
    );
};

export default TimeWidgetContainer;
