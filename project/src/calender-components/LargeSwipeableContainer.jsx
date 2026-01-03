import React, { useState, useRef } from 'react';
import UpcomingPanel from "./UpcomingPanel";
import MailWidget from "./MailWidget";

/**
 * Dummy Component for Slide B
 */


const LargeSwipeableContainer = () => {
    // Start at index 1 (The first real slide - UpcomingPanel)
    const [currentIndex, setCurrentIndex] = useState(1);
    const [dragOffset, setDragOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [transitionEnabled, setTransitionEnabled] = useState(true);
    const startX = useRef(null);

    const VISUAL_WIDTH = 442;
    const VISUAL_HEIGHT = 232;
    const THRESHOLD = 50;

    // View data: A is UpcomingPanel, B is DummyComponent
    // Array: [Clone B, Real A, Real B, Clone A]
    const views = [
        { id: 'B-clone', type: 'B' },
        { id: 'A', type: 'A' },
        { id: 'B', type: 'B' },
        { id: 'A-clone', type: 'A' },
    ];

    const handleStart = (clientX) => {
        setTransitionEnabled(true);
        setIsDragging(true);
        startX.current = clientX;
    };

    const handleMove = (clientX) => {
        if (!isDragging || startX.current === null) return;
        setDragOffset(clientX - startX.current);
    };

    const handleEnd = () => {
        if (!isDragging) return;

        if (dragOffset < -THRESHOLD) {
            setCurrentIndex((prev) => prev + 1);
        } else if (dragOffset > THRESHOLD) {
            setCurrentIndex((prev) => prev - 1);
        }

        setIsDragging(false);
        setDragOffset(0);
        startX.current = null;
    };

    const handleTransitionEnd = () => {
        // Teleport logic for seamless looping
        if (currentIndex === 0) {
            setTransitionEnabled(false);
            setCurrentIndex(2);
        } else if (currentIndex === 3) {
            setTransitionEnabled(false);
            setCurrentIndex(1);
        }
    };

    const containerStyle = {
        width: `442px`,
        height: `232px`,
        overflow: 'hidden',
        position: 'relative',
        bottom: 60,
        right: 15,
        /*bottom:0,
        right:0,*/
        borderRadius: '24px',
        touchAction: 'none',
        userSelect: 'none',
        cursor: isDragging ? 'grabbing' : 'grab',
        margin: '0 auto',
    };

    const sliderStyle = {
        display: 'flex',
        width: `${views.length * 100}%`,
        height: '100%',
        transition: isDragging || !transitionEnabled ? 'none' : 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: `translateX(calc(-${currentIndex * (100 / views.length)}% + ${dragOffset}px))`,
    };

    const slideWrapperStyle = {
        width: `${VISUAL_WIDTH}px`,
        height: '100%',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    };

    return (
        <div
            style={containerStyle}
            onTouchStart={(e) => handleStart(e.touches[0].clientX)}
            onTouchMove={(e) => handleMove(e.touches[0].clientX)}
            onTouchEnd={handleEnd}
            onMouseDown={(e) => handleStart(e.clientX)}
            onMouseMove={(e) => handleMove(e.clientX)}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
        >
            <div style={sliderStyle} onTransitionEnd={handleTransitionEnd}>
                {views.map((view, i) => (
                    <div key={`${view.id}-${i}`} style={slideWrapperStyle}>
                        {view.type === 'A' ? (
                            <UpcomingPanel />
                        ) : (
                            <MailWidget/>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LargeSwipeableContainer;