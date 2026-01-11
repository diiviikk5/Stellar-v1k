/**
 * Model Manager Service
 * Handles saving, loading, and exporting trained TensorFlow.js models
 */

import * as tf from '@tensorflow/tfjs';

const STORAGE_KEY = 'stellar_saved_models';
const MAX_SAVED_MODELS = 5;

/**
 * Get all saved models from localStorage
 */
export function getSavedModels() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch (error) {
        console.error('Error loading saved models:', error);
        return [];
    }
}

/**
 * Save model metadata to localStorage
 */
export async function saveModelMetadata(metadata) {
    const models = getSavedModels();
    
    const newModel = {
        id: Date.now().toString(),
        ...metadata,
        savedAt: new Date().toISOString()
    };

    models.unshift(newModel);

    if (models.length > MAX_SAVED_MODELS) {
        models.pop();
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(models));
    return newModel;
}

/**
 * Delete a saved model
 */
export function deleteSavedModel(modelId) {
    const models = getSavedModels();
    const filtered = models.filter(m => m.id !== modelId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

/**
 * Export model to JSON format for download
 * @param {tf.LayersModel} model - TensorFlow.js model
 * @param {Object} metadata - Model metadata
 * @returns {Promise<string>} JSON string of the model
 */
export async function exportModelToJson(model, metadata) {
    const modelJson = await model.toJSON();
    
    const exportData = {
        format: 'STELLAR-v1k',
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        metadata: {
            ...metadata,
            tensorflowVersion: tf.version.tfjs,
            backend: tf.getBackend()
        },
        modelTopology: modelJson,
        weights: (await model.getWeights().map(async w => {
            return {
                name: w.name,
                shape: w.shape,
                dtype: w.dtype,
                data: Array.from(await w.data())
            };
        }))
    };

    return JSON.stringify(exportData, null, 2);
}

/**
 * Download model as JSON file
 */
export async function downloadModel(model, metadata, filename = 'stellar-model.json') {
    const modelJson = await exportModelToJson(model, metadata);
    const blob = new Blob([modelJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Download training history as CSV
 */
export function downloadTrainingHistory(history, filename = 'training-history.csv') {
    const rows = ['epoch,train_loss,val_loss,train_rmse,val_rmse'];
    
    history.forEach(h => {
        rows.push(`${h.epoch},${h.trainLoss.toFixed(6)},${h.valLoss?.toFixed(6) || ''},${h.trainRMSE?.toFixed(6) || ''},${h.valRMSE?.toFixed(6) || ''}`);
    });

    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Download predictions as CSV
 */
export function downloadPredictions(predictions, filename = 'predictions.csv') {
    const rows = ['timestamp,radial_actual,radial_predicted,along_actual,along_predicted,cross_actual,cross_predicted,clock_actual,clock_predicted'];
    
    predictions.forEach(p => {
        rows.push(`${p.timestamp},${p.actual.radial},${p.predicted.radial},${p.actual.along},${p.predicted.along},${p.actual.cross},${p.predicted.cross},${p.actual.clock},${p.predicted.clock}`);
    });

    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Load model from JSON file
 * @param {File} file - JSON file containing model
 * @returns {Promise<Object>} Model data and metadata
 */
export async function loadModelFromFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = async (e) => {
            try {
                const modelData = JSON.parse(e.target.result);
                
                if (modelData.format !== 'STELLAR-v1k') {
                    throw new Error('Invalid model format');
                }

                const model = await tf.models.modelFromJSON(modelData.modelTopology);
                
                if (modelData.weights) {
                    const weights = await Promise.all(modelData.weights.map(async w => {
                        const tensor = tf.tensor(w.data, w.shape, w.dtype);
                        return { name: w.name, tensor };
                    }));
                    model.setWeights(weights);
                }

                resolve({
                    model,
                    metadata: modelData.metadata
                });
            } catch (error) {
                reject(error);
            }
        };
        
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
}

/**
 * Generate model report
 */
export function generateModelReport(metadata, history, evaluationResults) {
    return `
STELLAR-v1k Model Training Report
=================================

Training Date: ${new Date().toISOString()}
Model ID: ${metadata.modelId}
Data Source: ${metadata.dataSource}

Dataset Information:
-------------------
Total Samples: ${metadata.totalSamples}
Training Samples: ${metadata.trainingSamples}
Validation Samples: ${metadata.validationSamples}
Sequence Length: ${metadata.sequenceLength}
Features: ${metadata.features}

Training Configuration:
----------------------
Epochs: ${metadata.epochs}
Batch Size: ${metadata.batchSize}
Learning Rate: ${metadata.learningRate}
Optimizer: ${metadata.optimizer}
Loss Function: ${metadata.lossFunction}

Training Results:
----------------
Final Training Loss: ${history[history.length - 1]?.trainLoss.toFixed(6) || 'N/A'}
Final Validation Loss: ${history[history.length - 1]?.valLoss?.toFixed(6) || 'N/A'}
Best Validation Loss: ${Math.min(...history.map(h => h.valLoss || Infinity)).toFixed(6)}
Training Time: ${metadata.trainingDuration}

${evaluationResults ? `Performance Metrics:
------------------
RMSE: ${evaluationResults.rmse.toFixed(4)}
MAE: ${evaluationResults.mae.toFixed(4)}
R² Score: ${evaluationResults.r2.toFixed(4)}
MAPE: ${evaluationResults.mape.toFixed(2)}%

Per-Feature Performance:
  Radial RMSE: ${evaluationResults.featureRMSE?.radial.toFixed(4)}
  Along RMSE: ${evaluationResults.featureRMSE?.along.toFixed(4)}
  Cross RMSE: ${evaluationResults.featureRMSE?.cross.toFixed(4)}
  Clock RMSE: ${evaluationResults.featureRMSE?.clock.toFixed(4)}
` : ''}

---
Generated by STELLAR-v1k GNSS Error Forecasting System
    `.trim();
}

/**
 * Download model report
 */
export function downloadModelReport(metadata, history, evaluationResults, filename = 'model-report.txt') {
    const report = generateModelReport(metadata, history, evaluationResults);
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Clear all saved models from localStorage
 */
export function clearAllSavedModels() {
    localStorage.removeItem(STORAGE_KEY);
}

export default {
    getSavedModels,
    saveModelMetadata,
    deleteSavedModel,
    exportModelToJson,
    downloadModel,
    downloadTrainingHistory,
    downloadPredictions,
    loadModelFromFile,
    generateModelReport,
    downloadModelReport,
    clearAllSavedModels
};
