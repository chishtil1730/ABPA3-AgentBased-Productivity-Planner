import { motion, useMotionValue, useTransform } from 'motion/react';
import { useState, useEffect, memo } from 'react';
import './Stack.css';

/**
 * CardRotate handles the 3D tilt effect and drag gestures for individual cards.
 * Memoized to prevent re-calculations during text editing in parent components.
 */
const CardRotate = memo(function CardRotate({ children, onSendToBack, sensitivity, disableDrag = false }) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-100, 100], [60, -60]);
    const rotateY = useTransform(x, [-100, 100], [-60, 60]);

    function handleDragEnd(_, info) {
        if (Math.abs(info.offset.x) > sensitivity || Math.abs(info.offset.y) > sensitivity) {
            onSendToBack();
        } else {
            x.set(0);
            y.set(0);
        }
    }

    return (
        <motion.div
            className={disableDrag ? "card-rotate-disabled" : "card-rotate"}
            style={{ x, y, rotateX, rotateY }}
            drag={!disableDrag}
            dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
            dragElastic={0.6}
            whileTap={!disableDrag ? { cursor: 'grabbing' } : {}}
            onDragEnd={handleDragEnd}
        >
            {children}
        </motion.div>
    );
});

export default function Stack({
                                  randomRotation = false,
                                  sensitivity = 200,
                                  cards = [],
                                  animationConfig = { stiffness: 260, damping: 20 },
                                  sendToBackOnClick = false,
                                  autoplay = false,
                                  autoplayDelay = 3000,
                                  pauseOnHover = false,
                                  mobileClickOnly = false,
                                  mobileBreakpoint = 768
                              }) {
    const [isPaused, setIsPaused] = useState(false);
    const [stack, setStack] = useState([]);

    /**
     * Synchronizes the local stack state with the incoming cards prop.
     * Fixed logic: New cards are appended to the end of the stack (the visual top),
     * and existing card indices are preserved to prevent jumping while editing.
     */
    useEffect(() => {
        setStack(prevStack => {
            const cardIds = new Set(cards.map(c => c.key));

            // 1. Filter out cards that no longer exist in the props
            const remainingStack = prevStack.filter(c => cardIds.has(c.id));

            // 2. Map existing IDs to identify truly new additions
            const existingIds = new Set(prevStack.map(c => c.id));
            const newCards = cards
                .filter(c => !existingIds.has(c.key))
                .map(cardContent => ({
                    id: cardContent.key,
                    content: cardContent,
                    rotation: randomRotation ? Math.random() * 10 - 5 : 0
                }));

            // 3. Update the content of cards already in the stack (e.g., during typing)
            const updatedStack = remainingStack.map(item => {
                const currentContent = cards.find(c => c.key === item.id);
                return { ...item, content: currentContent };
            });

            // 4. Combine: Existing ordered stack + strictly append new cards to the top
            return [...updatedStack, ...newCards];
        });
    }, [cards, randomRotation]);

    const sendToBack = (id) => {
        setStack(prev => {
            const newStack = [...prev];
            const index = newStack.findIndex(card => card.id === id);
            if (index === -1) return prev;
            const [card] = newStack.splice(index, 1);
            newStack.unshift(card);
            return newStack;
        });
    };

    const bringToTop = (id) => {
        setStack(prev => {
            const newStack = [...prev];
            const index = newStack.findIndex(card => card.id === id);
            if (index === -1) return prev;
            const [card] = newStack.splice(index, 1);
            newStack.push(card);
            return newStack;
        });
    };

    return (
        <div
            className="stack-container"
            onMouseEnter={() => pauseOnHover && setIsPaused(true)}
            onMouseLeave={() => pauseOnHover && setIsPaused(false)}
        >
            {stack.map((card, index) => {
                const isTopCard = index === stack.length - 1;
                return (
                    <CardRotate
                        key={card.id}
                        onSendToBack={() => sendToBack(card.id)}
                        sensitivity={sensitivity}
                        disableDrag={mobileClickOnly}
                    >
                        <motion.div
                            className="card"
                            onClick={(e) => {
                                // Block stack movement if editing mode is active
                                if (mobileClickOnly) return;

                                if (!isTopCard) {
                                    bringToTop(card.id);
                                } else if (sendToBackOnClick) {
                                    sendToBack(card.id);
                                }
                            }}
                            animate={{
                                // Visual stacking: index determines scale and rotation offset
                                rotateZ: (stack.length - index - 1) * 4 + card.rotation,
                                scale: 1 + index * 0.06 - stack.length * 0.06,
                                transformOrigin: '90% 90%'
                            }}
                            transition={{
                                type: 'spring',
                                stiffness: animationConfig.stiffness,
                                damping: animationConfig.damping
                            }}
                        >
                            {card.content}
                        </motion.div>
                    </CardRotate>
                );
            })}
        </div>
    );
}