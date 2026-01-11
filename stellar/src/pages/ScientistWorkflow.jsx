import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CloudArrowUpIcon,
    CpuChipIcon,
    ChartBarIcon,
    DocumentTextIcon,
    CubeIcon,
    ChevronRightIcon,
    ChevronLeftIcon,
    BeakerIcon,
    ArrowRightIcon
} from '@heroicons/react/24/outline';
import { Header } from '../components';
import DataUpload from '../components/DataUpload';
import TrainingDashboard from '../components/TrainingDashboard';
import ModelEvaluation from '../components/ModelEvaluation';
import ModelExporter from '../components/ModelExporter';
import ISROEvaluationPanel from '../components/ISROEvaluationPanel';
import { prepareTrainingSequences, normalizeData } from '../utils/validation';
import { evaluateModel, predictFuture, AI_CONFIG } from '../services/aiService';
import { downloadPredictions, downloadTrainingHistory } from '../services/modelManager';

const ScientistWorkflow = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isroEvalData, setIsroEvalData] = useState(null);
    const [workflowData, setWorkflowData] = useState({
        data: null,
        statistics: null,
        fileName: null,
        config: {
            epochs: 50,
            batchSize: 32,
            learningRate: 0.001,
            validationSplit: 0.2
        },
        trainingResult: null,
        evaluationResults: null,
        model: null
    });

    const steps = [
        { id: 1, title: 'UPLOAD', subtitle: 'Load CSV Data', icon: CloudArrowUpIcon },
        { id: 2, title: 'CONFIGURE', subtitle: 'Set Training Parameters', icon: BeakerIcon },
        { id: 3, title: 'TRAIN', subtitle: 'Execute ML Training', icon: CpuChipIcon },
        { id: 4, title: 'EVALUATE', subtitle: 'Analyze Performance', icon: ChartBarIcon },
        { id: 5, title: 'DEPLOY', subtitle: 'Export & Deploy', icon: CubeIcon }
    ];

    const handleDataLoaded = (dataInfo) => {
        setWorkflowData(prev => ({
            ...prev,
            data: dataInfo.data,
            statistics: dataInfo.statistics,
            fileName: dataInfo.fileName
        }));
        setCurrentStep(1);
    };

    const handleTrainingComplete = (result) => {
        if (result.success) {
            setWorkflowData(prev => ({
                ...prev,
                trainingResult: result,
                model: result.normalizationParams
            }));
            setCurrentStep(3);
        }
    };

    const handleEvaluate = async () => {
        if (!workflowData.data || !workflowData.trainingResult) return;

        try {
            const result = await evaluateModel(
                workflowData.data,
                workflowData.trainingResult.normalizationParams
            );
            
            // Generate ISRO evaluation data
            const data = workflowData.data;
            const seqLen = AI_CONFIG?.sequenceLength || 48;
            
            if (data.length > seqLen + 10) {
                console.log('🔬 Generating ISRO evaluation data from user data...');
                const predictions = [];
                const actuals = [];
                const numEvalSamples = Math.min(50, data.length - seqLen);
                
                for (let i = 0; i < numEvalSamples; i++) {
                    const sequence = data.slice(i, i + seqLen);
                    const actualSample = data[i + seqLen];
                    
                    if (sequence.length === seqLen && actualSample) {
                        try {
                            const pred = await predictFuture(sequence);
                            if (pred) {
                                predictions.push({
                                    x: Array.isArray(pred.radial) ? pred.radial[0] : (pred.radial || 0),
                                    y: Array.isArray(pred.along) ? pred.along[0] : (pred.along || 0),
                                    z: Array.isArray(pred.cross) ? pred.cross[0] : (pred.cross || 0),
                                    clock: Array.isArray(pred.clock) ? pred.clock[0] : (pred.clock || 0)
                                });
                                actuals.push({
                                    x: actualSample.radial || actualSample.x_error || 0,
                                    y: actualSample.along || actualSample.y_error || 0,
                                    z: actualSample.cross || actualSample.z_error || 0,
                                    clock: actualSample.clock || actualSample.clock_error || 0
                                });
                            }
                        } catch (e) {
                            console.warn(`Prediction ${i} failed:`, e);
                        }
                    }
                }
                
                if (predictions.length > 0) {
                    setIsroEvalData({ predictions, actuals });
                    console.log(`✅ ISRO evaluation ready with ${predictions.length} samples`);
                }
            }
            
            setWorkflowData(prev => ({
                ...prev,
                evaluationResults: result
            }));
            setCurrentStep(4);
        } catch (error) {
            console.error('Evaluation error:', error);
        }
    };

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const canProceed = () => {
        switch (currentStep) {
            case 0:
                return workflowData.data !== null;
            case 1:
                return workflowData.data !== null;
            case 2:
                return workflowData.data !== null;
            case 3:
                return workflowData.trainingResult !== null;
            case 4:
                return true;
            default:
                return false;
        }
    };

    const ConfigOption = ({ label, value, options, onChange }) => (
        <div>
            <label className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest mb-2 block">
                {label}
            </label>
            <select
                value={value}
                onChange={onChange}
                className="w-full px-4 py-3 bg-slate-950 border-2 border-slate-700 text-white font-mono text-sm font-black uppercase tracking-widest focus:border-amber-500 focus:outline-none"
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950">
            <Header
                title="Scientist Workflow"
                subtitle="Complete ML Pipeline for GNSS Error Prediction"
            />

            <div className="p-8 max-w-7xl mx-auto">
                {/* Step Navigation */}
                <div className="flex border-2 border-slate-800 bg-slate-900 mb-8 overflow-x-auto">
                    {steps.map((step, index) => (
                        <button
                            key={step.id}
                            onClick={() => index <= currentStep && setCurrentStep(index)}
                            disabled={index > currentStep}
                            className={`
                                relative flex items-center gap-3 px-6 py-4 font-mono font-black text-[10px] uppercase tracking-widest
                                transition-all min-w-[180px]
                                ${index === currentStep
                                    ? 'bg-amber-600 text-black shadow-[4px_4px_0px_#000]'
                                    : index < currentStep
                                        ? 'text-slate-400 hover:bg-slate-800'
                                        : 'text-slate-600 cursor-not-allowed'
                                }
                            `}
                        >
                            <step.icon className="w-4 h-4" />
                            <div className="flex flex-col items-start">
                                <span className="leading-none">{step.title}</span>
                                <span className="text-[8px] font-bold leading-none mt-0.5">{step.subtitle}</span>
                            </div>
                            {index < steps.length - 1 && (
                                <ChevronRightIcon className="w-3 h-3 ml-2 text-slate-600" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Step Content */}
                <AnimatePresence mode="wait">
                    {/* Step 1: Data Upload */}
                    {currentStep === 0 && (
                        <motion.div
                            key="upload"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <DataUpload onDataLoaded={handleDataLoaded} />
                        </motion.div>
                    )}

                    {/* Step 2: Configure */}
                    {currentStep === 1 && (
                        <motion.div
                            key="configure"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="neo-panel bg-slate-900 border-2 border-slate-700 p-6">
                                <h3 className="text-sm font-mono font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3">
                                    <BeakerIcon className="w-5 h-5 text-amber-500" />
                                    TRAINING_CONFIGURATION
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <ConfigOption
                                        label="EPOCHS"
                                        value={workflowData.config.epochs}
                                        options={[
                                            { value: 10, label: '10 EPOCHS (QUICK)' },
                                            { value: 25, label: '25 EPOCHS (FAST)' },
                                            { value: 50, label: '50 EPOCHS (RECOMMENDED)' },
                                            { value: 100, label: '100 EPOCHS (THOROUGH)' }
                                        ]}
                                        onChange={(e) => setWorkflowData(prev => ({
                                            ...prev,
                                            config: { ...prev.config, epochs: parseInt(e.target.value) }
                                        }))}
                                    />

                                    <ConfigOption
                                        label="BATCH_SIZE"
                                        value={workflowData.config.batchSize}
                                        options={[
                                            { value: 16, label: '16 (SMALL)' },
                                            { value: 32, label: '32 (MEDIUM)' },
                                            { value: 64, label: '64 (LARGE)' },
                                            { value: 128, label: '128 (XL)' }
                                        ]}
                                        onChange={(e) => setWorkflowData(prev => ({
                                            ...prev,
                                            config: { ...prev.config, batchSize: parseInt(e.target.value) }
                                        }))}
                                    />

                                    <ConfigOption
                                        label="LEARNING_RATE"
                                        value={workflowData.config.learningRate}
                                        options={[
                                            { value: 0.0001, label: '0.0001 (CONSERVATIVE)' },
                                            { value: 0.001, label: '0.001 (RECOMMENDED)' },
                                            { value: 0.01, label: '0.01 (AGGRESSIVE)' }
                                        ]}
                                        onChange={(e) => setWorkflowData(prev => ({
                                            ...prev,
                                            config: { ...prev.config, learningRate: parseFloat(e.target.value) }
                                        }))}
                                    />

                                    <ConfigOption
                                        label="VALIDATION_SPLIT"
                                        value={workflowData.config.validationSplit}
                                        options={[
                                            { value: 0.1, label: '10% (MOST DATA)' },
                                            { value: 0.2, label: '20% (BALANCED)' },
                                            { value: 0.3, label: '30% (MORE VALIDATION)' }
                                        ]}
                                        onChange={(e) => setWorkflowData(prev => ({
                                            ...prev,
                                            config: { ...prev.config, validationSplit: parseFloat(e.target.value) }
                                        }))}
                                    />
                                </div>

                                {/* Data Summary */}
                                {workflowData.statistics && (
                                    <div className="bg-slate-950/50 border border-slate-800 p-4">
                                        <h4 className="text-xs font-mono font-black text-slate-400 uppercase tracking-widest mb-4">
                                            DATASET_SUMMARY
                                        </h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div>
                                                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Total Samples</div>
                                                <div className="text-lg font-mono font-black text-white">{workflowData.statistics.count}</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Duration</div>
                                                <div className="text-lg font-mono font-black text-white">{workflowData.statistics.timeRange.durationDays.toFixed(1)} days</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Train Samples</div>
                                                <div className="text-lg font-mono font-black text-emerald-400">
                                                    {Math.floor(workflowData.statistics.count * (1 - workflowData.config.validationSplit))}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Val Samples</div>
                                                <div className="text-lg font-mono font-black text-amber-400">
                                                    {Math.floor(workflowData.statistics.count * workflowData.config.validationSplit)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: Training */}
                    {currentStep === 2 && (
                        <motion.div
                            key="training"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <TrainingDashboard
                                data={workflowData.data}
                                config={workflowData.config}
                                onTrainingComplete={handleTrainingComplete}
                            />
                        </motion.div>
                    )}

                    {/* Step 4: Evaluation */}
                    {currentStep === 3 && (
                        <motion.div
                            key="evaluation"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="neo-panel bg-slate-900 border-2 border-slate-700 p-6 text-center">
                                <h3 className="text-sm font-mono font-black text-white uppercase tracking-widest mb-6 flex items-center justify-center gap-3">
                                    <ChartBarIcon className="w-5 h-5 text-amber-500" />
                                    MODEL_EVALUATION_READY
                                </h3>

                                <p className="text-sm text-slate-300 mb-6">
                                    Training has been completed. Click below to evaluate the model on test data and generate performance metrics.
                                </p>

                                <button
                                    onClick={handleEvaluate}
                                    className="px-8 py-4 bg-amber-600 text-black font-mono font-black text-xs uppercase tracking-[0.2em] border-2 border-amber-500 hover:bg-amber-500 hover:shadow-[4px_4px_0px_#000] transition-all inline-flex items-center gap-3"
                                >
                                    <ChartBarIcon className="w-5 h-5" />
                                    EVALUATE_MODEL
                                    <ArrowRightIcon className="w-5 h-5" />
                                </button>
                            </div>

                            {workflowData.trainingResult && (
                                <div className="neo-panel bg-slate-900 border-2 border-slate-700 p-6">
                                    <h4 className="text-xs font-mono font-black text-slate-400 uppercase tracking-widest mb-4 border-l-4 border-amber-500 pl-4">
                                        TRAINING_SUMMARY
                                    </h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="bg-slate-950 border border-slate-800 p-4">
                                            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Best Epoch</div>
                                            <div className="text-xl font-mono font-black text-white">
                                                {workflowData.trainingResult.metrics.bestEpoch}
                                            </div>
                                        </div>
                                        <div className="bg-slate-950 border border-slate-800 p-4">
                                            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Best Loss</div>
                                            <div className="text-xl font-mono font-black text-emerald-400">
                                                {workflowData.trainingResult.metrics.bestTrainLoss.toFixed(6)}
                                            </div>
                                        </div>
                                        <div className="bg-slate-950 border border-slate-800 p-4">
                                            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Val Loss</div>
                                            <div className="text-xl font-mono font-black text-amber-400">
                                                {workflowData.trainingResult.metrics.bestValLoss?.toFixed(6) || 'N/A'}
                                            </div>
                                        </div>
                                        <div className="bg-slate-950 border border-slate-800 p-4">
                                            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Duration</div>
                                            <div className="text-xl font-mono font-black text-blue-400">
                                                {workflowData.trainingResult.metrics.trainingDurationFormatted}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Step 4: Evaluation Results */}
                    {currentStep === 4 && (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            {/* ISRO Evaluation Panel */}
                            {isroEvalData && (
                                <div className="mb-8">
                                    <h3 className="text-lg font-mono font-black text-white uppercase tracking-widest mb-4 flex items-center gap-3">
                                        <BeakerIcon className="w-6 h-6 text-amber-500" />
                                        ISRO EVALUATION METRICS
                                    </h3>
                                    <ISROEvaluationPanel 
                                        predictions={isroEvalData.predictions}
                                        actuals={isroEvalData.actuals}
                                    />
                                </div>
                            )}
                            
                            {/* Standard Model Evaluation */}
                            <ModelEvaluation
                                evaluationResults={workflowData.evaluationResults}
                                onExport={(results) => downloadPredictions(results.predictions)}
                            />
                        </motion.div>
                    )}

                    {/* Step 5: Export/Deploy */}
                    {currentStep === 5 && (
                        <motion.div
                            key="deploy"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <ModelExporter
                                model={workflowData.model}
                                history={workflowData.trainingResult?.history}
                                evaluationResults={workflowData.evaluationResults}
                                onModelLoaded={(model, metadata) => {
                                    console.log('Model loaded:', model, metadata);
                                    alert('Model loaded successfully! (Full integration pending)');
                                }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 pt-6 border-t-2 border-slate-800">
                    <button
                        onClick={prevStep}
                        disabled={currentStep === 0}
                        className={`px-6 py-3 font-mono font-black text-xs uppercase tracking-[0.2em] border-2 transition-all flex items-center gap-2
                            ${currentStep === 0
                                ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
                                : 'bg-slate-950 border-slate-700 text-slate-300 hover:bg-slate-800'
                            }`}
                    >
                        <ChevronLeftIcon className="w-4 h-4" />
                        PREVIOUS
                    </button>

                    <button
                        onClick={nextStep}
                        disabled={!canProceed() || currentStep === 2 || currentStep === 5}
                        className={`px-6 py-3 font-mono font-black text-xs uppercase tracking-[0.2em] border-2 transition-all flex items-center gap-2
                            ${!canProceed() || currentStep === 2 || currentStep === 5
                                ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
                                : 'bg-amber-600 text-black border-amber-500 hover:bg-amber-500 hover:shadow-[4px_4px_0px_#000]'
                            }`}
                    >
                        NEXT
                        <ChevronRightIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScientistWorkflow;
