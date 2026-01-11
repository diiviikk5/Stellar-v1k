import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CpuChipIcon,
    ClockIcon,
    CubeTransparentIcon,
    AdjustmentsHorizontalIcon,
    ChartBarIcon,
    BeakerIcon
} from '@heroicons/react/24/outline';
import { Header, EvidenceStrip, ArchitectureDiagram, HorizonSelector, ModelTrainer } from '../components';
import ISROEvaluationPanel from '../components/ISROEvaluationPanel';
import { horizonLabels } from '../data/mockData';
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
    const [selectedOrbit, setSelectedOrbit] = useState('MEO'); // Default to MEO (has more data)
    const [evaluationData, setEvaluationData] = useState(null); // For ISRO evaluation

    const tabs = [
        { id: 'architecture', label: 'ARCHITECTURE_NODE', icon: CpuChipIcon },
        { id: 'training', label: 'TRAINING_WINDOW', icon: ClockIcon },
        { id: 'evaluation', label: 'ISRO_EVALUATION', icon: BeakerIcon },
        { id: 'multihorizon', label: 'MULTI_HORIZON_LAYER', icon: CubeTransparentIcon },
    ];

    const comparisonData = [
        { horizon: '15m', Baseline: 0.42, Stellar: 0.18 },
        { horizon: '30m', Baseline: 0.52, Stellar: 0.22 },
        { horizon: '1h', Baseline: 0.65, Stellar: 0.28 },
        { horizon: '2h', Baseline: 0.95, Stellar: 0.38 },
        { horizon: '4h', Baseline: 1.10, Stellar: 0.45 },
        { horizon: '6h', Baseline: 1.35, Stellar: 0.52 },
        { horizon: '12h', Baseline: 1.72, Stellar: 0.68 },
        { horizon: '24h', Baseline: 2.15, Stellar: 0.82 },
    ];

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload) return null;
        return (
            <div className="bg-slate-950 border-2 border-slate-700 p-3 font-mono">
                <div className="text-[10px] text-slate-500 mb-2 border-b border-slate-800 pb-2 uppercase font-black">
                    HORIZON_SYNC: +{label}
                </div>
                {payload.map((entry, index) => (
                    <div key={index} className="flex justify-between gap-6 py-0.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">{entry.name}:</span>
                        <span className={`text-[10px] font-black ${entry.name === 'Stellar' ? 'text-emerald-500' : 'text-amber-500'}`}>
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
                subtitle="Model Validation & Neural Architecture Analysis"
            />

            <div className="p-8 space-y-8">
                {/* Tab Navigation */}
                <div className="flex border-2 border-slate-700 bg-slate-950/50 p-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                relative flex items-center gap-3 px-8 py-4 font-mono font-black text-[10px] uppercase tracking-widest
                                transition-all
                                ${activeTab === tab.id
                                    ? 'bg-amber-600 text-black shadow-[4px_4px_0px_#000]'
                                    : 'text-slate-500 hover:bg-slate-900 hover:text-slate-300'
                                }
                            `}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    {activeTab === 'architecture' && (
                        <motion.div
                            key="architecture"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                        >
                            {/* Architecture Diagram */}
                            <div className="neo-panel bg-slate-900">
                                <div className="flex items-center gap-4 mb-8">
                                    <h2 className="text-xl font-mono font-black uppercase tracking-widest text-white italic">TRANSFORMER_ENCODER_LSTM</h2>
                                    <div className="flex-1 h-[1px] bg-slate-800" />
                                </div>
                                <div className="bg-slate-950/50 border border-slate-800 p-8">
                                    <ArchitectureDiagram />
                                </div>
                            </div>

                            {/* Key Features */}
                            <div className="space-y-4">
                                {[
                                    {
                                        title: 'Self-Attention Layer',
                                        description: 'Captures long-range multi-decadal temporal dependencies in orbital perturbations.',
                                        icon: CubeTransparentIcon,
                                        tag: 'ENC_01'
                                    },
                                    {
                                        title: 'Bi-LSTM Recurrence',
                                        description: 'Maintains stateful memory of sequential epoch residuals across the 7-day window.',
                                        icon: AdjustmentsHorizontalIcon,
                                        tag: 'REC_02'
                                    },
                                    {
                                        title: 'Multi-Head Projection',
                                        description: 'Parallel decoding of R/A/C and clock components across 8 discrete horizons.',
                                        icon: ChartBarIcon,
                                        tag: 'OUT_03'
                                    },
                                    {
                                        title: 'UQ_Quantization',
                                        description: 'Gaussian Mixture Layer providing calibrated confidence intervals for mission safety.',
                                        icon: CpuChipIcon,
                                        tag: 'VAL_04'
                                    }
                                ].map((feature, i) => (
                                    <motion.div
                                        key={feature.title}
                                        className="neo-panel bg-slate-950 border-slate-800 p-6 flex gap-6 items-start hover:border-amber-500/30 group transition-all"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                    >
                                        <div className="w-12 h-12 bg-slate-900 border-2 border-slate-800 flex items-center justify-center text-amber-500 shadow-[4px_4px_0px_#000] group-hover:bg-amber-600 group-hover:text-black transition-all">
                                            <feature.icon className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="text-white font-mono font-black uppercase text-sm tracking-widest">{feature.title}</h4>
                                                <span className="text-[11px] font-mono font-black text-slate-300 bg-slate-900 px-2 py-0.5 border-2 border-slate-800">{feature.tag}</span>
                                            </div>
                                            <p className="text-[11px] text-slate-300 font-bold font-mono leading-relaxed">{feature.description}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'training' && (
                        <motion.div
                            key="training"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="neo-panel bg-slate-900 border-2 border-slate-700 p-8"
                        >
                            <div className="flex items-center gap-4 mb-8">
                                <h2 className="text-xl font-mono font-black uppercase tracking-widest text-white italic">ML_TRAINING_GROUND</h2>
                                <div className="flex-1 h-[1px] bg-slate-800" />
                                
                                {/* Orbit Type Selector */}
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono font-black text-slate-500 uppercase">ORBIT_TYPE:</span>
                                    <div className="flex gap-2">
                                        {['GEO', 'MEO'].map((orbit) => (
                                            <button
                                                key={orbit}
                                                onClick={() => setSelectedOrbit(orbit)}
                                                className={`px-4 py-2 text-[10px] font-mono font-black uppercase tracking-widest border-2 transition-all ${
                                                    selectedOrbit === orbit
                                                        ? 'bg-amber-500 border-amber-400 text-black'
                                                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                                                }`}
                                            >
                                                {orbit}
                                            </button>
                                        ))}
                                    </div>
                                    <span className="text-[9px] font-mono font-bold text-slate-600">
                                        {selectedOrbit === 'MEO' ? '(244 samples)' : '(142 samples)'}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-12">
                                <ModelTrainer 
                                    orbitType={selectedOrbit} 
                                    onEvaluationReady={(data) => {
                                        setEvaluationData(data);
                                        console.log('📊 Evaluation data ready:', data);
                                    }}
                                />

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8 border-t-2 border-slate-800">
                                    <div className="space-y-6">
                                        <h4 className="text-xs font-mono font-black text-slate-300 uppercase tracking-widest mb-4 border-l-4 border-amber-500 pl-4">DATA_PIPELINE_FLOW</h4>
                                        {[
                                            { step: '01', title: 'TELEMETRY_INGEST', desc: 'Precise ephemeris differential acquisition' },
                                            { step: '02', title: 'RESIDUAL_DECOMP', desc: 'R/A/C and clock bias extraction' },
                                            { step: '03', title: 'NORMALIZATION', desc: 'Z-score standardization across fleet' },
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center gap-6 p-4 bg-slate-950 border border-slate-800 font-mono">
                                                <div className="w-10 h-10 border-2 border-slate-700 flex items-center justify-center text-xs font-black text-slate-400">{item.step}</div>
                                                <div>
                                                    <div className="text-xs text-slate-100 font-black uppercase tracking-widest">{item.title}</div>
                                                    <div className="text-[11px] text-slate-400 font-bold uppercase mt-0.5">{item.desc}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="space-y-6">
                                        <h4 className="text-xs font-mono font-black text-slate-300 uppercase tracking-widest mb-4 border-l-4 border-slate-700 pl-4">VALIDATION_METRICS</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            {[
                                                { val: '672', label: 'TIME_STEPS' },
                                                { val: '15m', label: 'INTERVAL' },
                                                { val: '7D', label: 'LOOK_BACK' },
                                                { val: '4', label: 'TENSORS' }
                                            ].map((s, i) => (
                                                <div key={i} className="neo-panel bg-slate-950 border-slate-800 p-6 shadow-none text-center">
                                                    <div className="text-4xl font-mono font-black text-slate-100 italic">{s.val}</div>
                                                    <div className="text-[10px] font-mono font-black text-slate-500 mt-2 uppercase tracking-widest">{s.label}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'evaluation' && (
                        <motion.div
                            key="evaluation"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-8"
                        >
                            <div className="mb-6">
                                <h2 className="text-xl font-mono font-black uppercase tracking-widest text-white italic">ISRO_EVALUATION_DASHBOARD</h2>
                                <p className="text-[11px] text-slate-400 font-bold uppercase mt-2 tracking-widest">
                                    Shapiro-Wilk normality test, residual statistics, and Q-Q plots per ISRO SIH requirements
                                </p>
                            </div>
                            
                            {evaluationData ? (
                                <ISROEvaluationPanel 
                                    predictions={evaluationData.predictions}
                                    actuals={evaluationData.actuals}
                                />
                            ) : (
                                <div className="neo-panel bg-slate-900 border-2 border-slate-700 p-12 text-center">
                                    <BeakerIcon className="w-16 h-16 mx-auto text-slate-700 mb-6" />
                                    <h3 className="text-lg font-mono font-black text-slate-400 uppercase mb-2">
                                        No Evaluation Data
                                    </h3>
                                    <p className="text-[11px] font-mono text-slate-600 max-w-md mx-auto">
                                        Train a model in the TRAINING_WINDOW tab and run predictions to see ISRO evaluation metrics.
                                        The evaluation will compute Shapiro-Wilk W-statistic, p-value, and hypothesis result for each parameter.
                                    </p>
                                    <button
                                        onClick={() => setActiveTab('training')}
                                        className="mt-6 px-6 py-3 bg-amber-500 text-black font-mono font-black text-xs uppercase tracking-widest hover:bg-amber-400 transition-colors"
                                    >
                                        Go to Training
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'multihorizon' && (
                        <motion.div
                            key="multihorizon"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-8"
                        >
                            {/* Performance Chart */}
                            <div className="neo-panel bg-slate-900">
                                <div className="flex items-center justify-between mb-12 flex-wrap gap-4">
                                    <div>
                                        <h3 className="text-xl font-mono font-black text-white uppercase tracking-widest italic">MULTI_HORIZON_ERROR_DYNAMICS</h3>
                                        <p className="text-[11px] text-slate-300 font-bold uppercase mt-1 tracking-widest">Global RMSE validation across 8 temporal windows</p>
                                    </div>
                                    <HorizonSelector
                                        horizons={horizonLabels}
                                        selectedHorizon={selectedHorizon}
                                        onSelect={setSelectedHorizon}
                                    />
                                </div>

                                <div className="bg-slate-950/50 p-6 border border-slate-800">
                                    <ResponsiveContainer width="100%" height={400}>
                                        <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                            <XAxis
                                                dataKey="horizon"
                                                stroke="#94a3b8"
                                                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 800, fontFamily: 'monospace' }}
                                                axisLine={{ stroke: '#1e293b' }}
                                            />
                                            <YAxis
                                                stroke="#94a3b8"
                                                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 800, fontFamily: 'monospace' }}
                                                axisLine={{ stroke: '#1e293b' }}
                                                label={{ value: 'RESIDUAL_RMSE (ns)', angle: -90, position: 'insideLeft', style: { fill: '#94a3b8', fontSize: 11, fontWeight: 800, fontFamily: 'monospace' } }}
                                            />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend
                                                wrapperStyle={{ paddingTop: 30 }}
                                                formatter={(value) => <span className="text-slate-300 text-[11px] uppercase font-black font-mono tracking-[0.2em]">{value}</span>}
                                            />
                                            <Bar dataKey="Baseline" fill="#475569" radius={0}>
                                                {comparisonData.map((entry, index) => (
                                                    <Cell
                                                        key={`baseline-${index}`}
                                                        fillOpacity={entry.horizon === selectedHorizon ? 1 : 0.4}
                                                    />
                                                ))}
                                            </Bar>
                                            <Bar dataKey="Stellar" fill="#f59e0b" radius={0}>
                                                {comparisonData.map((entry, index) => (
                                                    <Cell
                                                        key={`stellar-${index}`}
                                                        fillOpacity={entry.horizon === selectedHorizon ? 1 : 0.7}
                                                    />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Impact Details */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {comparisonData.slice(0, 4).map((item, i) => (
                                    <motion.div
                                        key={item.horizon}
                                        className={`neo-panel bg-slate-950 border-slate-800 p-8 text-center transition-all ${item.horizon === selectedHorizon ? 'border-amber-500 shadow-[8px_8px_0px_#000]' : 'opacity-60 grayscale'}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                    >
                                        <div className="text-[11px] text-slate-300 font-mono font-black uppercase tracking-widest mb-4">@{item.horizon}_WINDOW</div>
                                        <div className="text-5xl font-mono font-black text-emerald-500 leading-none mb-2 italic">
                                            -{Math.round((1 - item.Stellar / item.Baseline) * 100)}%
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">RMSE_REDUCTION</div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Evidence Strip */}
                <div className="neo-panel bg-slate-950 border-slate-800 p-2 text-white">
                    <EvidenceStrip
                        validationWindow="EPOCH_7 → EPOCH_8"
                        baselineRMSE="0.428 ns"
                        stellarRMSE="0.182 ns"
                        improvement="57.41%"
                    />
                </div>
            </div>
        </div>
    );
};

export default ForecastLab;
