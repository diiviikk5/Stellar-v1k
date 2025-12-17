import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    RocketLaunchIcon,
    SignalIcon,
    ClockIcon,
    ChartBarIcon,
    ShieldCheckIcon,
    ExclamationTriangleIcon,
    PlayIcon,
    ArrowRightIcon,
    CpuChipIcon,
    BoltIcon
} from '@heroicons/react/24/outline';
import { Header, KPICard, EvidenceStrip, LoadingSpinner, StatusBadge, LiveTelemetryPanel, SpaceLiveFeeds, LiveSatelliteMap } from '../components';
import { satellites, generateKPIMetrics, modelComparison } from '../data/mockData';
import { initializeAI, generateForecast, getAIStatus } from '../services/aiService';
import { generateHistoricalData } from '../services/liveDataService';
import { useAppStore } from '../store/appStore';

const CommandDeck = () => {
    const navigate = useNavigate();
    const [metrics, setMetrics] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [runComplete, setRunComplete] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [aiReady, setAiReady] = useState(false);
    const [forecastResults, setForecastResults] = useState(null);
    const [inferenceTime, setInferenceTime] = useState(null);

    const addNotification = useAppStore(state => state.addNotification);

    // Initialize AI on mount
    useEffect(() => {
        const init = async () => {
            try {
                await initializeAI();
                setAiReady(true);
                const status = getAIStatus();
                console.log('AI Status:', status);
            } catch (err) {
                console.error('AI init error:', err);
            }
        };
        init();

        setMetrics(generateKPIMetrics());
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Real AI-powered forecast
    const handleRunForecast = useCallback(async () => {
        setIsRunning(true);
        setRunComplete(false);
        setForecastResults(null);

        const startTime = performance.now();

        try {
            // Run AI forecasts for all satellites
            const results = await Promise.all(
                satellites.slice(0, 6).map(async (sat) => {
                    const data = generateHistoricalData(sat.id, 7, 15);
                    const forecast = await generateForecast(data, sat.id);
                    return { satellite: sat, forecast };
                })
            );

            const totalTime = performance.now() - startTime;
            setInferenceTime(totalTime);
            setForecastResults(results);
            setMetrics(generateKPIMetrics());

            addNotification({
                type: 'success',
                title: '🚀 AI Forecast Complete',
                message: `Generated predictions for ${results.length} satellites in ${totalTime.toFixed(0)}ms`
            });

        } catch (err) {
            console.error('Forecast error:', err);
            addNotification({
                type: 'error',
                title: 'Forecast Failed',
                message: err.message
            });
        } finally {
            setIsRunning(false);
            setRunComplete(true);
        }
    }, [addNotification]);

    const formatLastUpdate = () => {
        return currentTime.toLocaleTimeString();
    };

    if (!metrics) return null;

    return (
        <div className="min-h-screen">
            <Header
                title="Command Deck"
                subtitle="GNSS Error Forecasting Mission Control"
            />

            <div className="p-6 space-y-6">
                {/* Hero Section */}
                <motion.div
                    className="console-panel p-8 relative overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {/* Animated background elements */}
                    <div className="absolute inset-0 overflow-hidden">
                        <motion.div
                            className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-stellar-primary/10 blur-3xl"
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.3, 0.5, 0.3]
                            }}
                            transition={{ duration: 4, repeat: Infinity }}
                        />
                        <motion.div
                            className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-stellar-accent/10 blur-3xl"
                            animate={{
                                scale: [1.2, 1, 1.2],
                                opacity: [0.3, 0.5, 0.3]
                            }}
                            transition={{ duration: 4, repeat: Infinity, delay: 2 }}
                        />
                    </div>

                    <div className="relative flex items-start justify-between">
                        <div className="space-y-4">
                            {/* Status Indicator */}
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="status-led online" />
                                    <span className="text-stellar-emerald font-mono text-sm">SYSTEM OPERATIONAL</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-space-800 border border-console-border">
                                    <CpuChipIcon className="w-4 h-4 text-stellar-primary" />
                                    <span className={`text-xs font-mono ${aiReady ? 'text-stellar-cyan' : 'text-stellar-amber'}`}>
                                        {aiReady ? 'AI ENGINE READY' : 'AI INITIALIZING...'}
                                    </span>
                                    {aiReady && <BoltIcon className="w-3 h-3 text-stellar-cyan" />}
                                </div>
                            </div>

                            {/* Main Title */}
                            <div>
                                <h1 className="text-4xl font-display font-bold tracking-wider">
                                    <span className="text-gradient-primary">STELLAR</span>
                                    <span className="text-white">-v1k</span>
                                </h1>
                                <p className="text-slate-400 mt-2 max-w-xl">
                                    AI-Powered Early Warning System for Satellite Navigation Errors.
                                    Predictive error prevention for GNSS operators worldwide.
                                </p>
                            </div>

                            {/* Live Stats */}
                            <div className="flex items-center gap-6 mt-6">
                                <div className="flex items-center gap-2">
                                    <ClockIcon className="w-4 h-4 text-stellar-cyan" />
                                    <span className="text-sm font-mono">
                                        <span className="text-slate-400">Last Update:</span>
                                        <span className="text-white ml-2">{formatLastUpdate()}</span>
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <SignalIcon className="w-4 h-4 text-stellar-emerald" />
                                    <span className="text-sm font-mono">
                                        <span className="text-slate-400">Satellites:</span>
                                        <span className="text-white ml-2">{satellites.length} Active</span>
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <ChartBarIcon className="w-4 h-4 text-stellar-accent" />
                                    <span className="text-sm font-mono">
                                        <span className="text-slate-400">Data Window:</span>
                                        <span className="text-white ml-2">7 Days</span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Big Action Button */}
                        <div className="text-center">
                            <motion.button
                                onClick={handleRunForecast}
                                disabled={isRunning}
                                className={`
                  relative px-8 py-5 rounded-xl font-display font-bold text-lg tracking-wider
                  ${isRunning
                                        ? 'bg-space-700 text-slate-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-stellar-primary to-stellar-accent text-white shadow-glow hover:shadow-glow-lg'
                                    }
                  transition-all duration-300 min-w-[280px]
                `}
                                whileHover={!isRunning ? { scale: 1.02 } : {}}
                                whileTap={!isRunning ? { scale: 0.98 } : {}}
                            >
                                {isRunning ? (
                                    <div className="flex items-center justify-center gap-3">
                                        <LoadingSpinner size="sm" text="" />
                                        <span>COMPUTING...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-3">
                                        <RocketLaunchIcon className="w-6 h-6" />
                                        <span>RUN DAY-8 FORECAST</span>
                                    </div>
                                )}

                                {!isRunning && (
                                    <motion.div
                                        className="absolute inset-0 rounded-xl"
                                        style={{
                                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                                        }}
                                        animate={{ x: [-200, 300] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />
                                )}
                            </motion.button>

                            <p className="text-xs text-slate-500 mt-3 font-mono">
                                Click to generate predictions for Day 8
                            </p>

                            <AnimatePresence>
                                {runComplete && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="mt-4 space-y-2"
                                    >
                                        <span className="badge badge-success">
                                            ✓ AI Forecast Complete
                                        </span>
                                        {inferenceTime && (
                                            <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                                                <span>⚡ Inference: <span className="text-stellar-cyan">{inferenceTime.toFixed(0)}ms</span></span>
                                                {forecastResults && (
                                                    <span>🛰️ Satellites: <span className="text-stellar-primary">{forecastResults.length}</span></span>
                                                )}
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>

                {/* KPI Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <KPICard
                        label="Near-term Accuracy (15m)"
                        value={metrics.nearTermAccuracy.value}
                        unit="%"
                        trend="up"
                        color="cyan"
                        icon={ChartBarIcon}
                        subtitle="Prediction accuracy for 15-min horizon"
                        delay={0.1}
                    />
                    <KPICard
                        label="Long-horizon Stability (24h)"
                        value={metrics.longHorizonStability.value}
                        unit="%"
                        trend="stable"
                        color="purple"
                        icon={ClockIcon}
                        subtitle="24-hour forecast reliability"
                        delay={0.2}
                    />
                    <KPICard
                        label="Residual Normality Score"
                        value={metrics.residualNormality.value}
                        unit=""
                        trend="up"
                        color="emerald"
                        icon={ShieldCheckIcon}
                        subtitle="Shapiro-Wilk test score"
                        delay={0.3}
                    />
                    <KPICard
                        label="Satellites Healthy / Flagged"
                        value={`${metrics.satelliteStatus.healthy}/${metrics.satelliteStatus.flagged}`}
                        unit=""
                        trend={metrics.satelliteStatus.flagged > 1 ? 'down' : 'stable'}
                        color={metrics.satelliteStatus.flagged > 1 ? 'amber' : 'blue'}
                        icon={SignalIcon}
                        subtitle={`${metrics.satelliteStatus.total} total satellites monitored`}
                        delay={0.4}
                    />
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Satellite Status Overview */}
                    <motion.div
                        className="console-panel p-6"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="section-header">
                            <h2>Satellite Fleet Status</h2>
                            <div className="divider" />
                        </div>

                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                            {satellites.map((sat, i) => (
                                <motion.div
                                    key={sat.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-space-800/30 hover:bg-space-700/30 transition-colors cursor-pointer"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + i * 0.03 }}
                                    onClick={() => navigate('/console')}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-space-700 flex items-center justify-center font-mono text-sm font-bold text-white">
                                            {sat.id}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-white">{sat.name}</div>
                                            <div className="text-xs text-slate-500">{sat.constellation} • {sat.orbit}</div>
                                        </div>
                                    </div>
                                    <StatusBadge status={sat.status} />
                                </motion.div>
                            ))}
                        </div>

                        <button
                            onClick={() => navigate('/console')}
                            className="w-full mt-4 py-2 text-sm text-stellar-primary hover:text-white transition-colors flex items-center justify-center gap-2"
                        >
                            View Satellite Console
                            <ArrowRightIcon className="w-4 h-4" />
                        </button>
                    </motion.div>

                    {/* Model Performance Comparison */}
                    <motion.div
                        className="console-panel p-6"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="section-header">
                            <h2>Model Performance vs Baseline</h2>
                            <div className="divider" />
                        </div>

                        <div className="space-y-4">
                            {/* RMSE Comparison by Horizon */}
                            <div className="grid grid-cols-4 gap-3">
                                {[
                                    { label: '15m', baseline: modelComparison.baseline.rmse15m, stellar: modelComparison.stellar.rmse15m },
                                    { label: '1h', baseline: modelComparison.baseline.rmse1h, stellar: modelComparison.stellar.rmse1h },
                                    { label: '6h', baseline: modelComparison.baseline.rmse6h, stellar: modelComparison.stellar.rmse6h },
                                    { label: '24h', baseline: modelComparison.baseline.rmse24h, stellar: modelComparison.stellar.rmse24h },
                                ].map((item, i) => (
                                    <motion.div
                                        key={item.label}
                                        className="text-center p-4 rounded-lg bg-space-800/50 border border-console-border"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 + i * 0.1 }}
                                    >
                                        <div className="text-xs font-mono text-slate-400 mb-2">+{item.label}</div>
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-slate-500">Base</span>
                                                <span className="text-stellar-amber font-mono">{item.baseline}</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-slate-500">Stellar</span>
                                                <span className="text-stellar-emerald font-mono">{item.stellar}</span>
                                            </div>
                                        </div>
                                        <div className="mt-2 pt-2 border-t border-console-border">
                                            <span className="text-stellar-cyan text-sm font-bold">
                                                -{Math.round((1 - item.stellar / item.baseline) * 100)}%
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Summary */}
                            <div className="p-4 rounded-lg bg-gradient-to-r from-stellar-primary/10 to-stellar-accent/10 border border-stellar-primary/20">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-stellar-primary/20 flex items-center justify-center">
                                        <ChartBarIcon className="w-5 h-5 text-stellar-primary" />
                                    </div>
                                    <div>
                                        <div className="text-white font-semibold">Average RMSE Reduction</div>
                                        <div className="text-sm text-slate-400">
                                            Stellar-v1k outperforms persistence baseline by{' '}
                                            <span className="text-stellar-cyan font-bold">58%</span>
                                            {' '}across all horizons
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        {
                            title: 'Satellite Console',
                            description: 'Deep dive into individual satellite forecasts and predictions',
                            icon: SignalIcon,
                            path: '/console',
                            color: 'from-stellar-primary to-stellar-secondary'
                        },
                        {
                            title: 'Forecast Lab',
                            description: 'Explore model architecture and multi-horizon predictions',
                            icon: ChartBarIcon,
                            path: '/forecast-lab',
                            color: 'from-stellar-cyan to-stellar-primary'
                        },
                        {
                            title: 'Export Bulletin',
                            description: 'Generate and download correction bulletins',
                            icon: PlayIcon,
                            path: '/export',
                            color: 'from-stellar-accent to-stellar-rose'
                        }
                    ].map((action, i) => (
                        <motion.button
                            key={action.title}
                            onClick={() => navigate(action.path)}
                            className="console-panel p-6 text-left group hover:border-stellar-primary/50 transition-all duration-300"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 + i * 0.1 }}
                            whileHover={{ scale: 1.02, y: -2 }}
                        >
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 group-hover:shadow-glow transition-shadow`}>
                                <action.icon className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-1">{action.title}</h3>
                            <p className="text-sm text-slate-400">{action.description}</p>
                            <div className="mt-4 flex items-center gap-2 text-stellar-primary">
                                <span className="text-sm">Open</span>
                                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </motion.button>
                    ))}
                </div>

                {/* Live Telemetry Panel */}
                <LiveTelemetryPanel satellites={satellites} />

                {/* Live Satellite Map */}
                <LiveSatelliteMap satellites={satellites} />

                {/* Space Live Feeds */}
                <SpaceLiveFeeds />

                {/* Evidence Strip */}
                <EvidenceStrip
                    validationWindow="Day 7 → Day 8"
                    baselineRMSE="0.42 ns"
                    stellarRMSE="0.18 ns"
                    improvement="57%"
                />
            </div>
        </div>
    );
};

export default CommandDeck;
