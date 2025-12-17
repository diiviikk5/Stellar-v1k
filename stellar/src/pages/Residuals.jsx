import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    ChartBarIcon,
    ArrowPathIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';
import { Header, EvidenceStrip, ResidualHistogram, QQPlot, HorizonSelector, KPICard } from '../components';
import { generateResidualData, horizonLabels } from '../data/mockData';

const Residuals = () => {
    const [selectedHorizon, setSelectedHorizon] = useState('2h');
    const [residuals, setResiduals] = useState(() => generateResidualData(500));

    const refreshResiduals = () => {
        setResiduals(generateResidualData(500));
    };

    const stats = useMemo(() => {
        const mean = residuals.reduce((a, b) => a + b, 0) / residuals.length;
        const variance = residuals.reduce((a, b) => a + (b - mean) ** 2, 0) / residuals.length;
        const std = Math.sqrt(variance);
        const skewness = residuals.reduce((a, b) => a + ((b - mean) / std) ** 3, 0) / residuals.length;
        const kurtosis = residuals.reduce((a, b) => a + ((b - mean) / std) ** 4, 0) / residuals.length - 3;

        // Simplified normality score (higher is better)
        const normalityScore = Math.max(0, 1 - Math.abs(skewness) * 0.2 - Math.abs(kurtosis) * 0.1);

        return {
            mean: mean.toFixed(4),
            std: std.toFixed(4),
            skewness: skewness.toFixed(4),
            kurtosis: kurtosis.toFixed(4),
            normalityScore: normalityScore.toFixed(2),
            count: residuals.length
        };
    }, [residuals]);

    const horizonNormality = useMemo(() => {
        // Simulated normality scores by horizon (lower horizons = better normality)
        const baseScore = 0.95;
        const horizonMultiplier = {
            '15m': 0.02,
            '30m': 0.04,
            '1h': 0.06,
            '2h': 0.08,
            '4h': 0.10,
            '6h': 0.12,
            '12h': 0.16,
            '24h': 0.20
        };

        return horizonLabels.map(h => ({
            horizon: h,
            score: (baseScore - (horizonMultiplier[h] || 0)).toFixed(2)
        }));
    }, []);

    return (
        <div className="min-h-screen">
            <Header
                title="Uncertainty & Residuals"
                subtitle="Residual Distribution Analysis & Normality Assessment"
            />

            <div className="p-6 space-y-6">
                {/* Controls */}
                <motion.div
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <HorizonSelector
                        horizons={horizonLabels}
                        selectedHorizon={selectedHorizon}
                        onSelect={setSelectedHorizon}
                    />

                    <motion.button
                        onClick={refreshResiduals}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-space-800 border border-console-border text-slate-300 hover:text-white hover:border-stellar-primary transition-all"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <ArrowPathIcon className="w-4 h-4" />
                        <span className="text-sm">Refresh Analysis</span>
                    </motion.button>
                </motion.div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <KPICard
                        label="Normality Score"
                        value={stats.normalityScore}
                        color="emerald"
                        trend={parseFloat(stats.normalityScore) > 0.8 ? 'up' : 'down'}
                        icon={ChartBarIcon}
                        delay={0.1}
                    />
                    <KPICard
                        label="Mean (μ)"
                        value={stats.mean}
                        color="cyan"
                        icon={InformationCircleIcon}
                        delay={0.2}
                    />
                    <KPICard
                        label="Std Dev (σ)"
                        value={stats.std}
                        color="blue"
                        delay={0.3}
                    />
                    <KPICard
                        label="Skewness"
                        value={stats.skewness}
                        color={Math.abs(parseFloat(stats.skewness)) < 0.5 ? 'emerald' : 'amber'}
                        delay={0.4}
                    />
                    <KPICard
                        label="Kurtosis"
                        value={stats.kurtosis}
                        color={Math.abs(parseFloat(stats.kurtosis)) < 1 ? 'emerald' : 'amber'}
                        delay={0.5}
                    />
                </div>

                {/* Main Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Histogram */}
                    <motion.div
                        className="console-panel p-6"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="section-header">
                            <h2>Residual Distribution</h2>
                            <div className="divider" />
                        </div>
                        <p className="text-sm text-slate-400 mb-4">
                            Histogram of prediction residuals for horizon +{selectedHorizon}
                        </p>
                        <ResidualHistogram residuals={residuals} height={320} />

                        {/* Normal overlay legend */}
                        <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-console-border">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded bg-stellar-primary/60" />
                                <span className="text-xs text-slate-400">Observed Distribution</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-8 h-0.5 border-t-2 border-stellar-amber border-dashed" />
                                <span className="text-xs text-slate-400">Mean</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Q-Q Plot */}
                    <motion.div
                        className="console-panel p-6"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="section-header">
                            <h2>Q-Q Plot (Normality Check)</h2>
                            <div className="divider" />
                        </div>
                        <p className="text-sm text-slate-400 mb-4">
                            Quantile-quantile comparison against standard normal distribution
                        </p>
                        <QQPlot residuals={residuals} height={320} />

                        {/* Interpretation */}
                        <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-console-border">
                            <div className="flex items-center gap-2">
                                <span className="w-8 h-0.5 bg-stellar-emerald" style={{ borderTop: '2px dashed #10b981' }} />
                                <span className="text-xs text-slate-400">Reference Line (y = x)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-stellar-primary/60" />
                                <span className="text-xs text-slate-400">Sample Quantiles</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Normality by Horizon */}
                <motion.div
                    className="console-panel p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="section-header">
                        <h2>Normality Score by Horizon</h2>
                        <div className="divider" />
                    </div>
                    <p className="text-sm text-slate-400 mb-6">
                        How residual normality changes across different prediction horizons
                    </p>

                    <div className="flex items-end justify-between gap-4 h-48">
                        {horizonNormality.map((item, i) => {
                            const height = parseFloat(item.score) * 100;
                            const isSelected = item.horizon === selectedHorizon;
                            return (
                                <motion.div
                                    key={item.horizon}
                                    className="flex-1 text-center"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 + i * 0.05 }}
                                >
                                    <div className="relative h-40 flex items-end justify-center mb-2">
                                        <motion.div
                                            className={`
                        w-full max-w-12 rounded-t-lg
                        ${isSelected
                                                    ? 'bg-gradient-to-t from-stellar-primary to-stellar-cyan'
                                                    : 'bg-gradient-to-t from-slate-700 to-slate-600'
                                                }
                        ${isSelected ? 'shadow-glow' : ''}
                      `}
                                            initial={{ height: 0 }}
                                            animate={{ height: `${height}%` }}
                                            transition={{ delay: 0.6 + i * 0.05, duration: 0.5 }}
                                        />
                                    </div>
                                    <div className={`text-xs font-mono ${isSelected ? 'text-stellar-cyan' : 'text-slate-400'}`}>
                                        {item.horizon}
                                    </div>
                                    <div className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-500'}`}>
                                        {item.score}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Interpretation */}
                    <div className="mt-6 p-4 rounded-lg bg-space-800/50 border border-console-border">
                        <div className="flex items-start gap-3">
                            <InformationCircleIcon className="w-5 h-5 text-stellar-cyan flex-shrink-0 mt-0.5" />
                            <div>
                                <div className="text-white font-medium mb-1">Interpretation</div>
                                <p className="text-sm text-slate-400">
                                    Normality scores closer to 1.0 indicate residuals follow a normal distribution closely.
                                    As forecast horizon increases, uncertainty grows and residuals may deviate from normality.
                                    For the selected horizon (+{selectedHorizon}), the normality score of{' '}
                                    <span className="text-stellar-cyan font-mono">
                                        {horizonNormality.find(h => h.horizon === selectedHorizon)?.score}
                                    </span>
                                    {' '}indicates{' '}
                                    {parseFloat(horizonNormality.find(h => h.horizon === selectedHorizon)?.score || '0') > 0.85
                                        ? 'excellent'
                                        : parseFloat(horizonNormality.find(h => h.horizon === selectedHorizon)?.score || '0') > 0.7
                                            ? 'good'
                                            : 'moderate'
                                    } calibration.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

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

export default Residuals;
