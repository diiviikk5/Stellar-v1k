/**
 * Statistical Tests for ISRO Evaluation
 * 
 * Implements Shapiro-Wilk normality test and related statistics
 * as required by ISRO evaluation criteria.
 */

/**
 * Shapiro-Wilk Test for Normality
 * 
 * Tests whether a sample comes from a normally distributed population.
 * This is Priority 1 evaluation criteria for ISRO.
 * 
 * Reference: Shapiro, S. S., & Wilk, M. B. (1965)
 * 
 * @param {number[]} data - Array of residual values
 * @returns {Object} { W: number, pValue: number, rejectNull: boolean }
 */
export function shapiroWilkTest(data, alpha = 0.05) {
    const n = data.length;
    
    if (n < 3 || n > 5000) {
        console.warn('Shapiro-Wilk test works best for 3 <= n <= 5000');
    }
    
    // Sort data
    const sorted = [...data].sort((a, b) => a - b);
    
    // Calculate mean
    const mean = sorted.reduce((a, b) => a + b, 0) / n;
    
    // Calculate sum of squares
    const ss = sorted.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0);
    
    if (ss === 0) {
        return { W: 1, pValue: 1, rejectNull: false, hypothesis: 0 };
    }
    
    // Get Shapiro-Wilk coefficients
    const a = getShapiroWilkCoefficients(n);
    
    // Calculate W statistic
    let b = 0;
    const m = Math.floor(n / 2);
    
    for (let i = 0; i < m; i++) {
        b += a[i] * (sorted[n - 1 - i] - sorted[i]);
    }
    
    const W = (b * b) / ss;
    
    // Calculate p-value using approximation
    const pValue = calculatePValue(W, n);
    
    // Hypothesis test: H0 = data is normally distributed
    const rejectNull = pValue < alpha;
    
    return {
        W: Math.min(W, 1), // W should be <= 1
        pValue,
        rejectNull,
        hypothesis: rejectNull ? 1 : 0, // 0 = fail to reject H0, 1 = reject H0
        interpretation: rejectNull 
            ? 'Residuals are NOT normally distributed (systematic errors remain)'
            : 'Residuals ARE normally distributed (systematic errors removed) ✓'
    };
}

/**
 * Get Shapiro-Wilk coefficients for sample size n
 * Using approximation for computational efficiency
 */
function getShapiroWilkCoefficients(n) {
    const m = Math.floor(n / 2);
    const a = new Array(m);
    
    // Compute expected values of order statistics for normal distribution
    for (let i = 0; i < m; i++) {
        const mi = approximateNormalOrderStatistic(i + 1, n);
        const mni = approximateNormalOrderStatistic(n - i, n);
        a[i] = mni - mi;
    }
    
    // Normalize coefficients
    const sumSq = a.reduce((sum, ai) => sum + ai * ai, 0);
    const norm = Math.sqrt(sumSq);
    
    for (let i = 0; i < m; i++) {
        a[i] /= norm;
    }
    
    return a;
}

/**
 * Approximate expected value of i-th order statistic from normal distribution
 */
function approximateNormalOrderStatistic(i, n) {
    const p = (i - 0.375) / (n + 0.25);
    return normalQuantile(p);
}

/**
 * Inverse normal CDF (quantile function) using Abramowitz & Stegun approximation
 */
function normalQuantile(p) {
    if (p <= 0) return -Infinity;
    if (p >= 1) return Infinity;
    if (p === 0.5) return 0;
    
    const sign = p < 0.5 ? -1 : 1;
    const pp = p < 0.5 ? p : 1 - p;
    
    const t = Math.sqrt(-2 * Math.log(pp));
    
    const c0 = 2.515517;
    const c1 = 0.802853;
    const c2 = 0.010328;
    const d1 = 1.432788;
    const d2 = 0.189269;
    const d3 = 0.001308;
    
    const num = c0 + c1 * t + c2 * t * t;
    const den = 1 + d1 * t + d2 * t * t + d3 * t * t * t;
    
    return sign * (t - num / den);
}

/**
 * Calculate p-value for Shapiro-Wilk W statistic
 * Using Royston's approximation (1992)
 */
function calculatePValue(W, n) {
    if (n < 4) {
        // For very small samples, use rough approximation
        return W > 0.9 ? 0.5 : 0.01;
    }
    
    // Transform W to normal
    const logN = Math.log(n);
    
    // Royston's approximation parameters
    let mu, sigma;
    
    if (n <= 11) {
        const gamma = 0.459 * n - 2.273;
        mu = -0.0006714 * Math.pow(n, 3) + 0.025054 * Math.pow(n, 2) - 0.39978 * n + 0.5440;
        sigma = Math.exp(-0.0020322 * Math.pow(n, 3) + 0.062767 * Math.pow(n, 2) - 0.77857 * n + 1.3822);
        
        const y = Math.pow(1 - W, gamma);
        const z = (y - mu) / sigma;
        
        return 1 - normalCDF(z);
    } else {
        // For n > 11
        const logW = Math.log(1 - W);
        
        mu = 0.0038915 * Math.pow(logN, 3) - 0.083751 * Math.pow(logN, 2) - 0.31082 * logN - 1.5861;
        sigma = Math.exp(0.0030302 * Math.pow(logN, 2) - 0.082676 * logN - 0.4803);
        
        const z = (logW - mu) / sigma;
        
        return 1 - normalCDF(z);
    }
}

/**
 * Standard normal CDF
 */
function normalCDF(x) {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;
    
    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x) / Math.sqrt(2);
    
    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    
    return 0.5 * (1.0 + sign * y);
}

/**
 * Calculate basic statistics for residuals
 * This is Priority 2 evaluation criteria for ISRO
 * 
 * @param {number[]} residuals - Array of residual values
 * @returns {Object} { mean, std, min, max, count }
 */
export function calculateResidualStats(residuals) {
    const n = residuals.length;
    const mean = residuals.reduce((a, b) => a + b, 0) / n;
    const variance = residuals.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / (n - 1);
    const std = Math.sqrt(variance);
    
    return {
        mean,
        std,
        variance,
        min: Math.min(...residuals),
        max: Math.max(...residuals),
        count: n,
        skewness: calculateSkewness(residuals, mean, std),
        kurtosis: calculateKurtosis(residuals, mean, std)
    };
}

/**
 * Calculate skewness (measure of asymmetry)
 */
function calculateSkewness(data, mean, std) {
    const n = data.length;
    const m3 = data.reduce((sum, x) => sum + Math.pow(x - mean, 3), 0) / n;
    return m3 / Math.pow(std, 3);
}

/**
 * Calculate excess kurtosis (measure of tail weight)
 */
function calculateKurtosis(data, mean, std) {
    const n = data.length;
    const m4 = data.reduce((sum, x) => sum + Math.pow(x - mean, 4), 0) / n;
    return m4 / Math.pow(std, 4) - 3; // Excess kurtosis
}

/**
 * Generate Q-Q plot data for visualization
 * This is Priority 3 evaluation criteria for ISRO
 * 
 * @param {number[]} residuals - Array of residual values
 * @returns {Array} Array of {theoretical, sample} points for plotting
 */
export function generateQQPlotData(residuals) {
    const n = residuals.length;
    const sorted = [...residuals].sort((a, b) => a - b);
    
    const qqData = [];
    
    for (let i = 0; i < n; i++) {
        // Theoretical quantile from standard normal
        const p = (i + 0.5) / n;
        const theoretical = normalQuantile(p);
        
        // Standardize sample values
        const mean = residuals.reduce((a, b) => a + b, 0) / n;
        const std = Math.sqrt(residuals.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / n);
        const standardized = (sorted[i] - mean) / (std || 1);
        
        qqData.push({
            theoretical,
            sample: standardized,
            original: sorted[i],
            index: i + 1
        });
    }
    
    return qqData;
}

/**
 * Evaluate model performance using ISRO criteria
 * 
 * @param {Array} predictions - Array of predicted values { x, y, z, clock }
 * @param {Array} actuals - Array of actual values { x, y, z, clock }
 * @returns {Object} Complete evaluation report
 */
export function evaluateModelISRO(predictions, actuals) {
    if (predictions.length !== actuals.length) {
        throw new Error('Predictions and actuals must have same length');
    }
    
    // Calculate residuals for each parameter
    const residuals = {
        x: predictions.map((p, i) => p.x - actuals[i].x),
        y: predictions.map((p, i) => p.y - actuals[i].y),
        z: predictions.map((p, i) => p.z - actuals[i].z),
        clock: predictions.map((p, i) => p.clock - actuals[i].clock)
    };
    
    // Evaluate each parameter
    const evaluation = {};
    let totalW = 0;
    let totalPValue = 0;
    
    for (const param of ['x', 'y', 'z', 'clock']) {
        const sw = shapiroWilkTest(residuals[param]);
        const stats = calculateResidualStats(residuals[param]);
        const qqData = generateQQPlotData(residuals[param]);
        
        evaluation[param] = {
            shapiroWilk: sw,
            statistics: stats,
            qqPlot: qqData,
            residuals: residuals[param]
        };
        
        totalW += sw.W;
        totalPValue += sw.pValue;
    }
    
    // Average scores (equal weight to each parameter as per ISRO)
    const avgW = totalW / 4;
    const avgPValue = totalPValue / 4;
    
    // Combined residuals for overall evaluation
    const allResiduals = [
        ...residuals.x,
        ...residuals.y,
        ...residuals.z,
        ...residuals.clock
    ];
    
    const overallSW = shapiroWilkTest(allResiduals);
    const overallStats = calculateResidualStats(allResiduals);
    
    return {
        byParameter: evaluation,
        overall: {
            shapiroWilk: overallSW,
            statistics: overallStats,
            averageW: avgW,
            averagePValue: avgPValue
        },
        benchmark: {
            targetW: 0.9810,
            targetPValue: 0.5840,
            targetHypothesis: 0,
            comparison: avgW >= 0.9810 ? 'MEETS_BENCHMARK' : 'BELOW_BENCHMARK'
        },
        summary: {
            score: avgW,
            pValue: avgPValue,
            hypothesis: overallSW.hypothesis,
            interpretation: overallSW.interpretation
        }
    };
}

/**
 * Interpolate predictions at arbitrary timestamps
 * Required because ISRO evaluation uses non-uniform sampling
 * 
 * @param {Array} trainData - Training data with timestamps
 * @param {Array} targetTimestamps - Timestamps to predict at
 * @param {Function} predictFn - Prediction function
 * @returns {Array} Predictions at target timestamps
 */
export function interpolateAtTimestamps(trainData, targetTimestamps, predictFn) {
    const predictions = [];
    
    for (const timestamp of targetTimestamps) {
        // Find nearest training data points
        const sorted = [...trainData].sort((a, b) => 
            Math.abs(a.timestamp - timestamp) - Math.abs(b.timestamp - timestamp)
        );
        
        // Use k nearest neighbors for context
        const k = Math.min(48, trainData.length); // Use last 48 points as context
        const context = sorted.slice(0, k).sort((a, b) => a.timestamp - b.timestamp);
        
        // Make prediction
        const prediction = predictFn(context);
        
        predictions.push({
            timestamp,
            ...prediction
        });
    }
    
    return predictions;
}

export default {
    shapiroWilkTest,
    calculateResidualStats,
    generateQQPlotData,
    evaluateModelISRO,
    interpolateAtTimestamps
};
