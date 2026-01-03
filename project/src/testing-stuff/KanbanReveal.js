import React, { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import "./KanbanReveal.css"
import Layout from "../layouts/Layout";

const KanbanReveal = () => {
    const container = useRef();
    const counterRef = useRef();
    const blocksRef = useRef([]);
    const [animationComplete, setAnimationComplete] = useState(false);

    useLayoutEffect(() => {
        let ctx = gsap.context(() => {
            const tl = gsap.timeline({
                onComplete: () => setAnimationComplete(true)
            });

            // 🔥 FIX: Animate ONLY the bento content, NOT the gradient background
            gsap.set(".bento-container", {
                opacity: 0,
                scale: 0.85,
                transformOrigin: "center center",
                willChange: "transform, opacity"
            });

            // Counter Logic
            tl.to(counterRef.current, {
                innerText: 100,
                duration: 1.6,
                ease: "power2.inOut",
                onUpdate: function() {
                    counterRef.current.innerText = Math.ceil(this.targets()[0].innerText);
                }
            })
                .to(counterRef.current, { opacity: 0, duration: 0.3 });

            // The SYNCED Reveal
            tl.addLabel("reveal", "-=0.1");

            // The Curtain Lifts
            tl.to(blocksRef.current, {
                yPercent: -100,
                stagger: 0.05,
                duration: 1.2,
                ease: "power4.inOut",
                force3D: true
            }, "reveal");

            // 🔥 FIX: Only scale the bento-container, background stays static
            tl.to(".bento-container", {
                opacity: 1,
                scale: 1,
                duration: 1.7,
                ease: "power3.out",
                clearProps: "willChange"
            }, "reveal+=0.2");

        }, container);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={container} className="preloader-wrapper">
            {/* The Content Layer */}

            <div className="layout-shell">
                {/* This contains both background (static) and content (animated) */}
                <Layout animationComplete={animationComplete} />
            </div>

            {/* The Counter Layer */}
            <div ref={counterRef} className="counter">0</div>

            {/* The Animation Layer */}
            <div className="overlay-layer">
                {[...Array(10)].map((_, i) => (
                    <div
                        key={i}
                        ref={el => blocksRef.current[i] = el}
                        className="reveal-block"
                    />
                ))}
            </div>
        </div>
    );
};

export default KanbanReveal;