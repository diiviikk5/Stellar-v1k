import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const loadingMessages = [
    { text: 'Initializing AI Engine...', icon: '🧠' },
    { text: 'Loading TensorFlow.js Models...', icon: '⚡' },
    { text: 'Connecting to Satellite Network...', icon: '📡' },
    { text: 'Calibrating Prediction Systems...', icon: '🎯' },
    { text: 'Preparing Mission Control...', icon: '🚀' },
];

const DashboardLoader = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [messageIndex, setMessageIndex] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        // Progressive loading simulation that gives time for heavy components
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    return 100;
                }
                // Slower progress to allow components to load
                return prev + 2;
            });
        }, 100); // 5 seconds total

        return () => clearInterval(progressInterval);
    }, []);

    useEffect(() => {
        // Cycle through messages
        const messageInterval = setInterval(() => {
            setMessageIndex(prev => (prev + 1) % loadingMessages.length);
        }, 1000);

        return () => clearInterval(messageInterval);
    }, []);

    useEffect(() => {
        if (progress >= 100 && !isComplete) {
            setIsComplete(true);
            // Small delay before completing
            setTimeout(() => {
                onComplete?.();
            }, 500);
        }
    }, [progress, isComplete, onComplete]);

    return (
        <AnimatePresence>
            {!isComplete && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-space-900"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Animated background */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-radial from-stellar-primary/5 via-transparent to-transparent" />

                        {/* Floating particles */}
                        {[...Array(20)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-1 h-1 rounded-full bg-stellar-primary/30"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                }}
                                animate={{
                                    y: [0, -30, 0],
                                    opacity: [0.3, 0.8, 0.3],
                                }}
                                transition={{
                                    duration: 2 + Math.random() * 2,
                                    repeat: Infinity,
                                    delay: Math.random() * 2,
                                }}
                            />
                        ))}
                    </div>

                    <div className="relative z-10 flex flex-col items-center gap-8">
                        {/* Logo/Title */}
                        <motion.div
                            className="text-center"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <h1 className="text-5xl font-display font-bold tracking-wider">
                                <span className="text-gradient-primary">STELLAR</span>
                                <span className="text-white">-v1k</span>
                            </h1>
                            <p className="text-slate-400 mt-2">Mission Control Initializing</p>
                        </motion.div>

                        {/* Orbital spinner */}
                        <div className="relative w-32 h-32">
                            {/* Center dot */}
                            <motion.div
                                className="absolute top-1/2 left-1/2 w-4 h-4 -mt-2 -ml-2 rounded-full bg-stellar-primary"
                                animate={{
                                    boxShadow: [
                                        '0 0 20px rgba(99, 102, 241, 0.5)',
                                        '0 0 40px rgba(99, 102, 241, 0.8)',
                                        '0 0 20px rgba(99, 102, 241, 0.5)',
                                    ],
                                }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            />

                            {/* Orbiting rings */}
                            {[0, 1, 2].map((ring) => (
                                <motion.div
                                    key={ring}
                                    className="absolute inset-0 rounded-full border border-stellar-primary/30"
                                    style={{
                                        transform: `scale(${0.5 + ring * 0.25})`,
                                    }}
                                    animate={{ rotate: 360 }}
                                    transition={{
                                        duration: 3 + ring,
                                        repeat: Infinity,
                                        ease: 'linear',
                                    }}
                                >
                                    {/* Orbiting satellite */}
                                    <motion.div
                                        className="absolute w-2 h-2 rounded-full bg-stellar-cyan"
                                        style={{
                                            top: -4,
                                            left: '50%',
                                            marginLeft: -4,
                                        }}
                                    />
                                </motion.div>
                            ))}
                        </div>

                        {/* Loading message */}
                        <motion.div
                            className="flex items-center gap-3 text-lg"
                            key={messageIndex}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <span className="text-2xl">{loadingMessages[messageIndex].icon}</span>
                            <span className="text-slate-300 font-mono">
                                {loadingMessages[messageIndex].text}
                            </span>
                        </motion.div>

                        {/* Progress bar */}
                        <div className="w-80">
                            <div className="h-1 rounded-full bg-space-700 overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-stellar-primary via-stellar-cyan to-stellar-accent"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                            <div className="flex justify-between mt-2 text-xs font-mono text-slate-500">
                                <span>Loading Systems</span>
                                <span>{progress}%</span>
                            </div>
                        </div>

                        {/* Tip */}
                        <motion.p
                            className="text-xs text-slate-500 max-w-md text-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                        >
                            💡 Tip: STELLAR uses TensorFlow.js to run AI models directly in your browser
                            for real-time satellite error predictions.
                        </motion.p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default DashboardLoader;
