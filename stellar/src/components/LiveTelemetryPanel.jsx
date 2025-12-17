/**
 * Live Telemetry Panel Component
 * Real-time satellite data visualization
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    SignalIcon,
    BoltIcon,
    ExclamationTriangleIcon,
    PlayIcon,
    PauseIcon
} from '@heroicons/react/24/outline';
import { useAppStore } from '../store/appStore';
import { startLiveStream, stopLiveStream, getFleetStatistics } from '../services/liveDataService';

const LiveTelemetryPanel = ({ satellites = [], compact = false }) => {
    const [isStreaming, setIsStreaming] = useState(false);
    const [selectedSat, setSelectedSat] = useState(null);
    const [fleetStats, setFleetStats] = useState(null);

    const liveUpdates = useAppStore(state => state.liveUpdates);
    const updateLiveData = useAppStore(state => state.updateLiveData);
    const addNotification = useAppStore(state => state.addNotification);

    // Start/stop all streams
    const toggleStreaming = () => {
        if (isStreaming) {
            satellites.forEach(sat => stopLiveStream(sat.id));
            setIsStreaming(false);
            addNotification({
                type: 'info',
                title: 'Live Telemetry Stopped',
                message: 'All satellite streams paused'
            });
        } else {
            satellites.forEach(sat => {
                startLiveStream(sat.id, (update, history) => {
                    updateLiveData(sat.id, update);

                    // Check for anomalies
                    if (update.status === 'anomaly') {
                        addNotification({
                            type: 'warning',
                            title: `Anomaly Detected: ${sat.id}`,
                            message: `${update.anomalyType?.replace('_', ' ')} detected`
                        });
                    }
                }, 1500);
            });
            setIsStreaming(true);
            addNotification({
                type: 'success',
                title: 'Live Telemetry Active',
                message: `Streaming from ${satellites.length} satellites`
            });
        }
    };

    // Update fleet stats periodically
    useEffect(() => {
        if (!isStreaming) return;

        const interval = setInterval(() => {
            setFleetStats(getFleetStatistics());
        }, 2000);

        return () => clearInterval(interval);
    }, [isStreaming]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            satellites.forEach(sat => stopLiveStream(sat.id));
        };
    }, []);

    if (compact) {
        return (
            <div className="flex items-center gap-3">
                <motion.button
                    onClick={toggleStreaming}
                    className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                        transition-all duration-300
                        ${isStreaming
                            ? 'bg-stellar-emerald/20 text-stellar-emerald border border-stellar-emerald/30'
                            : 'bg-space-700 text-slate-400 border border-console-border hover:border-stellar-primary/50'}
                    `}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {isStreaming ? (
                        <>
                            <motion.span
                                className="w-2 h-2 rounded-full bg-stellar-emerald"
                                animate={{ opacity: [1, 0.3, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                            />
                            LIVE
                            <PauseIcon className="w-4 h-4" />
                        </>
                    ) : (
                        <>
                            <PlayIcon className="w-4 h-4" />
                            Start Live Feed
                        </>
                    )}
                </motion.button>

                {isStreaming && fleetStats && (
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span>Avg Clock: <span className="text-stellar-cyan font-mono">{fleetStats.avgClockBias.toFixed(3)}ns</span></span>
                        <span>Anomalies: <span className={fleetStats.anomaliesDetected > 0 ? 'text-stellar-rose' : 'text-stellar-emerald'}>{fleetStats.anomaliesDetected}</span></span>
                    </div>
                )}
            </div>
        );
    }

    return (
        <motion.div
            className="console-panel p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="section-header mb-0">
                    <div className="flex items-center gap-3">
                        <SignalIcon className="w-5 h-5 text-stellar-primary" />
                        <h2>Live Telemetry</h2>
                        {isStreaming && (
                            <motion.span
                                className="px-2 py-0.5 text-xs rounded-full bg-stellar-emerald/20 text-stellar-emerald border border-stellar-emerald/30"
                                animate={{ opacity: [1, 0.6, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                STREAMING
                            </motion.span>
                        )}
                    </div>
                </div>

                <motion.button
                    onClick={toggleStreaming}
                    className={`
                        flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium
                        transition-all duration-300
                        ${isStreaming
                            ? 'bg-stellar-rose/20 text-stellar-rose border border-stellar-rose/30 hover:bg-stellar-rose/30'
                            : 'bg-gradient-to-r from-stellar-primary to-stellar-accent text-white shadow-glow'}
                    `}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {isStreaming ? (
                        <>
                            <PauseIcon className="w-4 h-4" />
                            Stop Stream
                        </>
                    ) : (
                        <>
                            <PlayIcon className="w-4 h-4" />
                            Start Live Feed
                        </>
                    )}
                </motion.button>
            </div>

            {/* Fleet Stats */}
            <AnimatePresence>
                {isStreaming && fleetStats && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="grid grid-cols-4 gap-4 mb-6"
                    >
                        <div className="p-4 rounded-lg bg-space-800/50 border border-console-border">
                            <div className="text-xs text-slate-500 font-mono mb-1">AVG CLOCK BIAS</div>
                            <div className="text-xl font-display font-bold text-stellar-cyan">
                                {fleetStats.avgClockBias.toFixed(3)}
                                <span className="text-sm text-slate-400 ml-1">ns</span>
                            </div>
                        </div>
                        <div className="p-4 rounded-lg bg-space-800/50 border border-console-border">
                            <div className="text-xs text-slate-500 font-mono mb-1">AVG RADIAL</div>
                            <div className="text-xl font-display font-bold text-stellar-primary">
                                {fleetStats.avgRadialError.toFixed(3)}
                                <span className="text-sm text-slate-400 ml-1">m</span>
                            </div>
                        </div>
                        <div className="p-4 rounded-lg bg-space-800/50 border border-console-border">
                            <div className="text-xs text-slate-500 font-mono mb-1">ACTIVE SATS</div>
                            <div className="text-xl font-display font-bold text-stellar-emerald">
                                {fleetStats.activeSatellites}
                            </div>
                        </div>
                        <div className="p-4 rounded-lg bg-space-800/50 border border-console-border">
                            <div className="text-xs text-slate-500 font-mono mb-1">ANOMALIES</div>
                            <div className={`text-xl font-display font-bold ${fleetStats.anomaliesDetected > 0 ? 'text-stellar-rose' : 'text-stellar-emerald'}`}>
                                {fleetStats.anomaliesDetected}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Satellite Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {satellites.map((sat, i) => {
                    const update = liveUpdates[sat.id];
                    const hasAnomaly = update?.status === 'anomaly';

                    return (
                        <motion.div
                            key={sat.id}
                            className={`
                                relative p-4 rounded-lg cursor-pointer transition-all
                                ${hasAnomaly
                                    ? 'bg-stellar-rose/10 border border-stellar-rose/30'
                                    : 'bg-space-800/50 border border-console-border hover:border-stellar-primary/50'}
                                ${selectedSat === sat.id ? 'ring-2 ring-stellar-primary' : ''}
                            `}
                            onClick={() => setSelectedSat(selectedSat === sat.id ? null : sat.id)}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.03 }}
                            whileHover={{ scale: 1.02 }}
                        >
                            {/* Status indicator */}
                            <div className="absolute top-2 right-2">
                                {isStreaming ? (
                                    <motion.span
                                        className={`w-2 h-2 rounded-full ${hasAnomaly ? 'bg-stellar-rose' : 'bg-stellar-emerald'}`}
                                        animate={hasAnomaly ? { scale: [1, 1.3, 1] } : { opacity: [1, 0.5, 1] }}
                                        transition={{ duration: hasAnomaly ? 0.5 : 1.5, repeat: Infinity }}
                                    />
                                ) : (
                                    <span className="w-2 h-2 rounded-full bg-slate-600" />
                                )}
                            </div>

                            <div className="font-mono text-sm font-bold text-white mb-1">{sat.id}</div>
                            <div className="text-xs text-slate-500 mb-3">{sat.constellation}</div>

                            {update ? (
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500">Clock</span>
                                        <span className="font-mono text-stellar-cyan">
                                            {update.clock?.bias?.toFixed(3) || '—'}ns
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500">Radial</span>
                                        <span className="font-mono text-stellar-primary">
                                            {update.ephemeris?.radial?.toFixed(3) || '—'}m
                                        </span>
                                    </div>

                                    {hasAnomaly && (
                                        <div className="mt-2 flex items-center gap-1 text-stellar-rose text-xs">
                                            <ExclamationTriangleIcon className="w-3 h-3" />
                                            {update.anomalyType?.replace('_', ' ')}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-xs text-slate-600">
                                    {isStreaming ? 'Connecting...' : 'Offline'}
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Selected Satellite Detail */}
            <AnimatePresence>
                {selectedSat && liveUpdates[selectedSat] && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6 p-4 rounded-lg bg-space-800/80 border border-stellar-primary/30"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-display font-semibold text-white">
                                {selectedSat} Detailed Telemetry
                            </h4>
                            <span className="text-xs text-slate-500 font-mono">
                                {new Date(liveUpdates[selectedSat].timestamp).toLocaleTimeString()}
                            </span>
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                            <div>
                                <div className="text-xs text-slate-500 mb-1">Clock Bias</div>
                                <div className="text-lg font-mono text-stellar-cyan">
                                    {liveUpdates[selectedSat].clock?.bias?.toFixed(4)} ns
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 mb-1">Radial</div>
                                <div className="text-lg font-mono text-stellar-primary">
                                    {liveUpdates[selectedSat].ephemeris?.radial?.toFixed(4)} m
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 mb-1">Along-Track</div>
                                <div className="text-lg font-mono text-stellar-accent">
                                    {liveUpdates[selectedSat].ephemeris?.alongTrack?.toFixed(4)} m
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 mb-1">Cross-Track</div>
                                <div className="text-lg font-mono text-stellar-emerald">
                                    {liveUpdates[selectedSat].ephemeris?.crossTrack?.toFixed(4)} m
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-console-border">
                            <div>
                                <div className="text-xs text-slate-500 mb-1">Signal Strength</div>
                                <div className="text-sm font-mono text-white">
                                    {liveUpdates[selectedSat].quality?.signalStrength?.toFixed(1)} dB-Hz
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 mb-1">Multipath</div>
                                <div className="text-sm font-mono text-white">
                                    {liveUpdates[selectedSat].quality?.multipath?.toFixed(3)} m
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 mb-1">Orbital Phase</div>
                                <div className="text-sm font-mono text-white">
                                    {liveUpdates[selectedSat].orbitalPhase?.toFixed(1)}°
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default LiveTelemetryPanel;
