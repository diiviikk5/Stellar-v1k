import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CloudArrowUpIcon,
    DocumentTextIcon,
    CheckCircleIcon,
    XCircleIcon,
    ExclamationTriangleIcon,
    ChartBarIcon,
    ClockIcon,
    BeakerIcon,
    FolderIcon
} from '@heroicons/react/24/outline';
import { validateCSV, parseCSVData, calculateStatistics, generateDataPreview } from '../utils/validation';

const DataUpload = ({ onDataLoaded }) => {
    const [file, setFile] = useState(null);
    const [validation, setValidation] = useState(null);
    const [parsedData, setParsedData] = useState(null);
    const [statistics, setStatistics] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef(null);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files[0]);
        }
    }, []);

    const handleChange = useCallback((e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFiles(e.target.files[0]);
        }
    }, []);

    const handleFiles = async (uploadedFile) => {
        setFile(uploadedFile);
        setIsProcessing(true);
        setValidation(null);
        setParsedData(null);
        setStatistics(null);

        try {
            const validationResult = await validateCSV(uploadedFile);
            setValidation(validationResult);

            if (validationResult.isValid) {
                const text = await uploadedFile.text();
                const parseResult = parseCSVData(text);

                if (parseResult.data.length > 0) {
                    setParsedData(parseResult);
                    const stats = calculateStatistics(parseResult.data);
                    setStatistics(stats);

                    if (onDataLoaded) {
                        onDataLoaded({
                            data: parseResult.data,
                            statistics: stats,
                            fileName: uploadedFile.name,
                            fileSize: uploadedFile.size
                        });
                    }
                }
            }
        } catch (error) {
            setValidation({
                isValid: false,
                errors: [error.message],
                warnings: []
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const onButtonClick = () => {
        inputRef.current.click();
    };

    // Load sample ISRO data for demo
    const loadSampleData = async (datasetName) => {
        setIsProcessing(true);
        setValidation(null);
        setParsedData(null);
        setStatistics(null);
        setFile(null);

        try {
            const response = await fetch(`/data/${datasetName}`);
            if (!response.ok) throw new Error('Failed to load sample data');
            
            const text = await response.text();
            
            // Create a virtual file object
            const virtualFile = {
                name: datasetName,
                size: text.length
            };
            setFile(virtualFile);

            // Parse the data
            const parseResult = parseCSVData(text);
            
            if (parseResult.data.length > 0) {
                setParsedData(parseResult);
                const stats = calculateStatistics(parseResult.data);
                setStatistics(stats);

                setValidation({
                    isValid: true,
                    errors: [],
                    warnings: [],
                    rowCount: parseResult.data.length
                });

                if (onDataLoaded) {
                    onDataLoaded({
                        data: parseResult.data,
                        statistics: stats,
                        fileName: datasetName,
                        fileSize: text.length
                    });
                }
            }
        } catch (error) {
            setValidation({
                isValid: false,
                errors: [error.message],
                warnings: []
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    const getQualityColor = (level) => {
        switch (level) {
            case 'EXCELLENT': return 'text-emerald-400 border-emerald-500';
            case 'GOOD': return 'text-blue-400 border-blue-500';
            case 'FAIR': return 'text-amber-400 border-amber-500';
            case 'POOR': return 'text-rose-400 border-rose-500';
            default: return 'text-slate-400 border-slate-500';
        }
    };

    const StatCard = ({ icon: Icon, label, value, color = 'text-white' }) => (
        <div className="neo-panel bg-slate-950 border-slate-800 p-4">
            <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${color}`} />
                <div className="flex-1">
                    <div className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest">{label}</div>
                    <div className={`text-lg font-mono font-black ${color}`}>{value}</div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Upload Area */}
            <div className="neo-panel bg-slate-900 border-2 border-slate-700 p-8">
                <h3 className="text-sm font-mono font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3">
                    <CloudArrowUpIcon className="w-5 h-5 text-amber-500" />
                    DATA_INGESTION_MODULE
                </h3>

                <div
                    className={`relative border-2 border-dashed transition-all cursor-pointer
                        ${dragActive ? 'border-amber-500 bg-amber-500/5' : 'border-slate-600 hover:border-slate-500'}
                        ${file ? 'border-emerald-500/50 bg-emerald-500/5' : ''}
                    `}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={onButtonClick}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        className="hidden"
                        accept=".csv"
                        onChange={handleChange}
                    />

                    <div className="p-12 flex flex-col items-center justify-center text-center">
                        {isProcessing ? (
                            <div className="animate-pulse flex flex-col items-center">
                                <DocumentTextIcon className="w-16 h-16 text-amber-500 mb-4" />
                                <span className="text-sm font-mono font-black text-slate-300 uppercase tracking-widest">
                                    PROCESSING_DATA_STREAM
                                </span>
                            </div>
                        ) : file ? (
                            <div className="flex flex-col items-center">
                                <CheckCircleIcon className="w-16 h-16 text-emerald-500 mb-4" />
                                <div className="text-sm font-mono font-black text-white mb-2">
                                    {file.name}
                                </div>
                                <div className="text-xs font-mono font-bold text-slate-400">
                                    {formatBytes(file.size)}
                                </div>
                            </div>
                        ) : (
                            <>
                                <CloudArrowUpIcon className="w-16 h-16 text-slate-500 mb-4" />
                                <div className="text-sm font-mono font-black text-white mb-2">
                                    DRAG_DROP_CSV_FILE
                                </div>
                                <div className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest mb-4">
                                    OR_CLICK_TO_BROWSE
                                </div>
                                <div className="text-[10px] font-mono text-slate-600">
                                    SUPPORTED: CSV | MAX: 50MB
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Quick Load Sample Data */}
                {!file && !isProcessing && (
                    <div className="mt-6 pt-6 border-t border-slate-800">
                        <div className="flex items-center gap-3 mb-4">
                            <FolderIcon className="w-5 h-5 text-cyan-500" />
                            <span className="text-xs font-mono font-black text-slate-400 uppercase tracking-widest">
                                OR_QUICK_LOAD_SAMPLE_DATA
                            </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <button
                                type="button"
                                onClick={() => loadSampleData('DATA_MEO_Train2.csv')}
                                className="p-4 bg-slate-950 border-2 border-slate-700 hover:border-cyan-500 hover:bg-cyan-500/5 transition-all group cursor-pointer"
                            >
                                <div className="text-xs font-mono font-black text-cyan-400 group-hover:text-cyan-300">MEO_Train2</div>
                                <div className="text-[10px] font-mono text-slate-500 mt-1">244 samples</div>
                                <div className="text-[9px] font-mono text-emerald-500 mt-1">RECOMMENDED</div>
                            </button>
                            <button
                                type="button"
                                onClick={() => loadSampleData('DATA_MEO_Train.csv')}
                                className="p-4 bg-slate-950 border-2 border-slate-700 hover:border-amber-500 hover:bg-amber-500/5 transition-all group cursor-pointer"
                            >
                                <div className="text-xs font-mono font-black text-amber-400 group-hover:text-amber-300">MEO_Train</div>
                                <div className="text-[10px] font-mono text-slate-500 mt-1">90 samples</div>
                            </button>
                            <button
                                type="button"
                                onClick={() => loadSampleData('DATA_GEO_Train.csv')}
                                className="p-4 bg-slate-950 border-2 border-slate-700 hover:border-purple-500 hover:bg-purple-500/5 transition-all group cursor-pointer"
                            >
                                <div className="text-xs font-mono font-black text-purple-400 group-hover:text-purple-300">GEO_Train</div>
                                <div className="text-[10px] font-mono text-slate-500 mt-1">142 samples</div>
                            </button>
                            <button
                                type="button"
                                onClick={() => loadSampleData('DATA_MEO_Test.csv')}
                                className="p-4 bg-slate-950 border-2 border-slate-700 hover:border-rose-500 hover:bg-rose-500/5 transition-all group cursor-pointer"
                            >
                                <div className="text-xs font-mono font-black text-rose-400 group-hover:text-rose-300">MEO_Test</div>
                                <div className="text-[10px] font-mono text-slate-500 mt-1">Test Data</div>
                            </button>
                        </div>
                    </div>
                )}

                {/* Validation Results */}
                <AnimatePresence>
                    {validation && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mt-6 space-y-4"
                        >
                            {/* Errors */}
                            {validation.errors && validation.errors.length > 0 && (
                                <div className="bg-rose-900/10 border-2 border-rose-900/50 p-4 flex gap-4">
                                    <XCircleIcon className="w-6 h-6 text-rose-500 flex-shrink-0" />
                                    <div>
                                        <h4 className="text-xs font-mono font-black text-rose-500 uppercase tracking-widest mb-2">
                                            VALIDATION_ERRORS
                                        </h4>
                                        <ul className="text-[11px] font-bold text-rose-900 space-y-1">
                                            {validation.errors.map((error, i) => (
                                                <li key={i}>• {error}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {/* Warnings */}
                            {validation.warnings && validation.warnings.length > 0 && (
                                <div className="bg-amber-900/10 border-2 border-amber-900/50 p-4 flex gap-4">
                                    <ExclamationTriangleIcon className="w-6 h-6 text-amber-500 flex-shrink-0" />
                                    <div>
                                        <h4 className="text-xs font-mono font-black text-amber-500 uppercase tracking-widest mb-2">
                                            DATA_QUALITY_WARNINGS
                                        </h4>
                                        <ul className="text-[11px] font-bold text-amber-900 space-y-1">
                                            {validation.warnings.map((warning, i) => (
                                                <li key={i}>• {warning}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {/* Success */}
                            {validation.isValid && (
                                <div className="bg-emerald-900/10 border-2 border-emerald-900/50 p-4 flex gap-4">
                                    <CheckCircleIcon className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                                    <div>
                                        <h4 className="text-xs font-mono font-black text-emerald-500 uppercase tracking-widest mb-2">
                                            DATA_VALIDATION_SUCCESS
                                        </h4>
                                        <p className="text-[11px] font-bold text-emerald-900">
                                            {validation.rowCount || 0} data rows validated successfully
                                        </p>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Statistics Panel */}
            <AnimatePresence>
                {statistics && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="neo-panel bg-slate-900 border-2 border-slate-700 p-6"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-mono font-black text-white uppercase tracking-widest flex items-center gap-3">
                                <ChartBarIcon className="w-5 h-5 text-amber-500" />
                                DATA_ANALYTICS_MODULE
                            </h3>
                            <div className={`px-3 py-1 border-2 ${getQualityColor(statistics.dataQuality?.level)}`}>
                                <span className="text-[10px] font-mono font-black uppercase tracking-widest">
                                    QUALITY: {statistics.dataQuality?.level || 'N/A'}
                                </span>
                            </div>
                        </div>

                        {/* Time Range Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <StatCard
                                icon={ClockIcon}
                                label="TOTAL_SAMPLES"
                                value={statistics.count}
                                color="text-emerald-400"
                            />
                            <StatCard
                                icon={ClockIcon}
                                label="TIME_SPAN"
                                value={`${statistics.timeRange?.durationDays?.toFixed(1) || 0} DAYS`}
                                color="text-blue-400"
                            />
                            <StatCard
                                icon={BeakerIcon}
                                label="QUALITY_SCORE"
                                value={`${statistics.dataQuality?.score || 0}/100`}
                                color="text-amber-400"
                            />
                        </div>

                        {/* Feature Statistics */}
                        <h4 className="text-xs font-mono font-black text-slate-400 uppercase tracking-widest mb-4 border-l-4 border-amber-500 pl-4">
                            FEATURE_STATISTICS
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {['radial', 'along', 'cross', 'clockMeters'].map(feature => (
                                <div key={feature} className="bg-slate-950 border border-slate-800 p-4">
                                    <div className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest mb-3">
                                        {feature}
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[9px] font-mono text-slate-500">MEAN</span>
                                            <span className="text-xs font-mono font-black text-white">
                                                {statistics.features?.[feature]?.mean?.toFixed(4) || '0.0000'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[9px] font-mono text-slate-500">STD</span>
                                            <span className="text-xs font-mono font-black text-slate-300">
                                                {statistics.features?.[feature]?.std?.toFixed(4) || '0.0000'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[9px] font-mono text-slate-500">RANGE</span>
                                            <span className="text-xs font-mono font-black text-slate-300">
                                                {statistics.features?.[feature]?.range?.toFixed(4) || '0.0000'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[9px] font-mono text-slate-500">OUTLIERS</span>
                                            <span className={`text-xs font-mono font-black ${statistics.features?.[feature]?.outlierCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                                {statistics.features?.[feature]?.outlierCount || 0}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Recommendations */}
                        {statistics.dataQuality?.recommendations && statistics.dataQuality.recommendations.length > 0 && (
                            <div className="mt-6 bg-amber-900/10 border-2 border-amber-900/30 p-4">
                                <h4 className="text-xs font-mono font-black text-amber-500 uppercase tracking-widest mb-3">
                                    RECOMMENDATIONS
                                </h4>
                                <ul className="text-[11px] font-bold text-amber-900 space-y-2">
                                    {statistics.dataQuality.recommendations.map((rec, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <span className="text-amber-500 mt-0.5">▸</span>
                                            <span>{rec}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Data Preview */}
            <AnimatePresence>
                {parsedData && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="neo-panel bg-slate-900 border-2 border-slate-700 p-6"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-mono font-black text-white uppercase tracking-widest flex items-center gap-3">
                                <DocumentTextIcon className="w-5 h-5 text-amber-500" />
                                DATA_PREVIEW_MODULE
                            </h3>
                            <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">
                                SHOWING_FIRST_50_ROWS
                            </span>
                        </div>

                        <div className="overflow-x-auto max-h-[400px] overflow-y-auto custom-scrollbar">
                            <table className="w-full text-left">
                                <thead className="sticky top-0 bg-slate-950">
                                    <tr>
                                        {['UTC_TIME', 'RADIAL', 'ALONG', 'CROSS', 'CLOCK'].map(header => (
                                            <th key={header} className="px-4 py-3 text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest border-b-2 border-slate-700">
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {parsedData.data.slice(0, 50).map((row, i) => (
                                        <tr key={i} className="hover:bg-slate-950 transition-colors">
                                            <td className="px-4 py-2 text-[11px] font-mono text-slate-300 whitespace-nowrap border-b border-slate-800">
                                                {row.utc_time}
                                            </td>
                                            <td className="px-4 py-2 text-[11px] font-mono text-amber-400 font-black border-b border-slate-800">
                                                {parseFloat(row.radial).toFixed(4)}
                                            </td>
                                            <td className="px-4 py-2 text-[11px] font-mono text-emerald-400 font-black border-b border-slate-800">
                                                {parseFloat(row.along).toFixed(4)}
                                            </td>
                                            <td className="px-4 py-2 text-[11px] font-mono text-blue-400 font-black border-b border-slate-800">
                                                {parseFloat(row.cross).toFixed(4)}
                                            </td>
                                            <td className="px-4 py-2 text-[11px] font-mono text-slate-300 border-b border-slate-800">
                                                {parseFloat(row.clock).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DataUpload;
