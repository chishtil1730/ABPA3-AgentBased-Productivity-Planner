'use client';
import React from "react";
import "./SwipeWidgetShell.css";

const SwipeWidgetShell = ({ children }) => {
    return (
        <div className="swipe-shell">
            {children}
        </div>
    );
};

export default SwipeWidgetShell;
