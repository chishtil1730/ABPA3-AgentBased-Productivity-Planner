import { useRef, useEffect, useState } from 'react';
import './GooeyNav.css';

const GooeyNav = ({
                      items,
                      animationTime = 600,
                      particleCount = 15,
                      particleDistances = [90, 10],
                      particleR = 100,
                      timeVariance = 300,
                      colors = [1, 2, 3, 1, 2, 3, 1, 4],
                      initialActiveIndex = 0,
                      onItemSelect,
                      parentAnimationComplete = true,
                      initializationDelay = 0, // New prop for extra delay
                  }) => {
    const containerRef = useRef(null);
    const navRef = useRef(null);
    const filterRef = useRef(null);
    const textRef = useRef(null);

    // Initialize with the prop value directly to prevent null state
    const [activeIndex, setActiveIndex] = useState(initialActiveIndex);
    const [isReady, setIsReady] = useState(false); // Track if positioning is ready

    /* ---------------------------------------------------
       Update if initialActiveIndex changes
    --------------------------------------------------- */
    useEffect(() => {
        setActiveIndex(initialActiveIndex);
    }, [initialActiveIndex]);

    const noise = (n = 1) => n / 2 - Math.random() * n;

    const getXY = (distance, pointIndex, totalPoints) => {
        const angle = ((360 + noise(8)) / totalPoints) * pointIndex * (Math.PI / 180);
        return [distance * Math.cos(angle), distance * Math.sin(angle)];
    };

    const createParticle = (i, t, d, r) => {
        let rotate = noise(r / 10);
        return {
            start: getXY(d[0], particleCount - i, particleCount),
            end: getXY(d[1] + noise(7), particleCount - i, particleCount),
            time: t,
            scale: 1 + noise(0.2),
            color: colors[Math.floor(Math.random() * colors.length)],
            rotate: rotate > 0 ? (rotate + r / 20) * 10 : (rotate - r / 20) * 10,
        };
    };

    const makeParticles = element => {
        const d = particleDistances;
        const r = particleR;
        const bubbleTime = animationTime * 2 + timeVariance;
        element.style.setProperty('--time', `${bubbleTime}ms`);

        for (let i = 0; i < particleCount; i++) {
            const t = animationTime * 2 + noise(timeVariance * 2);
            const p = createParticle(i, t, d, r);
            element.classList.remove('active');

            setTimeout(() => {
                const particle = document.createElement('span');
                const point = document.createElement('span');

                particle.classList.add('particle');
                particle.style.setProperty('--start-x', `${p.start[0]}px`);
                particle.style.setProperty('--start-y', `${p.start[1]}px`);
                particle.style.setProperty('--end-x', `${p.end[0]}px`);
                particle.style.setProperty('--end-y', `${p.end[1]}px`);
                particle.style.setProperty('--time', `${p.time}ms`);
                particle.style.setProperty('--scale', `${p.scale}`);
                particle.style.setProperty('--color', `var(--color-${p.color}, white)`);
                particle.style.setProperty('--rotate', `${p.rotate}deg`);

                point.classList.add('point');
                particle.appendChild(point);
                element.appendChild(particle);

                requestAnimationFrame(() => {
                    element.classList.add('active');
                });

                setTimeout(() => {
                    try {
                        element.removeChild(particle);
                    } catch {}
                }, t);
            }, 30);
        }
    };

    const updateEffectPosition = element => {
        if (!containerRef.current || !filterRef.current || !textRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const pos = element.getBoundingClientRect();

        const styles = {
            left: `${pos.x - containerRect.x}px`,
            top: `${pos.y - containerRect.y}px`,
            width: `${pos.width}px`,
            height: `${pos.height}px`,
        };

        Object.assign(filterRef.current.style, styles);
        Object.assign(textRef.current.style, styles);
        textRef.current.innerText = element.innerText;
    };

    const handleClick = (e, index) => {
        e.preventDefault();

        if (activeIndex === index) return;

        const liEl = e.currentTarget;

        setActiveIndex(index);
        setIsReady(true); // Ensure it stays ready on clicks
        updateEffectPosition(liEl);
        onItemSelect?.(index, items[index]);

        if (filterRef.current) {
            filterRef.current
                .querySelectorAll('.particle')
                .forEach(p => filterRef.current.removeChild(p));
        }

        if (textRef.current) {
            textRef.current.classList.remove('active');
            void textRef.current.offsetWidth;
            textRef.current.classList.add('active');
        }

        if (filterRef.current) {
            makeParticles(filterRef.current);
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const liEl = e.currentTarget.parentElement;
            if (liEl) handleClick({ preventDefault() {}, currentTarget: liEl }, index);
        }
    };

    /* ---------------------------------------------------
       Update text active class based on isReady state
    --------------------------------------------------- */
    useEffect(() => {
        if (!textRef.current) return;

        if (isReady) {
            textRef.current.classList.add('active');
        } else {
            textRef.current.classList.remove('active');
        }
    }, [isReady]);

    /* ---------------------------------------------------
       Initialize position on mount (wait for parent animations)
    --------------------------------------------------- */
    useEffect(() => {
        if (!parentAnimationComplete || !navRef.current || !containerRef.current || activeIndex === null) return;

        // Configurable delay to wait for GSAP bezier curves to settle
        const timer = setTimeout(() => {
            const activeLi = navRef.current?.querySelectorAll('li')[activeIndex];
            if (activeLi && textRef.current) {
                updateEffectPosition(activeLi);
                // Don't add 'active' class here - let the isReady effect handle it
                setIsReady(true); // Mark as ready AFTER positioning
            }
        }, initializationDelay);

        return () => clearTimeout(timer);
    }, [parentAnimationComplete, initializationDelay]); // Re-run when animation completes

    /* ---------------------------------------------------
       Update position when activeIndex changes
    --------------------------------------------------- */
    useEffect(() => {
        if (
            activeIndex === null ||
            !navRef.current ||
            !containerRef.current
        ) return;

        const activeLi = navRef.current.querySelectorAll('li')[activeIndex];
        if (activeLi) {
            updateEffectPosition(activeLi);
            // Don't manually add 'active' class - the isReady effect handles it
        }

        const resizeObserver = new ResizeObserver(() => {
            const currentLi = navRef.current?.querySelectorAll('li')[activeIndex];
            if (currentLi) updateEffectPosition(currentLi);
        });

        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, [activeIndex]);

    return (
        <div className="gooey-nav-container" ref={containerRef}>
            <nav>
                <ul ref={navRef}>
                    {items.map((item, index) => (
                        <li
                            key={index}
                            className={activeIndex === index ? 'active' : ''}
                        >
                            <a
                                href={item.href || '#'}
                                onClick={e => handleClick(e, index)}
                                onKeyDown={e => handleKeyDown(e, index)}
                            >
                                {item.label}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>

            <span className="effect filter" ref={filterRef} />
            <span className="effect text" ref={textRef} />
        </div>
    );
};

export default GooeyNav;