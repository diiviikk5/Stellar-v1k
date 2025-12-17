import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    DocumentArrowDownIcon,
    DocumentTextIcon,
    TableCellsIcon,
    CheckCircleIcon,
    ClockIcon,
    SignalIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Header, EvidenceStrip, StatusBadge } from '../components';
import { satellites, generateBulletinData, horizonLabels } from '../data/mockData';
import { exportToCSV } from '../utils/helpers';

const ExportBulletin = () => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [bulletinGenerated, setBulletinGenerated] = useState(false);
    const [bulletinData, setBulletinData] = useState(null);
    const [selectedFormat, setSelectedFormat] = useState('csv');
    const [selectedSatellites, setSelectedSatellites] = useState(satellites.map(s => s.id));
    const [selectedHorizons, setSelectedHorizons] = useState(['15m', '1h', '6h', '24h']);

    const handleGenerateBulletin = () => {
        setIsGenerating(true);
        setBulletinGenerated(false);

        // Simulate generation
        setTimeout(() => {
            const data = generateBulletinData();
            setBulletinData(data);
            setIsGenerating(false);
            setBulletinGenerated(true);
        }, 2000);
    };

    const handleDownload = () => {
        if (!bulletinData) return;

        const exportData = [];

        bulletinData
            .filter(sat => selectedSatellites.includes(sat.satelliteId))
            .forEach(sat => {
                sat.forecasts
                    .filter(f => selectedHorizons.includes(f.horizon))
                    .forEach(forecast => {
                        exportData.push({
                            satellite_id: sat.satelliteId,
                            satellite_name: sat.satelliteName,
                            constellation: sat.constellation,
                            orbit_type: sat.orbit,
                            status: sat.status,
                            horizon: forecast.horizon,
                            predicted_mean_ns: forecast.predictedMean,
                            uncertainty_ns: forecast.uncertainty,
                            ci_95_lower: forecast.confidence95Lower,
                            ci_95_upper: forecast.confidence95Upper,
                            risk_level: forecast.riskLevel,
                            generated_at: sat.generatedAt
                        });
                    });
            });

        const timestamp = new Date().toISOString().split('T')[0];
        exportToCSV(exportData, `stellar_v1k_bulletin_${timestamp}.csv`);
    };

    const summary = useMemo(() => {
        if (!bulletinData) return null;

        const filteredData = bulletinData.filter(sat => selectedSatellites.includes(sat.satelliteId));
        const allForecasts = filteredData.flatMap(sat =>
            sat.forecasts.filter(f => selectedHorizons.includes(f.horizon))
        );

        const highRisk = allForecasts.filter(f => f.riskLevel === 'HIGH').length;
        const mediumRisk = allForecasts.filter(f => f.riskLevel === 'MEDIUM').length;
        const lowRisk = allForecasts.filter(f => f.riskLevel === 'LOW').length;

        return {
            totalPredictions: allForecasts.length,
            highRisk,
            mediumRisk,
            lowRisk,
            satellites: filteredData.length,
            horizons: selectedHorizons.length
        };
    }, [bulletinData, selectedSatellites, selectedHorizons]);

    const toggleSatellite = (id) => {
        setSelectedSatellites(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const toggleHorizon = (h) => {
        setSelectedHorizons(prev =>
            prev.includes(h) ? prev.filter(x => x !== h) : [...prev, h]
        );
    };

    return (
        <div className="min-h-screen">
            <Header
                title="Export / Correction Bulletin"
                subtitle="Generate and download operational forecasting bulletins"
            />

            <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Configuration Panel */}
                    <motion.div
                        className="lg:col-span-1 space-y-6"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        {/* Format Selection */}
                        <div className="console-panel p-6">
                            <div className="section-header">
                                <h2>Export Format</h2>
                                <div className="divider" />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { id: 'csv', label: 'CSV', icon: TableCellsIcon, desc: 'Spreadsheet compatible' },
                                    { id: 'pdf', label: 'PDF', icon: DocumentTextIcon, desc: 'Printable report' }
                                ].map((format) => (
                                    <button
                                        key={format.id}
                                        onClick={() => setSelectedFormat(format.id)}
                                        className={`
                      p-4 rounded-lg border text-left transition-all duration-200
                      ${selectedFormat === format.id
                                                ? 'border-stellar-primary bg-stellar-primary/10'
                                                : 'border-console-border hover:border-stellar-primary/50'
                                            }
                    `}
                                    >
                                        <format.icon className={`w-6 h-6 mb-2 ${selectedFormat === format.id ? 'text-stellar-primary' : 'text-slate-400'}`} />
                                        <div className={`font-semibold ${selectedFormat === format.id ? 'text-white' : 'text-slate-300'}`}>
                                            {format.label}
                                        </div>
                                        <div className="text-xs text-slate-500">{format.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Satellite Selection */}
                        <div className="console-panel p-6">
                            <div className="section-header">
                                <h2>Satellites</h2>
                                <div className="divider" />
                            </div>

                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs text-slate-400">{selectedSatellites.length} of {satellites.length} selected</span>
                                <button
                                    onClick={() => setSelectedSatellites(
                                        selectedSatellites.length === satellites.length ? [] : satellites.map(s => s.id)
                                    )}
                                    className="text-xs text-stellar-primary hover:text-stellar-cyan"
                                >
                                    {selectedSatellites.length === satellites.length ? 'Deselect All' : 'Select All'}
                                </button>
                            </div>

                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {satellites.map((sat) => (
                                    <button
                                        key={sat.id}
                                        onClick={() => toggleSatellite(sat.id)}
                                        className={`
                      w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm
                      transition-all duration-200
                      ${selectedSatellites.includes(sat.id)
                                                ? 'bg-stellar-primary/10 text-white'
                                                : 'text-slate-400 hover:bg-white/5'
                                            }
                    `}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className={`
                        w-4 h-4 rounded border-2 flex items-center justify-center
                        ${selectedSatellites.includes(sat.id)
                                                    ? 'border-stellar-primary bg-stellar-primary'
                                                    : 'border-slate-500'
                                                }
                      `}>
                                                {selectedSatellites.includes(sat.id) && (
                                                    <CheckCircleIcon className="w-3 h-3 text-white" />
                                                )}
                                            </div>
                                            <span className="font-mono">{sat.id}</span>
                                        </div>
                                        <StatusBadge status={sat.status} size="sm" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Horizon Selection */}
                        <div className="console-panel p-6">
                            <div className="section-header">
                                <h2>Horizons</h2>
                                <div className="divider" />
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {horizonLabels.map((h) => (
                                    <button
                                        key={h}
                                        onClick={() => toggleHorizon(h)}
                                        className={`
                      px-3 py-1.5 rounded-lg text-sm font-mono
                      transition-all duration-200
                      ${selectedHorizons.includes(h)
                                                ? 'bg-stellar-primary text-white'
                                                : 'bg-space-700 text-slate-400 hover:text-white'
                                            }
                    `}
                                    >
                                        {h}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Preview & Generate Panel */}
                    <motion.div
                        className="lg:col-span-2 space-y-6"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        {/* Generate Button */}
                        <div className="console-panel p-8 text-center">
                            <motion.button
                                onClick={handleGenerateBulletin}
                                disabled={isGenerating || selectedSatellites.length === 0 || selectedHorizons.length === 0}
                                className={`
                  glow-button w-full max-w-md mx-auto
                  ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                                whileHover={!isGenerating ? { scale: 1.02 } : {}}
                                whileTap={!isGenerating ? { scale: 0.98 } : {}}
                            >
                                {isGenerating ? (
                                    <span className="flex items-center justify-center gap-3">
                                        <motion.div
                                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                        />
                                        Generating Bulletin...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-3">
                                        <DocumentArrowDownIcon className="w-5 h-5" />
                                        Generate Correction Bulletin
                                    </span>
                                )}
                            </motion.button>

                            <p className="text-xs text-slate-500 mt-4">
                                {selectedSatellites.length} satellites × {selectedHorizons.length} horizons = {selectedSatellites.length * selectedHorizons.length} predictions
                            </p>
                        </div>

                        {/* Generated Bulletin Preview */}
                        <AnimatePresence>
                            {bulletinGenerated && bulletinData && summary && (
                                <motion.div
                                    className="console-panel p-6"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="section-header mb-0">
                                            <h2>Bulletin Preview</h2>
                                            <div className="divider" />
                                        </div>

                                        <button
                                            onClick={handleDownload}
                                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-stellar-emerald/20 text-stellar-emerald border border-stellar-emerald/30 hover:bg-stellar-emerald/30 transition-colors"
                                        >
                                            <DocumentArrowDownIcon className="w-4 h-4" />
                                            Download {selectedFormat.toUpperCase()}
                                        </button>
                                    </div>

                                    {/* Summary Cards */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                        <div className="p-4 rounded-lg bg-space-800/50 border border-console-border text-center">
                                            <SignalIcon className="w-5 h-5 mx-auto text-stellar-cyan mb-2" />
                                            <div className="text-xl font-display font-bold text-white">{summary.satellites}</div>
                                            <div className="text-xs text-slate-500">Satellites</div>
                                        </div>
                                        <div className="p-4 rounded-lg bg-space-800/50 border border-console-border text-center">
                                            <ClockIcon className="w-5 h-5 mx-auto text-stellar-accent mb-2" />
                                            <div className="text-xl font-display font-bold text-white">{summary.totalPredictions}</div>
                                            <div className="text-xs text-slate-500">Predictions</div>
                                        </div>
                                        <div className="p-4 rounded-lg bg-stellar-rose/10 border border-stellar-rose/30 text-center">
                                            <ExclamationTriangleIcon className="w-5 h-5 mx-auto text-stellar-rose mb-2" />
                                            <div className="text-xl font-display font-bold text-stellar-rose">{summary.highRisk}</div>
                                            <div className="text-xs text-slate-500">High Risk</div>
                                        </div>
                                        <div className="p-4 rounded-lg bg-stellar-emerald/10 border border-stellar-emerald/30 text-center">
                                            <CheckCircleIcon className="w-5 h-5 mx-auto text-stellar-emerald mb-2" />
                                            <div className="text-xl font-display font-bold text-stellar-emerald">{summary.lowRisk}</div>
                                            <div className="text-xs text-slate-500">Low Risk</div>
                                        </div>
                                    </div>

                                    {/* Data Table Preview */}
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-console-border">
                                                    <th className="text-left py-3 px-4 text-slate-400 font-mono text-xs">SAT</th>
                                                    <th className="text-left py-3 px-4 text-slate-400 font-mono text-xs">HORIZON</th>
                                                    <th className="text-left py-3 px-4 text-slate-400 font-mono text-xs">PREDICTED (ns)</th>
                                                    <th className="text-left py-3 px-4 text-slate-400 font-mono text-xs">UNCERTAINTY</th>
                                                    <th className="text-left py-3 px-4 text-slate-400 font-mono text-xs">95% CI</th>
                                                    <th className="text-left py-3 px-4 text-slate-400 font-mono text-xs">RISK</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {bulletinData
                                                    .filter(sat => selectedSatellites.includes(sat.satelliteId))
                                                    .slice(0, 5)
                                                    .flatMap(sat =>
                                                        sat.forecasts
                                                            .filter(f => selectedHorizons.includes(f.horizon))
                                                            .slice(0, 2)
                                                            .map((forecast, fi) => (
                                                                <tr key={`${sat.satelliteId}-${forecast.horizon}`} className="border-b border-console-border/50 hover:bg-white/5">
                                                                    <td className="py-3 px-4">
                                                                        {fi === 0 && <span className="font-mono text-white">{sat.satelliteId}</span>}
                                                                    </td>
                                                                    <td className="py-3 px-4 text-slate-400 font-mono">{forecast.horizon}</td>
                                                                    <td className="py-3 px-4 text-stellar-cyan font-mono">{forecast.predictedMean}</td>
                                                                    <td className="py-3 px-4 text-slate-400 font-mono">±{forecast.uncertainty}</td>
                                                                    <td className="py-3 px-4 text-slate-500 font-mono text-xs">
                                                                        [{forecast.confidence95Lower}, {forecast.confidence95Upper}]
                                                                    </td>
                                                                    <td className="py-3 px-4">
                                                                        <span className={`
                                      badge text-xs
                                      ${forecast.riskLevel === 'HIGH' ? 'badge-error' :
                                                                                forecast.riskLevel === 'MEDIUM' ? 'badge-warning' : 'badge-success'}
                                    `}>
                                                                            {forecast.riskLevel}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                    )}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="mt-4 text-center text-xs text-slate-500">
                                        Showing preview of first 10 rows. Full bulletin contains {summary.totalPredictions} predictions.
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Bulletin Information */}
                        {!bulletinGenerated && (
                            <motion.div
                                className="console-panel p-6"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <div className="section-header">
                                    <h2>Bulletin Contents</h2>
                                    <div className="divider" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { field: 'Satellite ID', desc: 'Unique identifier for each GNSS satellite' },
                                        { field: 'Predicted Mean', desc: 'Best estimate of error at forecast horizon' },
                                        { field: 'Uncertainty (σ)', desc: 'Standard deviation of prediction' },
                                        { field: '95% Confidence Interval', desc: 'Lower and upper bounds' },
                                        { field: 'Risk Level', desc: 'LOW / MEDIUM / HIGH classification' },
                                        { field: 'Generation Timestamp', desc: 'ISO 8601 format timestamp' },
                                    ].map((item, i) => (
                                        <motion.div
                                            key={item.field}
                                            className="flex items-start gap-3 p-3 rounded-lg bg-space-800/30"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.4 + i * 0.05 }}
                                        >
                                            <CheckCircleIcon className="w-4 h-4 text-stellar-emerald flex-shrink-0 mt-0.5" />
                                            <div>
                                                <div className="text-white text-sm font-medium">{item.field}</div>
                                                <div className="text-xs text-slate-500">{item.desc}</div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
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
    );
};

export default ExportBulletin;
