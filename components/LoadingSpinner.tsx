"use client"

import { motion } from "framer-motion"

export default function LoadingSpinner({ text = "Đang tải...", className = "min-h-[50vh]" }: { text?: string, className?: string }) {
    return (
        <div className={`flex flex-col items-center justify-center w-full gap-4 ${className}`}>
            <div className="relative h-16 w-16">
                {/* Outer rotating ring with cute dots */}
                <motion.div
                    className="absolute inset-0"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                        <motion.div
                            key={i}
                            className="absolute w-3 h-3 rounded-full bg-primary"
                            style={{
                                top: 0,
                                left: "50%",
                                marginLeft: "-6px",
                                transformOrigin: "50% 32px",
                                transform: `rotate(${i * 60}deg)`,
                            }}
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: i * 0.1,
                                repeatType: "reverse"
                            }}
                        />
                    ))}
                </motion.div>

                {/* Center bouncing element */}
                <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    animate={{ scale: [0.8, 1.1, 0.8] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                    <div className="h-8 w-8 bg-accent/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <span className="text-sm font-bold text-accent jp-text">日</span>
                    </div>
                </motion.div>
            </div>

            <motion.p
                className="text-muted-foreground text-sm font-medium"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
            >
                {text}
            </motion.p>
        </div>
    )
}
