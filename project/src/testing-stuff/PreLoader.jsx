import React, { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import './Preloader.css';

const Preloader = ({ children }) => {
    const container = useRef();
    const counterRef = useRef();
    const revealRefs = useRef([]);
    const [isFinished, setIsFinished] = useState(false);

    useLayoutEffect(() => {
        let ctx = gsap.context(() => {
            const tl = gsap.timeline({
                onComplete: () => setIsFinished(true)
            });

            // 1. Counter Animation (0 to 100)
            tl.to(counterRef.current, {
                innerText: 100,
                duration: 2,
                snap: { innerText: 1 },
                ease: "power3.inOut",
            });

            // 2. Fade out counter
            tl.to(counterRef.current, {
                opacity: 0,
                duration: 0.3,
                delay: 0.2
            });

            // 3. Block Reveal Animation (Staggered)
            tl.to(revealRefs.current, {
                yPercent: -100,
                stagger: {
                    amount: 0.5,
                    from: "start"
                },
                duration: 1.2,
                ease: "expo.inOut"
            });
        }, container);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={container} className="preloader-wrapper">
            {/* The Background Content (Revealed later) */}
            <main className="main-content">
                {children}
            </main>

            {/* The Counter */}
            <div className="counter-container">
                <h1 ref={counterRef} className="counter-text">0</h1>
            </div>

            {/* The Overlay Blocks */}
            <div className="blocks-overlay">
                {[...Array(10)].map((_, i) => (
                    <div
                        key={i}
                        ref={(el) => (revealRefs.current[i] = el)}
                        className="block"
                    />
                ))}
            </div>
        </div>
    );
};

export default Preloader;