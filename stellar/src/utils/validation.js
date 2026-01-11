/**
 * Data Validation Utility
 * Handles CSV validation, parsing, and data statistics for satellite telemetry data
 */

/**
 * Validate CSV file format
 * @param {File} file - CSV file to validate
 * @returns {Object} Validation result with isValid, errors, and warnings
 */
export async function validateCSV(file) {
    const errors = [];
    const warnings = [];
    let isValid = true;

    if (!file.name.endsWith('.csv')) {
        errors.push('File must be a CSV format (.csv)');
        isValid = false;
        return { isValid, errors, warnings };
    }

    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > 50) {
        errors.push('File size exceeds 50MB limit. Please split your data into smaller files.');
        isValid = false;
    }

    if (sizeMB < 0.001) {
        warnings.push('File appears to be empty or very small.');
    }

    const content = await file.text();
    const lines = content.trim().split('\n');

    if (lines.length < 2) {
        errors.push('CSV file must have at least a header row and one data row.');
        isValid = false;
        return { isValid, errors, warnings };
    }

    const header = lines[0].split(',').map(h => h.trim());
    const requiredColumns = ['utc_time', 'x_error', 'y_error', 'z_error', 'satclockerror'];
    const foundColumns = header.map(col => col.toLowerCase().replace(/[\s()]+/g, '_').replace('error', '_error'));

    const missingColumns = requiredColumns.filter(col => 
        !foundColumns.some(fc => fc.includes(col) || col.includes(fc.replace('_error', '')))
    );

    if (missingColumns.length > 0) {
        errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
        isValid = false;
    }

    const dataRows = lines.slice(1);
    let invalidRows = 0;

    for (let i = 0; i < Math.min(10, dataRows.length); i++) {
        const values = dataRows[i].split(',');
        if (values.length < 5) {
            invalidRows++;
        }
    }

    if (invalidRows > 0) {
        warnings.push(`${invalidRows} of first 10 rows have incorrect column count.`);
    }

    if (dataRows.length < 100) {
        warnings.push('Dataset has fewer than 100 rows. Model training may not be effective.');
    }

    const timePoints = dataRows.slice(0, 20).map(row => {
        const firstCol = row.split(',')[0];
        return parseTimestamp(firstCol);
    }).filter(t => t !== null);

    if (timePoints.length === 0) {
        warnings.push('Could not parse timestamps. Ensure first column is in date format.');
    }

    return { isValid, errors, warnings, rowCount: dataRows.length, header };
}

/**
 * Parse CSV content to array of data objects
 * @param {string} csvText - Raw CSV content
 * @returns {Array} Parsed data with validation
 */
export function parseCSVData(csvText) {
    const lines = csvText.trim().split('\n');
    const header = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/[\s()]+/g, '_').replace('error', '_error'));
    
    const data = [];
    const parseErrors = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = line.split(',').map(v => v.trim());
        
        if (values.length < 5) {
            parseErrors.push({ row: i + 1, error: 'Insufficient columns' });
            continue;
        }

        const timestamp = parseTimestamp(values[0]);
        if (!timestamp) {
            parseErrors.push({ row: i + 1, error: 'Invalid timestamp format' });
            continue;
        }

        const point = {
            timestamp,
            utc_time: values[0],
            radial: parseFloat(values[1]) || 0,
            along: parseFloat(values[2]) || 0,
            cross: parseFloat(values[3]) || 0,
            clock: (parseFloat(values[4]) || 0) / 0.3,
            clockMeters: parseFloat(values[4]) || 0
        };

        if (isNaN(point.radial) || isNaN(point.along) || isNaN(point.cross) || isNaN(point.clockMeters)) {
            parseErrors.push({ row: i + 1, error: 'Non-numeric values detected' });
        }

        data.push(point);
    }

    data.sort((a, b) => a.timestamp - b.timestamp);

    return {
        data,
        parseErrors,
        validRows: data.length,
        totalRows: lines.length - 1,
        errorRate: parseErrors.length / (lines.length - 1)
    };
}

/**
 * Parse various timestamp formats
 * @param {string} dateStr - Date string
 * @returns {number|null} Timestamp or null if invalid
 */
function parseTimestamp(dateStr) {
    const formats = [
        /(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})/,
        /(\d{4})-(\d{1,2})-(\d{1,2})\s+(\d{1,2}):(\d{2})/,
        /(\d{4})\/(\d{1,2})\/(\d{1,2})\s+(\d{1,2}):(\d{2})/
    ];

    for (const regex of formats) {
        const match = dateStr.match(regex);
        if (match) {
            const [_, a, b, c, d, e] = match;
            const nums = match.slice(1).map(Number);
            
            if (nums[0] > 1000) {
                return new Date(nums[0], nums[1] - 1, nums[2], nums[3], nums[4]).getTime();
            } else {
                return new Date(nums[2], nums[0] - 1, nums[1], nums[3], nums[4]).getTime();
            }
        }
    }

    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? null : parsed.getTime();
}

/**
 * Calculate comprehensive data statistics
 * @param {Array} data - Array of data points
 * @returns {Object} Statistics object
 */
export function calculateStatistics(data) {
    if (!data || data.length === 0) {
        return null;
    }

    const features = ['radial', 'along', 'cross', 'clock'];
    const stats = {
        count: data.length,
        timeRange: {
            start: new Date(data[0].timestamp).toISOString(),
            end: new Date(data[data.length - 1].timestamp).toISOString(),
            durationHours: (data[data.length - 1].timestamp - data[0].timestamp) / (1000 * 60 * 60),
            durationDays: (data[data.length - 1].timestamp - data[0].timestamp) / (1000 * 60 * 60 * 24)
        }
    };

    features.forEach(feature => {
        const values = data.map(d => d[feature]);
        stats[feature] = calculateFeatureStats(values);
    });

    stats.anomalies = detectAnomalies(data, stats);
    stats.dataQuality = assessDataQuality(data, stats);

    return stats;
}

/**
 * Calculate statistics for a single feature
 * @param {Array} values - Array of numeric values
 * @returns {Object} Feature statistics
 */
function calculateFeatureStats(values) {
    const n = values.length;
    const mean = values.reduce((a, b) => a + b, 0) / n;
    const sorted = [...values].sort((a, b) => a - b);
    const median = n % 2 === 0 ? (sorted[n/2 - 1] + sorted[n/2]) / 2 : sorted[Math.floor(n/2)];
    
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / n;
    const std = Math.sqrt(variance);
    
    const q1 = sorted[Math.floor(n * 0.25)];
    const q3 = sorted[Math.floor(n * 0.75)];
    const iqr = q3 - q1;
    
    const outliers = values.filter(v => v < q1 - 1.5 * iqr || v > q3 + 1.5 * iqr);
    
    return {
        mean,
        median,
        std,
        min: sorted[0],
        max: sorted[n - 1],
        range: sorted[n - 1] - sorted[0],
        q1,
        q3,
        iqr,
        outlierCount: outliers.length,
        outlierRate: outliers.length / n
    };
}

/**
 * Detect anomalies in the dataset
 * @param {Array} data - Data array
 * @param {Object} stats - Statistics object
 * @returns {Array} Array of anomalous data points
 */
function detectAnomalies(data, stats) {
    const anomalies = [];
    const threshold = 2.5;

    data.forEach((point, i) => {
        let score = 0;
        const features = ['radial', 'along', 'cross', 'clock'];
        
        features.forEach(feature => {
            const zScore = Math.abs((point[feature] - stats[feature].mean) / stats[feature].std);
            if (zScore > threshold) {
                score += zScore;
            }
        });

        if (score > threshold) {
            anomalies.push({
                index: i,
                timestamp: point.utc_time,
                score,
                severity: score > 6 ? 'CRITICAL' : score > 4 ? 'HIGH' : 'MEDIUM',
                data: { ...point }
            });
        }
    });

    return anomalies.sort((a, b) => b.score - a.score).slice(0, 10);
}

/**
 * Assess overall data quality
 * @param {Array} data - Data array
 * @param {Object} stats - Statistics object
 * @returns {Object} Quality assessment
 */
function assessDataQuality(data, stats) {
    const totalOutliers = stats.radial.outlierCount + stats.along.outlierCount + 
                          stats.cross.outlierCount + stats.clock.outlierCount;
    const outlierRate = totalOutliers / (data.length * 4);

    let quality = 'EXCELLENT';
    let score = 100;

    if (outlierRate > 0.15) {
        quality = 'POOR';
        score -= 40;
    } else if (outlierRate > 0.10) {
        quality = 'FAIR';
        score -= 25;
    } else if (outlierRate > 0.05) {
        quality = 'GOOD';
        score -= 10;
    }

    const hasHighVariance = Object.values(stats).some(s => 
        s.std && typeof s === 'object' && s.std !== undefined && 
        s.std / (Math.abs(s.mean) + 1) > 5
    );

    if (hasHighVariance) {
        score -= 15;
    }

    return {
        level: quality,
        score: Math.max(0, score),
        outlierRate,
        recommendations: generateRecommendations(stats, outlierRate)
    };
}

/**
 * Generate data quality recommendations
 * @param {Object} stats - Statistics object
 * @param {number} outlierRate - Outlier rate
 * @returns {Array} Array of recommendations
 */
function generateRecommendations(stats, outlierRate) {
    const recommendations = [];

    if (outlierRate > 0.10) {
        recommendations.push('Consider removing or correcting outliers (z-score > 2.5)');
    }

    const clockVariance = stats.clock ? stats.clock.std / (Math.abs(stats.clock.mean) + 1) : 0;
    if (clockVariance > 3) {
        recommendations.push('Clock error variance is high - check for time synchronization issues');
    }

    const duration = stats.timeRange.durationDays;
    if (duration < 7) {
        recommendations.push('Dataset covers less than 7 days - consider longer training window');
    } else if (duration > 90) {
        recommendations.push('Dataset covers more than 90 days - consider splitting by orbit cycle');
    }

    return recommendations;
}

/**
 * Prepare sequences for LSTM training
 * @param {Array} data - Normalized data array
 * @param {number} sequenceLength - Length of each sequence
 * @param {number} predictionHorizon - Steps to predict ahead
 * @returns {Object} Sequences and metadata
 */
export function prepareTrainingSequences(data, sequenceLength = 96, predictionHorizon = 1) {
    const sequences = [];
    const targets = [];

    for (let i = 0; i <= data.length - sequenceLength - predictionHorizon; i++) {
        const seq = data.slice(i, i + sequenceLength).map(d => [
            d.clock, d.radial, d.along, d.cross
        ]);

        const target = data[i + sequenceLength];
        targets.push([target.clock, target.radial, target.along, target.cross]);
        sequences.push(seq);
    }

    return {
        sequences,
        targets,
        sequenceCount: sequences.length,
        metadata: {
            sequenceLength,
            predictionHorizon,
            featuresPerStep: 4
        }
    };
}

/**
 * Normalize data using z-score normalization
 * @param {Array} data - Raw data array
 * @returns {Object} Normalized data and parameters
 */
export function normalizeData(data) {
    const features = ['radial', 'along', 'cross', 'clock'];
    const means = {};
    const stds = {};

    features.forEach(feature => {
        const values = data.map(d => d[feature]);
        means[feature] = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((sum, v) => sum + Math.pow(v - means[feature], 2), 0) / values.length;
        stds[feature] = Math.sqrt(variance) || 1;
    });

    const normalized = data.map(point => ({
        ...point,
        radial: (point.radial - means.radial) / stds.radial,
        along: (point.along - means.along) / stds.along,
        cross: (point.cross - means.cross) / stds.cross,
        clock: (point.clock - means.clock) / stds.clock
    }));

    return {
        normalized,
        normalizationParams: { means, stds }
    };
}

/**
 * Denormalize predictions
 * @param {Array} predictions - Normalized predictions
 * @param {Object} normParams - Normalization parameters
 * @returns {Array} Denormalized predictions
 */
export function denormalizePredictions(predictions, normParams) {
    return predictions.map(pred => ({
        clock: pred.clock * normParams.stds.clock + normParams.means.clock,
        radial: pred.radial * normParams.stds.radial + normParams.means.radial,
        along: pred.along * normParams.stds.along + normParams.means.along,
        cross: pred.cross * normParams.stds.cross + normParams.means.cross
    }));
}

/**
 * Generate data preview
 * @param {Array} data - Data array
 * @param {number} limit - Number of rows to include
 * @returns {Array} Preview data
 */
export function generateDataPreview(data, limit = 50) {
    return data.slice(0, limit).map((point, i) => ({
        id: i,
        time: point.utc_time,
        radial: point.radial.toFixed(4),
        along: point.along.toFixed(4),
        cross: point.cross.toFixed(4),
        clock: point.clock.toFixed(2)
    }));
}

export default {
    validateCSV,
    parseCSVData,
    calculateStatistics,
    prepareTrainingSequences,
    normalizeData,
    denormalizePredictions,
    generateDataPreview
};
