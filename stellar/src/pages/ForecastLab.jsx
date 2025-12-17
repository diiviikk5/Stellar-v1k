import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CpuChipIcon,
    ClockIcon,
    CubeTransparentIcon,
    AdjustmentsHorizontalIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';
import { Header, EvidenceStrip, ArchitectureDiagram, HorizonSelector } from '../components';
import { horizonLabels, modelComparison } from '../data/mockData';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    Cell
} from 'recharts';

const ForecastLab = () => {
    const [activeTab, setActiveTab] = useState('architecture');
    const [selectedHorizon, setSelectedHorizon] = useState('2h');

    const tabs = [
        { id: 'architecture', label: 'Architecture', icon: CpuChipIcon },
        { id: 'training', label: 'Training Window', icon: ClockIcon },
        { id: 'multihorizon', label: 'Multi-Horizon Head', icon: CubeTransparentIcon },
    ];

    const comparisonData = [
        { horizon: '15m', Baseline: modelComparison.baseline.rmse15m, Stellar: modelComparison.stellar.rmse15m },
        { horizon: '30m', Baseline: 0.52, Stellar: 0.22 },
        { horizon: '1h', Baseline: modelComparison.baseline.rmse1h, Stellar: modelComparison.stellar.rmse1h },
        { horizon: '2h', Baseline: 0.95, Stellar: 0.38 },
        { horizon: '4h', Baseline: 1.10, Stellar: 0.45 },
        { horizon: '6h', Baseline: modelComparison.baseline.rmse6h, Stellar: modelComparison.stellar.rmse6h },
        { horizon: '12h', Baseline: 1.72, Stellar: 0.68 },
        { horizon: '24h', Baseline: modelComparison.baseline.rmse24h, Stellar: modelComparison.stellar.rmse24h },
    ];

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload) return null;
        return (
            <div className="stellar-tooltip">
                <div className="text-xs text-slate-400 mb-2 border-b border-console-border pb-2">
                    Horizon: +{label}
                </div>
                {payload.map((entry, index) => (
                    <div key={index} className="flex justify-between gap-4">
                        <span className="text-slate-400">{entry.name}:</span>
                        <span className={`font-mono ${entry.name === 'Stellar' ? 'text-stellar-emerald' : 'text-stellar-amber'}`}>
                            {entry.value.toFixed(3)} ns
                        </span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen">
            <Header
                title="Forecast Lab"
                subtitle="Model Architecture & Multi-Horizon Prediction System"
            />

            <div className="p-6 space-y-6">
                {/* Tab Navigation */}
                <motion.div
                    className="console-panel p-1 inline-flex gap-1"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                relative flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-medium
                transition-all duration-300
                ${activeTab === tab.id
                                    ? 'text-white'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }
              `}
                        >
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-gradient-to-r from-stellar-primary to-stellar-secondary rounded-lg"
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                />
                            )}
                            <tab.icon className="w-4 h-4 relative z-10" />
                            <span className="relative z-10">{tab.label}</span>
                        </button>
                    ))}
                </motion.div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    {activeTab === 'architecture' && (
                        <motion.div
                            key="architecture"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                        >
                            {/* Architecture Diagram */}
                            <div className="console-panel p-6">
                                <div className="section-header">
                                    <h2>Transformer-LSTM Hybrid Architecture</h2>
                                    <div className="divider" />
                                </div>
                                <ArchitectureDiagram />
                            </div>

                            {/* Key Features */}
                            <div className="space-y-4">
                                {[
                                    {
                                        title: 'Self-Attention Mechanism',
                                        description: 'Captures long-range dependencies in satellite error evolution patterns across the 7-day training window.',
                                        icon: CubeTransparentIcon,
                                        color: 'from-stellar-primary to-stellar-cyan'
                                    },
                                    {
                                        title: 'Bidirectional LSTM Bridge',
                                        description: 'Preserves sequential memory and temporal ordering critical for time-series forecasting.',
                                        icon: AdjustmentsHorizontalIcon,
                                        color: 'from-stellar-cyan to-stellar-emerald'
                                    },
                                    {
                                        title: 'Multi-Horizon Parallel Decoding',
                                        description: 'Simultaneous prediction across 8 forecast horizons with shared feature extraction.',
                                        icon: ChartBarIcon,
                                        color: 'from-stellar-emerald to-stellar-accent'
                                    },
                                    {
                                        title: 'Uncertainty Quantification',
                                        description: 'Gaussian mixture output layer provides calibrated confidence intervals for decision-making.',
                                        icon: CpuChipIcon,
                                        color: 'from-stellar-accent to-stellar-rose'
                                    }
                                ].map((feature, i) => (
                                    <motion.div
                                        key={feature.title}
                                        className="console-panel p-5 hover:border-stellar-primary/30 transition-colors"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                    >
                                        <div className="flex gap-4">
                                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center flex-shrink-0`}>
                                                <feature.icon className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h4 className="text-white font-semibold mb-1">{feature.title}</h4>
                                                <p className="text-sm text-slate-400">{feature.description}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'training' && (
                        <motion.div
                            key="training"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="console-panel p-6"
                        >
                            <div className="section-header">
                                <h2>Training Window Configuration</h2>
                                <div className="divider" />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Training Window Diagram */}
                                <div className="space-y-6">
                                    <div className="relative">
                                        {/* Timeline */}
                                        <div className="flex items-center gap-0 h-16">
                                            {[...Array(8)].map((_, i) => (
                                                <motion.div
                                                    key={i}
                                                    className={`
                            flex-1 h-12 flex items-center justify-center text-xs font-mono
                            ${i < 7
                                                            ? 'bg-stellar-primary/20 border-r border-stellar-primary/30'
                                                            : 'bg-stellar-accent/20'
                                                        }
                            ${i === 0 ? 'rounded-l-lg' : ''}
                            ${i === 7 ? 'rounded-r-lg' : ''}
                          `}
                                                    initial={{ opacity: 0, scaleX: 0 }}
                                                    animate={{ opacity: 1, scaleX: 1 }}
                                                    transition={{ delay: i * 0.1 }}
                                                >
                                                    <span className={i < 7 ? 'text-stellar-primary' : 'text-stellar-accent'}>
                                                        Day {i + 1}
                                                    </span>
                                                </motion.div>
                                            ))}
                                        </div>

                                        {/* Labels */}
                                        <div className="flex mt-3">
                                            <div className="flex-[7] text-center">
                                                <span className="text-xs text-slate-400 font-mono">← Input Window (7 days) →</span>
                                            </div>
                                            <div className="flex-1 text-center">
                                                <span className="text-xs text-stellar-accent font-mono">Target</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-lg bg-space-800/50 border border-console-border text-center">
                                            <div className="text-2xl font-display font-bold text-stellar-cyan">672</div>
                                            <div className="text-xs text-slate-500 font-mono">Time Steps/Satellite</div>
                                        </div>
                                        <div className="p-4 rounded-lg bg-space-800/50 border border-console-border text-center">
                                            <div className="text-2xl font-display font-bold text-stellar-cyan">15 min</div>
                                            <div className="text-xs text-slate-500 font-mono">Sampling Interval</div>
                                        </div>
                                        <div className="p-4 rounded-lg bg-space-800/50 border border-console-border text-center">
                                            <div className="text-2xl font-display font-bold text-stellar-cyan">12</div>
                                            <div className="text-xs text-slate-500 font-mono">Satellites Tracked</div>
                                        </div>
                                        <div className="p-4 rounded-lg bg-space-800/50 border border-console-border text-center">
                                            <div className="text-2xl font-display font-bold text-stellar-cyan">4</div>
                                            <div className="text-xs text-slate-500 font-mono">Error Components</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Data Flow */}
                                <div className="space-y-4">
                                    <h4 className="text-white font-semibold">Data Processing Pipeline</h4>

                                    {[
                                        { step: 1, title: 'Raw Telemetry Ingestion', desc: 'Collect broadcast vs precise ephemeris differences' },
                                        { step: 2, title: 'Error Decomposition', desc: 'Extract clock bias and orbital components (R/A/C)' },
                                        { step: 3, title: 'Normalization', desc: 'Z-score standardization per satellite' },
                                        { step: 4, title: 'Sequence Windowing', desc: 'Sliding windows of 672 points' },
                                        { step: 5, title: 'Feature Augmentation', desc: 'Add temporal embeddings and satellite metadata' }
                                    ].map((item, i) => (
                                        <motion.div
                                            key={item.step}
                                            className="flex items-start gap-4"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 + i * 0.1 }}
                                        >
                                            <div className="w-8 h-8 rounded-full bg-stellar-primary/20 border border-stellar-primary/50 flex items-center justify-center text-sm font-mono text-stellar-primary flex-shrink-0">
                                                {item.step}
                                            </div>
                                            <div>
                                                <div className="text-white font-medium">{item.title}</div>
                                                <div className="text-sm text-slate-400">{item.desc}</div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'multihorizon' && (
                        <motion.div
                            key="multihorizon"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            {/* Horizon Selector */}
                            <div className="console-panel p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-lg font-display font-semibold text-white">Multi-Horizon Performance</h3>
                                        <p className="text-sm text-slate-400">RMSE comparison across all prediction horizons</p>
                                    </div>
                                    <HorizonSelector
                                        horizons={horizonLabels}
                                        selectedHorizon={selectedHorizon}
                                        onSelect={setSelectedHorizon}
                                    />
                                </div>

                                {/* Bar Chart */}
                                <ResponsiveContainer width="100%" height={350}>
                                    <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(71, 85, 105, 0.3)" />
                                        <XAxis
                                            dataKey="horizon"
                                            stroke="#64748b"
                                            tick={{ fill: '#64748b', fontSize: 11 }}
                                            axisLine={{ stroke: '#334155' }}
                                        />
                                        <YAxis
                                            stroke="#64748b"
                                            tick={{ fill: '#64748b', fontSize: 11 }}
                                            axisLine={{ stroke: '#334155' }}
                                            label={{ value: 'RMSE (ns)', angle: -90, position: 'insideLeft', style: { fill: '#64748b', fontSize: 11 } }}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend
                                            wrapperStyle={{ paddingTop: 20 }}
                                            formatter={(value) => <span className="text-slate-300 text-sm">{value}</span>}
                                        />
                                        <Bar dataKey="Baseline" fill="#f59e0b" radius={[4, 4, 0, 0]}>
                                            {comparisonData.map((entry, index) => (
                                                <Cell
                                                    key={`baseline-${index}`}
                                                    fillOpacity={entry.horizon === selectedHorizon ? 1 : 0.5}
                                                />
                                            ))}
                                        </Bar>
                                        <Bar dataKey="Stellar" fill="#10b981" radius={[4, 4, 0, 0]}>
                                            {comparisonData.map((entry, index) => (
                                                <Cell
                                                    key={`stellar-${index}`}
                                                    fillOpacity={entry.horizon === selectedHorizon ? 1 : 0.5}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Horizon Details */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {comparisonData.slice(0, 4).map((item, i) => (
                                    <motion.div
                                        key={item.horizon}
                                        className={`console-panel p-4 ${item.horizon === selectedHorizon ? 'border-stellar-primary' : ''}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                    >
                                        <div className="text-center">
                                            <div className="text-xs text-slate-400 font-mono mb-2">+{item.horizon} Horizon</div>
                                            <div className="text-2xl font-display font-bold text-stellar-emerald">
                                                -{Math.round((1 - item.Stellar / item.Baseline) * 100)}%
                                            </div>
                                            <div className="text-xs text-slate-500 mt-1">RMSE Reduction</div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

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

export default ForecastLab;
