import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const loadingSteps = [
    { text: 'INITIALIZING_AI_ENGINE', status: 'loading' },
    { text: 'LOADING_TENSORFLOW_MODELS', status: 'loading' },
    { text: 'CONNECTING_SATELLITE_NETWORK', status: 'loading' },
    { text: 'CALIBRATING_PREDICTION_SYSTEMS', status: 'loading' },
    { text: 'PREPARING_MISSION_CONTROL', status: 'loading' },
];

const DashboardLoader = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);
    const [steps, setSteps] = useState(loadingSteps);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    return 100;
                }
                return prev + 20;
            });
        }, 100);

        return () => clearInterval(progressInterval);
    }, []);

    useEffect(() => {
        const stepInterval = setInterval(() => {
            setCurrentStep(prev => {
                const next = prev + 1;
                if (next <= steps.length) {
                    setSteps(s => s.map((step, i) => ({
                        ...step,
                        status: i < next ? 'complete' : i === next ? 'loading' : 'pending'
                    })));
                }
                return next;
            });
        }, 120);

        return () => clearInterval(stepInterval);
    }, []);

    useEffect(() => {
        if (progress >= 100 && !isComplete) {
            setIsComplete(true);
            onComplete?.();
        }
    }, [progress, isComplete, onComplete]);

    return (
        <AnimatePresence>
            {!isComplete && (
                <motion.div
                    className="fixed inset-0 z-50 bg-slate-950"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    {/* Grid background */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0" style={{
                            backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                            backgroundSize: '50px 50px'
                        }} />
                    </div>

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900/80 to-slate-950" />

                    {/* Content */}
                    <div className="relative z-10 flex items-center justify-center min-h-screen p-8">
                        <div className="w-full max-w-2xl">
                            {/* Header */}
                            <div className="mb-12">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-3 h-3 bg-amber-500" />
                                    <span className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest">
                                        SYSTEM_INITIALIZATION
                                    </span>
                                </div>
                                <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight">
                                    STELLAR<span className="text-amber-500">-v1k</span>
                                </h1>
                                <p className="text-sm font-mono text-slate-400 mt-2">
                                    AI-Powered GNSS Error Forecasting Platform
                                </p>
                            </div>

                            {/* Loading Steps */}
                            <div className="space-y-3 mb-8">
                                {steps.map((step, index) => (
                                    <motion.div
                                        key={step.text}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-center gap-4"
                                    >
                                        <div className={`w-2 h-2 ${
                                            step.status === 'complete' ? 'bg-emerald-500' :
                                            step.status === 'loading' ? 'bg-amber-500 animate-pulse' :
                                            'bg-slate-700'
                                        }`} />
                                        <span className={`text-xs font-mono font-bold uppercase tracking-wider ${
                                            step.status === 'complete' ? 'text-emerald-500' :
                                            step.status === 'loading' ? 'text-amber-500' :
                                            'text-slate-600'
                                        }`}>
                                            {step.text}
                                        </span>
                                        {step.status === 'complete' && (
                                            <span className="text-[9px] font-mono text-slate-600 ml-auto">OK</span>
                                        )}
                                    </motion.div>
                                ))}
                            </div>

                            {/* Progress Bar */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest">
                                        LOADING_PROGRESS
                                    </span>
                                    <span className="text-xs font-mono font-black text-white">
                                        {progress}%
                                    </span>
                                </div>
                                <div className="h-1 bg-slate-800 overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-amber-500 to-amber-400"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ ease: 'easeOut' }}
                                    />
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="mt-8 pt-8 border-t border-slate-800/50">
                                <div className="flex items-center justify-between text-[9px] font-mono text-slate-600 uppercase tracking-widest">
                                    <span>ISRO // SMART_INDIA_HACKATHON</span>
                                    <span>VERSION_1.0.0</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default DashboardLoader;
