'use client';

import { motion } from 'motion/react';
import { useState } from 'react';

type RollingDigitProps = {
    value: number;
};

export function RollingDigit({ value }: RollingDigitProps) {
    const [hovered, setHovered] = useState(false);

    // @ts-ignore
    const digits = [...Array(10).keys(), ...Array(10).keys()];
    const targetOffset = hovered ? value + 10 : value;

    return (
        <div
            className="relative h-[1em] w-[0.75em] overflow-hidden"
            aria-hidden="true"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                cursor: 'pointer',

                /* =====================================================
                   🔥 EDGE FEATHERING (THIS FIXES SHARP CUTOFF)
                   Top + bottom fade + right-side fade combined
                   ===================================================== */
                WebkitMaskImage: `
          linear-gradient(
            to bottom,
            transparent 0%,
            black 20%,
            black 80%,
            transparent 100%
          ),
          linear-gradient(
            to right,
            black 0%,
            black 70%,
            transparent 100%
          )
        `,
                maskImage: `
          linear-gradient(
            to bottom,
            transparent 0%,
            black 20%,
            black 80%,
            transparent 100%
          ),
          linear-gradient(
            to right,
            black 0%,
            black 70%,
            transparent 100%
          )
        `,
                WebkitMaskComposite: 'source-in',
                maskComposite: 'intersect',
            }}
        >
            <motion.div
                className="absolute left-0 top-0 flex flex-col"
                animate={{ y: `-${targetOffset}em` }}
                transition={{
                    duration: 0.9,
                    ease: [0.22, 1, 0.36, 1],
                }}
            >
                {digits.map((d, i) => (
                    <div
                        key={i}
                        className="h-[1em] flex items-center justify-center"
                    >
                        {d}
                    </div>
                ))}
            </motion.div>
        </div>
    );
}
