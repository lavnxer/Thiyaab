import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function AnimatedSadX({ buttonClassName, iconClassName = "w-5 h-5", strokeWidth = 1.5, onClick }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <button
            onClick={onClick}
            className={buttonClassName}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
            >
                {/* Top-Left leg -> Left Eye */}
                <motion.path
                    variants={{
                        normal: { d: "M 6 6 L 12 12" },
                        sad: { d: "M 7 8 L 7 8.01" }
                    }}
                    initial="normal"
                    animate={isHovered ? "sad" : "normal"}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
                
                {/* Top-Right leg -> Right Eye */}
                <motion.path
                    variants={{
                        normal: { d: "M 18 6 L 12 12" },
                        sad: { d: "M 17 8 L 17 8.01" }
                    }}
                    initial="normal"
                    animate={isHovered ? "sad" : "normal"}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />

                {/* Bottom legs -> Frown (Mouth) */}
                <motion.path
                    variants={{
                        normal: { d: "M 6 18 L 12 12 L 18 18" },
                        sad: { d: "M 7 17 L 12 13 L 17 17" }
                    }}
                    initial="normal"
                    animate={isHovered ? "sad" : "normal"}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
            </motion.svg>
        </button>
    );
}
