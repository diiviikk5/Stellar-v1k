/**
 * ISRO Evaluation Panel Component
 * 
 * Displays all evaluation metrics required by ISRO:
 * - Priority 1: Shapiro-Wilk W statistic, p-value, hypothesis
 * - Priority 2: Mean and standard deviation of residuals
 * - Priority 3: Q-Q Plot visualization
 */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    ChartBarIcon,
    CheckCircleIcon,
    XCircleIcon,
    InformationCircleIcon,
    ArrowPathIcon,
    ArrowDownTrayIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';
import { shapiroWilkTest, calculateResidualStats, generateQQPlotData } from '../utils/statisticalTests';
import QQPlot from './QQPlot';

const ISROEvaluationPanel = ({ 
    predictions, 
    actuals, 
    isLoading = false,
    onEvaluate 
}) => {
    const [selectedParameter, setSelectedParameter] = useState('all');
    
    // Calculate evaluation metrics
    const evaluation = useMemo(() => {
        if (!predictions || !actuals || predictions.length === 0 || actuals.length === 0) {
            return null;
        }
        
        if (predictions.length !== actuals.length) {
            console.error('Predictions and actuals must have same length');
            return null;
        }
        
        // Calculate residuals for each parameter
        const residuals = {
            x: predictions.map((p, i) => (p.x || p.radial || 0) - (actuals[i].x || actuals[i].radial || 0)),
            y: predictions.map((p, i) => (p.y || p.along || 0) - (actuals[i].y || actuals[i].along || 0)),
            z: predictions.map((p, i) => (p.z || p.cross || 0) - (actuals[i].z || actuals[i].cross || 0)),
            clock: predictions.map((p, i) => (p.clock || 0) - (actuals[i].clock || 0))
        };
        
        // Evaluate each parameter
        const byParameter = {};
        let totalW = 0;
        let totalPValue = 0;
        
        for (const param of ['x', 'y', 'z', 'clock']) {
            const sw = shapiroWilkTest(residuals[param]);
            const stats = calculateResidualStats(residuals[param]);
            
            byParameter[param] = {
                shapiroWilk: sw,
                statistics: stats,
                residuals: residuals[param]
            };
            
            totalW += sw.W;
            totalPValue += sw.pValue;
        }
        
        // Average scores (equal weight as per ISRO)
        const avgW = totalW / 4;
        const avgPValue = totalPValue / 4;
        
        // Combined residuals
        const allResiduals = [
            ...residuals.x,
            ...residuals.y,
            ...residuals.z,
            ...residuals.clock
        ];
        
        const overallSW = shapiroWilkTest(allResiduals);
        const overallStats = calculateResidualStats(allResiduals);
        
        return {
            byParameter,
            overall: {
                shapiroWilk: overallSW,
                statistics: overallStats,
                averageW: avgW,
                averagePValue: avgPValue
            },
            allResiduals,
            residuals
        };
    }, [predictions, actuals]);
    
    // ISRO Benchmark values
    const BENCHMARK = {
        W: 0.9810,
        pValue: 0.5840,
        hypothesis: 0
    };
    
    // Download functions
    const downloadCSV = () => {
        if (!evaluation) return;
        
        // Create CSV content
        let csv = 'ISRO Evaluation Report\n';
        csv += `Generated: ${new Date().toISOString()}\n\n`;
        
        // Shapiro-Wilk Results
        csv += 'PRIORITY 1: SHAPIRO-WILK NORMALITY TEST\n';
        csv += 'Parameter,W-Statistic,p-Value,Hypothesis,Reject Null\n';
        for (const param of ['x', 'y', 'z', 'clock']) {
            const data = evaluation.byParameter[param];
            csv += `${param}_error,${data.shapiroWilk.W.toFixed(6)},${data.shapiroWilk.pValue.toFixed(6)},${data.shapiroWilk.hypothesis},${data.shapiroWilk.rejectNull}\n`;
        }
        csv += `AVERAGE,${evaluation.overall.averageW.toFixed(6)},${evaluation.overall.averagePValue.toFixed(6)},,\n\n`;
        
        // Residual Statistics
        csv += 'PRIORITY 2: RESIDUAL STATISTICS\n';
        csv += 'Parameter,Mean,Std Dev,Min,Max,Count\n';
        for (const param of ['x', 'y', 'z', 'clock']) {
            const stats = evaluation.byParameter[param].statistics;
            csv += `${param}_error,${stats.mean.toFixed(6)},${stats.std.toFixed(6)},${stats.min.toFixed(6)},${stats.max.toFixed(6)},${stats.count}\n`;
        }
        csv += `OVERALL,${evaluation.overall.statistics.mean.toFixed(6)},${evaluation.overall.statistics.std.toFixed(6)},${evaluation.overall.statistics.min.toFixed(6)},${evaluation.overall.statistics.max.toFixed(6)},${evaluation.overall.statistics.count}\n\n`;
        
        // Benchmark Comparison
        csv += 'BENCHMARK COMPARISON\n';
        csv += 'Metric,Your Score,ISRO Benchmark,Status\n';
        csv += `W-Statistic,${evaluation.overall.averageW.toFixed(4)},${BENCHMARK.W},${evaluation.overall.averageW >= BENCHMARK.W ? 'PASS' : 'BELOW'}\n`;
        csv += `p-Value,${evaluation.overall.averagePValue.toFixed(4)},${BENCHMARK.pValue},${evaluation.overall.averagePValue >= BENCHMARK.pValue ? 'PASS' : 'BELOW'}\n`;
        csv += `Hypothesis,${evaluation.overall.shapiroWilk.hypothesis},${BENCHMARK.hypothesis},${evaluation.overall.shapiroWilk.hypothesis === BENCHMARK.hypothesis ? 'PASS' : 'FAIL'}\n`;
        
        // Download
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ISRO_Evaluation_Report_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };
    
    const downloadResidualsCSV = () => {
        if (!evaluation || !predictions || !actuals) return;
        
        let csv = 'Index,X_Predicted,X_Actual,X_Residual,Y_Predicted,Y_Actual,Y_Residual,Z_Predicted,Z_Actual,Z_Residual,Clock_Predicted,Clock_Actual,Clock_Residual\n';
        
        for (let i = 0; i < predictions.length; i++) {
            const p = predictions[i];
            const a = actuals[i];
            csv += `${i},`;
            csv += `${(p.x || p.radial || 0).toFixed(6)},${(a.x || a.radial || 0).toFixed(6)},${evaluation.residuals.x[i].toFixed(6)},`;
            csv += `${(p.y || p.along || 0).toFixed(6)},${(a.y || a.along || 0).toFixed(6)},${evaluation.residuals.y[i].toFixed(6)},`;
            csv += `${(p.z || p.cross || 0).toFixed(6)},${(a.z || a.cross || 0).toFixed(6)},${evaluation.residuals.z[i].toFixed(6)},`;
            csv += `${(p.clock || 0).toFixed(6)},${(a.clock || 0).toFixed(6)},${evaluation.residuals.clock[i].toFixed(6)}\n`;
        }
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ISRO_Residuals_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };
    
    const downloadJSON = () => {
        if (!evaluation) return;
        
        const report = {
            generated: new Date().toISOString(),
            benchmark: BENCHMARK,
            results: {
                shapiroWilk: {
                    byParameter: Object.fromEntries(
                        Object.entries(evaluation.byParameter).map(([k, v]) => [k, v.shapiroWilk])
                    ),
                    overall: evaluation.overall.shapiroWilk,
                    averageW: evaluation.overall.averageW,
                    averagePValue: evaluation.overall.averagePValue
                },
                statistics: {
                    byParameter: Object.fromEntries(
                        Object.entries(evaluation.byParameter).map(([k, v]) => [k, v.statistics])
                    ),
                    overall: evaluation.overall.statistics
                },
                meetsBenchmark: evaluation.overall.averageW >= BENCHMARK.W
            },
            sampleCount: predictions.length
        };
        
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ISRO_Evaluation_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };
    
    if (isLoading) {
        return (
            <div className="neo-panel bg-slate-900 border-2 border-slate-700 p-8 flex items-center justify-center">
                <ArrowPathIcon className="w-8 h-8 text-amber-500 animate-spin" />
                <span className="ml-4 text-slate-400 font-mono">Evaluating predictions...</span>
            </div>
        );
    }
    
    if (!evaluation) {
        return (
            <div className="neo-panel bg-slate-900 border-2 border-slate-700 p-8">
                <div className="text-center text-slate-500 font-mono">
                    <InformationCircleIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">No evaluation data available</p>
                    <p className="text-xs mt-2">Train a model and run predictions to see ISRO evaluation metrics</p>
                </div>
            </div>
        );
    }
    
    const meetsBenchmark = evaluation.overall.averageW >= BENCHMARK.W;
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Header with Overall Score */}
            <div className={`neo-panel p-6 border-2 ${meetsBenchmark ? 'border-emerald-600 bg-emerald-950/20' : 'border-amber-600 bg-amber-950/20'}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {meetsBenchmark ? (
                            <CheckCircleIcon className="w-10 h-10 text-emerald-500" />
                        ) : (
                            <XCircleIcon className="w-10 h-10 text-amber-500" />
                        )}
                        <div>
                            <h2 className="text-xl font-mono font-black text-white uppercase tracking-widest">
                                ISRO EVALUATION RESULTS
                            </h2>
                            <p className={`text-sm font-mono ${meetsBenchmark ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {meetsBenchmark ? 'MEETS BENCHMARK ✓' : 'BELOW BENCHMARK'}
                            </p>
                        </div>
                    </div>
                    
                    <div className="text-right">
                        <div className="text-4xl font-mono font-black text-white">
                            {evaluation.overall.averageW.toFixed(4)}
                        </div>
                        <div className="text-xs font-mono text-slate-400">
                            AVG W-STATISTIC (Target: {BENCHMARK.W})
                        </div>
                    </div>
                </div>
                
                {/* Download Buttons */}
                <div className="flex gap-3 mt-6 pt-6 border-t border-slate-700">
                    <button
                        onClick={downloadCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-black font-mono font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 transition-all"
                    >
                        <ArrowDownTrayIcon className="w-4 h-4" />
                        Download Report (CSV)
                    </button>
                    <button
                        onClick={downloadResidualsCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-black font-mono font-black text-[10px] uppercase tracking-widest hover:bg-cyan-500 transition-all"
                    >
                        <DocumentTextIcon className="w-4 h-4" />
                        Download Residuals (CSV)
                    </button>
                    <button
                        onClick={downloadJSON}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-black font-mono font-black text-[10px] uppercase tracking-widest hover:bg-amber-500 transition-all"
                    >
                        <ArrowDownTrayIcon className="w-4 h-4" />
                        Download Full Report (JSON)
                    </button>
                </div>
            </div>
            
            {/* Priority 1: Shapiro-Wilk Test Results */}
            <div className="neo-panel bg-slate-900 border-2 border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-amber-500/20 flex items-center justify-center border border-amber-500/50 text-amber-500 font-mono font-black text-sm">
                        P1
                    </div>
                    <div>
                        <h3 className="text-sm font-mono font-black text-white uppercase tracking-widest">
                            SHAPIRO-WILK NORMALITY TEST
                        </h3>
                        <p className="text-[10px] font-mono text-slate-500">Priority 1 Evaluation Criteria</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {['x', 'y', 'z', 'clock'].map((param) => {
                        const data = evaluation.byParameter[param];
                        const paramLabel = param === 'clock' ? 'Clock Error' : `${param.toUpperCase()}_Error`;
                        
                        return (
                            <div 
                                key={param}
                                className={`p-4 border ${
                                    !data.shapiroWilk.rejectNull 
                                        ? 'border-emerald-800 bg-emerald-950/20' 
                                        : 'border-rose-800 bg-rose-950/20'
                                }`}
                            >
                                <div className="text-[10px] font-mono font-black text-slate-400 uppercase mb-2">
                                    {paramLabel}
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-[10px] font-mono text-slate-500">W-Stat:</span>
                                        <span className="text-sm font-mono font-black text-white">
                                            {data.shapiroWilk.W.toFixed(4)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[10px] font-mono text-slate-500">p-Value:</span>
                                        <span className="text-sm font-mono font-black text-amber-400">
                                            {data.shapiroWilk.pValue.toFixed(4)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[10px] font-mono text-slate-500">H0:</span>
                                        <span className={`text-xs font-mono font-black ${
                                            !data.shapiroWilk.rejectNull ? 'text-emerald-400' : 'text-rose-400'
                                        }`}>
                                            {data.shapiroWilk.hypothesis === 0 ? 'ACCEPT' : 'REJECT'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                {/* Average Score */}
                <div className="p-4 bg-slate-950 border border-slate-800">
                    <div className="grid grid-cols-3 gap-8 text-center">
                        <div>
                            <div className="text-2xl font-mono font-black text-white">
                                {evaluation.overall.averageW.toFixed(4)}
                            </div>
                            <div className="text-[10px] font-mono text-slate-500 uppercase">Avg W-Statistic</div>
                        </div>
                        <div>
                            <div className="text-2xl font-mono font-black text-amber-400">
                                {evaluation.overall.averagePValue.toFixed(4)}
                            </div>
                            <div className="text-[10px] font-mono text-slate-500 uppercase">Avg p-Value</div>
                        </div>
                        <div>
                            <div className={`text-2xl font-mono font-black ${
                                !evaluation.overall.shapiroWilk.rejectNull ? 'text-emerald-400' : 'text-rose-400'
                            }`}>
                                {evaluation.overall.shapiroWilk.hypothesis}
                            </div>
                            <div className="text-[10px] font-mono text-slate-500 uppercase">Hypothesis Result</div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Priority 2: Mean and Standard Deviation */}
            <div className="neo-panel bg-slate-900 border-2 border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-cyan-500/20 flex items-center justify-center border border-cyan-500/50 text-cyan-500 font-mono font-black text-sm">
                        P2
                    </div>
                    <div>
                        <h3 className="text-sm font-mono font-black text-white uppercase tracking-widest">
                            RESIDUAL STATISTICS
                        </h3>
                        <p className="text-[10px] font-mono text-slate-500">Priority 2 Evaluation Criteria (Mean & Std)</p>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-800">
                                <th className="p-3 text-[10px] font-mono font-black text-slate-400 uppercase">Parameter</th>
                                <th className="p-3 text-[10px] font-mono font-black text-slate-400 uppercase">Mean (m)</th>
                                <th className="p-3 text-[10px] font-mono font-black text-slate-400 uppercase">Std Dev (m)</th>
                                <th className="p-3 text-[10px] font-mono font-black text-slate-400 uppercase">Min (m)</th>
                                <th className="p-3 text-[10px] font-mono font-black text-slate-400 uppercase">Max (m)</th>
                                <th className="p-3 text-[10px] font-mono font-black text-slate-400 uppercase">Count</th>
                            </tr>
                        </thead>
                        <tbody>
                            {['x', 'y', 'z', 'clock'].map((param) => {
                                const stats = evaluation.byParameter[param].statistics;
                                return (
                                    <tr key={param} className="border-b border-slate-800/50">
                                        <td className="p-3 text-sm font-mono font-black text-white uppercase">
                                            {param === 'clock' ? 'Clock' : param.toUpperCase()}_Error
                                        </td>
                                        <td className="p-3 text-sm font-mono text-cyan-400">
                                            {stats.mean.toFixed(6)}
                                        </td>
                                        <td className="p-3 text-sm font-mono text-amber-400">
                                            {stats.std.toFixed(6)}
                                        </td>
                                        <td className="p-3 text-sm font-mono text-slate-300">
                                            {stats.min.toFixed(6)}
                                        </td>
                                        <td className="p-3 text-sm font-mono text-slate-300">
                                            {stats.max.toFixed(6)}
                                        </td>
                                        <td className="p-3 text-sm font-mono text-slate-500">
                                            {stats.count}
                                        </td>
                                    </tr>
                                );
                            })}
                            {/* Overall row */}
                            <tr className="bg-slate-950">
                                <td className="p-3 text-sm font-mono font-black text-emerald-400 uppercase">
                                    OVERALL
                                </td>
                                <td className="p-3 text-sm font-mono font-black text-cyan-400">
                                    {evaluation.overall.statistics.mean.toFixed(6)}
                                </td>
                                <td className="p-3 text-sm font-mono font-black text-amber-400">
                                    {evaluation.overall.statistics.std.toFixed(6)}
                                </td>
                                <td className="p-3 text-sm font-mono font-black text-slate-300">
                                    {evaluation.overall.statistics.min.toFixed(6)}
                                </td>
                                <td className="p-3 text-sm font-mono font-black text-slate-300">
                                    {evaluation.overall.statistics.max.toFixed(6)}
                                </td>
                                <td className="p-3 text-sm font-mono font-black text-slate-500">
                                    {evaluation.overall.statistics.count}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            {/* Priority 3: Q-Q Plot */}
            <div className="neo-panel bg-slate-900 border-2 border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-purple-500/20 flex items-center justify-center border border-purple-500/50 text-purple-500 font-mono font-black text-sm">
                        P3
                    </div>
                    <div>
                        <h3 className="text-sm font-mono font-black text-white uppercase tracking-widest">
                            Q-Q PLOT (NORMALITY VISUALIZATION)
                        </h3>
                        <p className="text-[10px] font-mono text-slate-500">Priority 3 Evaluation Criteria</p>
                    </div>
                </div>
                
                {/* Parameter selector */}
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => setSelectedParameter('all')}
                        className={`px-3 py-1 text-[10px] font-mono font-black uppercase ${
                            selectedParameter === 'all' 
                                ? 'bg-amber-500 text-black' 
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                    >
                        All
                    </button>
                    {['x', 'y', 'z', 'clock'].map((param) => (
                        <button
                            key={param}
                            onClick={() => setSelectedParameter(param)}
                            className={`px-3 py-1 text-[10px] font-mono font-black uppercase ${
                                selectedParameter === param 
                                    ? 'bg-amber-500 text-black' 
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                        >
                            {param}
                        </button>
                    ))}
                </div>
                
                <div className="bg-slate-950 border border-slate-800 p-4">
                    <QQPlot 
                        residuals={
                            selectedParameter === 'all' 
                                ? evaluation.allResiduals 
                                : evaluation.residuals[selectedParameter]
                        } 
                        height={350}
                    />
                </div>
                
                <div className="mt-4 text-[11px] font-mono text-slate-500">
                    <p>📊 Points on the diagonal line indicate normal distribution.</p>
                    <p>📍 Deviations from the line indicate outliers or non-normality.</p>
                </div>
            </div>
            
            {/* Benchmark Comparison */}
            <div className="neo-panel bg-slate-950 border-2 border-slate-800 p-6">
                <h3 className="text-sm font-mono font-black text-slate-400 uppercase tracking-widest mb-4">
                    ISRO BENCHMARK COMPARISON
                </h3>
                
                <div className="grid grid-cols-3 gap-6">
                    <div className="text-center p-4 border border-slate-800">
                        <div className="text-[10px] font-mono text-slate-500 uppercase mb-2">W-Statistic</div>
                        <div className="flex items-center justify-center gap-4">
                            <div>
                                <div className="text-xl font-mono font-black text-white">
                                    {evaluation.overall.averageW.toFixed(4)}
                                </div>
                                <div className="text-[9px] text-slate-600">YOUR SCORE</div>
                            </div>
                            <div className="text-slate-600">vs</div>
                            <div>
                                <div className="text-xl font-mono font-black text-amber-500">
                                    {BENCHMARK.W}
                                </div>
                                <div className="text-[9px] text-slate-600">BENCHMARK</div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="text-center p-4 border border-slate-800">
                        <div className="text-[10px] font-mono text-slate-500 uppercase mb-2">p-Value</div>
                        <div className="flex items-center justify-center gap-4">
                            <div>
                                <div className="text-xl font-mono font-black text-white">
                                    {evaluation.overall.averagePValue.toFixed(4)}
                                </div>
                                <div className="text-[9px] text-slate-600">YOUR SCORE</div>
                            </div>
                            <div className="text-slate-600">vs</div>
                            <div>
                                <div className="text-xl font-mono font-black text-amber-500">
                                    {BENCHMARK.pValue}
                                </div>
                                <div className="text-[9px] text-slate-600">BENCHMARK</div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="text-center p-4 border border-slate-800">
                        <div className="text-[10px] font-mono text-slate-500 uppercase mb-2">Hypothesis</div>
                        <div className="flex items-center justify-center gap-4">
                            <div>
                                <div className={`text-xl font-mono font-black ${
                                    evaluation.overall.shapiroWilk.hypothesis === 0 ? 'text-emerald-400' : 'text-rose-400'
                                }`}>
                                    {evaluation.overall.shapiroWilk.hypothesis}
                                </div>
                                <div className="text-[9px] text-slate-600">YOUR RESULT</div>
                            </div>
                            <div className="text-slate-600">vs</div>
                            <div>
                                <div className="text-xl font-mono font-black text-emerald-500">
                                    {BENCHMARK.hypothesis}
                                </div>
                                <div className="text-[9px] text-slate-600">TARGET</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ISROEvaluationPanel;
