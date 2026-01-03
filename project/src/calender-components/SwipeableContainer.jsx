import React, { useState, useRef } from 'react';
import TimeWidget from './TimeWidget';
import VoiceNotes from "../voice-assistant/VoiceNotes";

const SwipeableContainer = () => {
    // Start at index 1 (The first TimeWidget)
    const [currentIndex, setCurrentIndex] = useState(1);
    const [dragOffset, setDragOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [transitionEnabled, setTransitionEnabled] = useState(true);
    const startX = useRef(null);

    const WIDTH = 300;
    const HEIGHT = 200;
    const THRESHOLD = 50;

    // View data: A is your TimeWidget, B is a placeholder
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
        width: `${WIDTH}px`,
        height: `${HEIGHT}px`,
        overflow: 'hidden',
        position: 'absolute',
        top:230,
        right:515,
        borderRadius: '28px',
        touchAction: 'none',
        userSelect: 'none',
        cursor: isDragging ? 'grabbing' : 'grab',
    };

    const sliderStyle = {
        display: 'flex',
        width: `${views.length * 100}%`,
        height: '100%',
        transition: isDragging || !transitionEnabled ? 'none' : 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: `translateX(calc(-${currentIndex * (100 / views.length)}% + ${dragOffset}px))`,
    };

    const slideWrapperStyle = {
        width: `${WIDTH}px`,
        height: '100%',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    };

    const placeholderStyle = {
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, rgba(40, 40, 40, 0.55), rgba(18, 18, 18, 0.75))',
        backdropFilter: 'blur(22px) saturate(140%)',
        borderRadius: '28px',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.2rem',
        fontFamily: 'Epilogue, sans-serif',
        border: '1px solid rgba(255, 255, 255, 0.12)'
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
                            <TimeWidget />
                        ) : (
                            <div/* style={placeholderStyle}*/>
                                <VoiceNotes />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SwipeableContainer;