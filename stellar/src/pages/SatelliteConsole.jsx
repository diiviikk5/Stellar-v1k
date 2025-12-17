import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    InformationCircleIcon,
    AdjustmentsHorizontalIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ArrowTrendingUpIcon,
    CpuChipIcon,
    BoltIcon
} from '@heroicons/react/24/outline';
import {
    Header,
    EvidenceStrip,
    HorizonSelector,
    ForecastChart,
    SatelliteList,
    OrbitVisualizer,
    AIInferencePanel
} from '../components';
import { satellites, generateForecastData, horizonLabels } from '../data/mockData';
import { initializeAI, generateForecast, getAIStatus } from '../services/aiService';
import { generateHistoricalData } from '../services/liveDataService';
import { useAppStore } from '../store/appStore';

const SatelliteConsole = () => {
    const [selectedSatellite, setSelectedSatellite] = useState(satellites[0]);
    const [selectedSignal, setSelectedSignal] = useState('clock');
    const [selectedHorizon, setSelectedHorizon] = useState('2h');
    const [showBaseline, setShowBaseline] = useState(false);
    const [forecastData, setForecastData] = useState(null);
    const [aiForecast, setAiForecast] = useState(null);
    const [isAIInferencing, setIsAIInferencing] = useState(false);
    const [aiReady, setAiReady] = useState(false);
    const [inferenceTime, setInferenceTime] = useState(null);

    const addNotification = useAppStore(state => state.addNotification);

    // Initialize AI
    useEffect(() => {
        const init = async () => {
            try {
                await initializeAI();
                setAiReady(true);
            } catch (err) {
                console.error('AI init error:', err);
            }
        };
        init();
    }, []);

    // Generate AI forecast when satellite changes
    const runAIForecast = useCallback(async () => {
        if (!aiReady) return;

        setIsAIInferencing(true);
        const startTime = performance.now();

        try {
            const historicalData = generateHistoricalData(selectedSatellite.id, 7, 15);
            const result = await generateForecast(historicalData, selectedSatellite.id);
            setAiForecast(result);
            setInferenceTime(performance.now() - startTime);
        } catch (err) {
            console.error('AI forecast error:', err);
        } finally {
            setIsAIInferencing(false);
        }
    }, [selectedSatellite, aiReady]);

    // Run AI forecast when satellite changes
    useEffect(() => {
        if (aiReady) {
            runAIForecast();
        }
    }, [selectedSatellite, aiReady]);

    // Also generate mock data for chart visualization
    useEffect(() => {
        const data = generateForecastData(selectedSatellite.id, selectedSignal);
        setForecastData(data);
    }, [selectedSatellite, selectedSignal]);

    const prediction = useMemo(() => {
        // Use AI forecast if available
        if (aiForecast && aiForecast.forecasts) {
            const horizonMap = {
                '15m': 0, '30m': 1, '1h': 2, '2h': 3,
                '4h': 4, '6h': 5, '12h': 6, '24h': 7
            };
            const idx = horizonMap[selectedHorizon] || 3;
            const pred = aiForecast.forecasts[idx];
            if (pred) {
                return {
                    mean: pred.mean,
                    lower95: pred.lower95,
                    upper95: pred.upper95,
                    uncertainty: pred.std,
                    riskLevel: pred.riskLevel
                };
            }
        }

        // Fallback to mock data
        if (!forecastData) return null;

        const horizonIndex = {
            '15m': 1,
            '30m': 2,
            '1h': 4,
            '2h': 8,
            '4h': 16,
            '6h': 24,
            '12h': 48,
            '24h': 96
        }[selectedHorizon] || 8;

        const point = forecastData.forecast[Math.min(horizonIndex - 1, forecastData.forecast.length - 1)];

        if (!point) return null;

        return {
            mean: point.value,
            lower95: point.lower95,
            upper95: point.upper95,
            uncertainty: point.uncertainty,
            riskLevel: point.uncertainty > 0.3 ? 'HIGH' : point.uncertainty > 0.2 ? 'MEDIUM' : 'LOW'
        };
    }, [forecastData, aiForecast, selectedHorizon]);

    const getRiskConfig = (risk) => {
        switch (risk) {
            case 'HIGH':
                return { color: 'text-stellar-rose', bg: 'bg-stellar-rose/20', border: 'border-stellar-rose/30' };
            case 'MEDIUM':
                return { color: 'text-stellar-amber', bg: 'bg-stellar-amber/20', border: 'border-stellar-amber/30' };
            default:
                return { color: 'text-stellar-emerald', bg: 'bg-stellar-emerald/20', border: 'border-stellar-emerald/30' };
        }
    };

    return (
        <div className="min-h-screen">
            <Header
                title="Satellite Console"
                subtitle={`Monitoring ${selectedSatellite.name} (${selectedSatellite.id})`}
            />

            <div className="flex h-[calc(100vh-80px)]">
                {/* Left Sidebar - Controls */}
                <aside className="w-80 bg-space-900/50 border-r border-console-border overflow-y-auto">
                    <div className="p-4 space-y-6">
                        {/* AI Status */}
                        <div className="p-3 rounded-xl bg-space-800 border border-console-border">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <CpuChipIcon className="w-4 h-4 text-stellar-primary" />
                                    <span className="text-xs font-mono text-slate-400">AI ENGINE</span>
                                </div>
                                <span className={`text-xs font-mono ${aiReady ? 'text-stellar-emerald' : 'text-stellar-amber'}`}>
                                    {aiReady ? 'READY' : 'LOADING...'}
                                </span>
                            </div>
                            {inferenceTime && (
                                <div className="flex items-center gap-2 text-xs">
                                    <BoltIcon className="w-3 h-3 text-stellar-cyan" />
                                    <span className="text-slate-400">Last inference: <span className="text-stellar-cyan font-mono">{inferenceTime.toFixed(0)}ms</span></span>
                                </div>
                            )}
                            {isAIInferencing && (
                                <div className="flex items-center gap-2 text-xs mt-1">
                                    <motion.span
                                        className="w-2 h-2 rounded-full bg-stellar-primary"
                                        animate={{ opacity: [1, 0.3, 1] }}
                                        transition={{ duration: 0.8, repeat: Infinity }}
                                    />
                                    <span className="text-stellar-primary">Processing...</span>
                                </div>
                            )}
                        </div>

                        {/* Orbit Visualizer */}
                        <div className="flex justify-center">
                            <OrbitVisualizer
                                satellites={satellites}
                                selectedId={selectedSatellite.id}
                            />
                        </div>

                        {/* Signal Selection */}
                        <div>
                            <label className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2 block">
                                Signal Type
                            </label>
                            <select
                                value={selectedSignal}
                                onChange={(e) => setSelectedSignal(e.target.value)}
                                className="stellar-select"
                            >
                                <option value="clock">Clock Bias Error</option>
                                <option value="radial">Ephemeris: Radial</option>
                                <option value="along">Ephemeris: Along-Track</option>
                                <option value="cross">Ephemeris: Cross-Track</option>
                            </select>
                        </div>

                        {/* Horizon Slider */}
                        <div>
                            <label className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2 block">
                                Forecast Horizon
                            </label>
                            <HorizonSelector
                                horizons={horizonLabels}
                                selectedHorizon={selectedHorizon}
                                onSelect={setSelectedHorizon}
                            />
                        </div>

                        {/* Baseline Toggle */}
                        <div className="flex items-center justify-between p-3 rounded-lg bg-space-800/50 border border-console-border">
                            <div className="flex items-center gap-2">
                                <AdjustmentsHorizontalIcon className="w-4 h-4 text-slate-400" />
                                <span className="text-sm text-slate-300">Show Baseline</span>
                            </div>
                            <button
                                onClick={() => setShowBaseline(!showBaseline)}
                                className={`
                  w-12 h-6 rounded-full transition-colors duration-300 relative
                  ${showBaseline ? 'bg-stellar-primary' : 'bg-space-600'}
                `}
                            >
                                <motion.div
                                    className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md"
                                    animate={{ left: showBaseline ? 26 : 4 }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                />
                            </button>
                        </div>

                        {/* Satellite List */}
                        <div>
                            <label className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-3 block">
                                Satellite Selection
                            </label>
                            <SatelliteList
                                satellites={satellites}
                                selectedId={selectedSatellite.id}
                                onSelect={setSelectedSatellite}
                            />
                        </div>
                    </div>
                </aside>

                {/* Main Chart Area */}
                <div className="flex-1 flex flex-col">
                    {/* Chart Container */}
                    <div className="flex-1 p-6">
                        <motion.div
                            className="console-panel p-6 h-full"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-display font-semibold text-white">
                                        {selectedSignal === 'clock' ? 'Clock Bias Error' : `Ephemeris: ${selectedSignal.charAt(0).toUpperCase() + selectedSignal.slice(1)}`}
                                    </h3>
                                    <p className="text-sm text-slate-400">
                                        Historical data (24h) + Forecast ({selectedHorizon} horizon)
                                    </p>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-0.5 bg-gradient-to-r from-stellar-cyan to-stellar-primary rounded" />
                                        <span className="text-xs text-slate-400">Historical</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-0.5 bg-gradient-to-r from-stellar-primary to-stellar-accent rounded border-dashed" style={{ borderTop: '2px dashed' }} />
                                        <span className="text-xs text-slate-400">Forecast</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded bg-stellar-primary/30" />
                                        <span className="text-xs text-slate-400">95% CI</span>
                                    </div>
                                </div>
                            </div>

                            {forecastData && (
                                <ForecastChart
                                    pastData={forecastData.past}
                                    forecastData={forecastData.forecast}
                                    showBaseline={showBaseline}
                                    showConfidence={true}
                                    height={400}
                                />
                            )}

                            {/* Event Markers Legend */}
                            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-console-border">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-stellar-amber/50 border-2 border-stellar-amber" />
                                    <span className="text-xs text-slate-400">NOW (Last Data Point)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-stellar-primary/50 border-2 border-stellar-primary" />
                                    <span className="text-xs text-slate-400">Upload Boundary</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Bottom Panel - Prediction Details */}
                    <div className="p-6 pt-0">
                        <motion.div
                            className="console-panel p-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                {/* Predicted Drift */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <ArrowTrendingUpIcon className="w-4 h-4" />
                                        <span className="text-xs font-mono uppercase tracking-wider">
                                            Predicted Drift at +{selectedHorizon}
                                        </span>
                                    </div>
                                    <div className="text-3xl font-display font-bold text-gradient-primary">
                                        {prediction ? prediction.mean.toFixed(4) : '—'}
                                        <span className="text-lg text-slate-400 ml-1">ns</span>
                                    </div>
                                </div>

                                {/* Confidence Interval */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <InformationCircleIcon className="w-4 h-4" />
                                        <span className="text-xs font-mono uppercase tracking-wider">
                                            95% Confidence Interval
                                        </span>
                                    </div>
                                    <div className="text-2xl font-mono text-white">
                                        [{prediction ? prediction.lower95.toFixed(4) : '—'}, {prediction ? prediction.upper95.toFixed(4) : '—'}]
                                    </div>
                                </div>

                                {/* Uncertainty */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <ExclamationTriangleIcon className="w-4 h-4" />
                                        <span className="text-xs font-mono uppercase tracking-wider">
                                            Uncertainty (σ)
                                        </span>
                                    </div>
                                    <div className="text-2xl font-mono text-stellar-cyan">
                                        ±{prediction ? prediction.uncertainty.toFixed(4) : '—'}
                                        <span className="text-lg text-slate-400 ml-1">ns</span>
                                    </div>
                                </div>

                                {/* Risk Level */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <CheckCircleIcon className="w-4 h-4" />
                                        <span className="text-xs font-mono uppercase tracking-wider">
                                            Risk Assessment
                                        </span>
                                    </div>
                                    {prediction && (
                                        <div className={`
                      inline-flex items-center gap-2 px-4 py-2 rounded-lg
                      ${getRiskConfig(prediction.riskLevel).bg}
                      border ${getRiskConfig(prediction.riskLevel).border}
                    `}>
                                            <span className={`w-2 h-2 rounded-full ${getRiskConfig(prediction.riskLevel).color.replace('text-', 'bg-')} animate-pulse`} />
                                            <span className={`text-lg font-display font-bold ${getRiskConfig(prediction.riskLevel).color}`}>
                                                {prediction.riskLevel}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Evidence Strip */}
                    <EvidenceStrip
                        validationWindow="Day 7 → Day 8"
                        baselineRMSE="0.42 ns"
                        stellarRMSE="0.18 ns"
                        improvement="57%"
                    />
                </div>
            </div>
        </div>
    );
};

export default SatelliteConsole;
