/**
 * AI Inference Panel Component
 * Run and display real AI-powered forecasts
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CpuChipIcon,
    BoltIcon,
    ChartBarIcon,
    PlayIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useAppStore } from '../store/appStore';
import { initializeAI, generateForecast, getAIStatus } from '../services/aiService';
import { generateHistoricalData } from '../services/liveDataService';

const AIInferencePanel = ({ satellite, onForecastComplete }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [forecast, setForecast] = useState(null);
    const [aiStatus, setAiStatus] = useState(null);
    const [error, setError] = useState(null);

    const setActiveForecast = useAppStore(state => state.setActiveForecast);
    const addNotification = useAppStore(state => state.addNotification);

    // Initialize AI on mount
    useEffect(() => {
        const init = async () => {
            try {
                await initializeAI();
                setAiStatus(getAIStatus());
            } catch (err) {
                console.error('AI initialization failed:', err);
            }
        };
        init();
    }, []);

    const runInference = async () => {
        if (!satellite) return;

        setIsLoading(true);
        setError(null);

        try {
            // Generate historical data for the satellite
            const historicalData = generateHistoricalData(satellite.id, 7, 15);

            // Run AI forecast
            const result = await generateForecast(historicalData, satellite.id);

            setForecast(result);
            setActiveForecast(result);

            addNotification({
                type: 'success',
                title: 'AI Forecast Complete',
                message: `Generated predictions for ${satellite.id} in ${result.inferenceTimeMs.toFixed(0)}ms`
            });

            if (onForecastComplete) {
                onForecastComplete(result);
            }
        } catch (err) {
            console.error('Inference error:', err);
            setError(err.message);
            addNotification({
                type: 'error',
                title: 'Forecast Failed',
                message: err.message
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            className="console-panel p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-stellar-primary to-stellar-accent flex items-center justify-center">
                        <CpuChipIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-display font-semibold text-white">AI Inference Engine</h3>
                        <div className="flex items-center gap-2 text-sm">
                            {aiStatus?.isReady ? (
                                <>
                                    <span className="w-2 h-2 rounded-full bg-stellar-emerald animate-pulse" />
                                    <span className="text-stellar-emerald">Model Ready</span>
                                    <span className="text-slate-500">• {aiStatus.tfBackend} backend</span>
                                </>
                            ) : (
                                <>
                                    <span className="w-2 h-2 rounded-full bg-stellar-amber animate-pulse" />
                                    <span className="text-stellar-amber">Initializing...</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <motion.button
                    onClick={runInference}
                    disabled={!satellite || isLoading}
                    className={`
                        flex items-center gap-2 px-6 py-3 rounded-xl font-medium
                        transition-all duration-300
                        ${!satellite || isLoading
                            ? 'bg-space-700 text-slate-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-stellar-primary to-stellar-accent text-white shadow-glow hover:shadow-glow-lg'}
                    `}
                    whileHover={!isLoading && satellite ? { scale: 1.02 } : {}}
                    whileTap={!isLoading && satellite ? { scale: 0.98 } : {}}
                >
                    {isLoading ? (
                        <>
                            <ArrowPathIcon className="w-5 h-5 animate-spin" />
                            Running Inference...
                        </>
                    ) : (
                        <>
                            <BoltIcon className="w-5 h-5" />
                            Run AI Forecast
                        </>
                    )}
                </motion.button>
            </div>

            {/* Satellite Info */}
            {satellite && (
                <div className="mb-6 p-4 rounded-lg bg-space-800/50 border border-console-border">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-space-700 flex items-center justify-center font-mono font-bold text-white">
                            {satellite.id}
                        </div>
                        <div>
                            <div className="text-white font-medium">{satellite.name}</div>
                            <div className="text-sm text-slate-400">
                                {satellite.constellation} • {satellite.orbit}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Display */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6 p-4 rounded-lg bg-stellar-rose/10 border border-stellar-rose/30 text-stellar-rose"
                    >
                        <div className="flex items-center gap-2">
                            <ExclamationTriangleIcon className="w-5 h-5" />
                            <span>{error}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Forecast Results */}
            <AnimatePresence>
                {forecast && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Inference Stats */}
                        <div className="flex items-center gap-6 p-4 rounded-lg bg-stellar-emerald/10 border border-stellar-emerald/30">
                            <CheckCircleIcon className="w-8 h-8 text-stellar-emerald" />
                            <div className="flex-1 grid grid-cols-3 gap-4">
                                <div>
                                    <div className="text-xs text-slate-400">Inference Time</div>
                                    <div className="text-lg font-mono text-stellar-emerald">
                                        {forecast.inferenceTimeMs.toFixed(1)}ms
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-400">Model Confidence</div>
                                    <div className="text-lg font-mono text-stellar-cyan">
                                        {forecast.modelConfidence}%
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-400">Horizons Generated</div>
                                    <div className="text-lg font-mono text-stellar-primary">
                                        {forecast.forecasts.length}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Predictions Grid */}
                        <div className="section-header">
                            <h4 className="flex items-center gap-2">
                                <ChartBarIcon className="w-4 h-4" />
                                Multi-Horizon Predictions
                            </h4>
                            <div className="divider" />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {forecast.forecasts.map((pred, i) => (
                                <motion.div
                                    key={pred.horizonLabel}
                                    className={`
                                        p-4 rounded-lg border transition-all
                                        ${pred.riskLevel === 'HIGH'
                                            ? 'bg-stellar-rose/10 border-stellar-rose/30'
                                            : pred.riskLevel === 'MEDIUM'
                                                ? 'bg-stellar-amber/10 border-stellar-amber/30'
                                                : 'bg-space-800/50 border-console-border'}
                                    `}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <div className="text-xs font-mono text-slate-400 mb-2">
                                        +{pred.horizonLabel}
                                    </div>
                                    <div className="text-xl font-display font-bold text-white mb-1">
                                        {pred.mean.toFixed(3)}
                                        <span className="text-sm text-slate-400 ml-1">ns</span>
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        ±{pred.std.toFixed(3)} ns (1σ)
                                    </div>
                                    <div className="mt-2 pt-2 border-t border-console-border">
                                        <div className={`
                                            text-xs font-medium
                                            ${pred.riskLevel === 'HIGH' ? 'text-stellar-rose' :
                                                pred.riskLevel === 'MEDIUM' ? 'text-stellar-amber' :
                                                    'text-stellar-emerald'}
                                        `}>
                                            {pred.riskLevel} RISK
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Confidence Intervals */}
                        <div className="p-4 rounded-lg bg-space-800/50 border border-console-border">
                            <h5 className="text-sm font-medium text-white mb-3">95% Confidence Intervals</h5>
                            <div className="space-y-2">
                                {forecast.forecasts.slice(0, 4).map(pred => (
                                    <div key={pred.horizonLabel} className="flex items-center gap-4">
                                        <span className="text-xs font-mono text-slate-400 w-12">+{pred.horizonLabel}</span>
                                        <div className="flex-1 h-2 bg-space-700 rounded-full overflow-hidden relative">
                                            <motion.div
                                                className="absolute inset-y-0 bg-gradient-to-r from-stellar-primary/50 to-stellar-accent/50"
                                                initial={{ left: '50%', right: '50%' }}
                                                animate={{
                                                    left: `${Math.max(0, 50 - Math.abs(pred.lower95) * 30)}%`,
                                                    right: `${Math.max(0, 50 - Math.abs(pred.upper95) * 30)}%`
                                                }}
                                                transition={{ duration: 0.5, delay: 0.2 }}
                                            />
                                            <div className="absolute inset-y-0 left-1/2 w-0.5 bg-stellar-cyan" />
                                        </div>
                                        <span className="text-xs font-mono text-slate-500 w-32 text-right">
                                            [{pred.lower95.toFixed(3)}, {pred.upper95.toFixed(3)}]
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Empty State */}
            {!forecast && !isLoading && (
                <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-space-800 border border-console-border flex items-center justify-center">
                        <CpuChipIcon className="w-10 h-10 text-slate-600" />
                    </div>
                    <h4 className="text-white font-medium mb-2">Ready for Inference</h4>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto">
                        {satellite
                            ? `Click "Run AI Forecast" to generate predictions for ${satellite.id}`
                            : 'Select a satellite from the console to run AI-powered forecasts'}
                    </p>
                </div>
            )}
        </motion.div>
    );
};

export default AIInferencePanel;
