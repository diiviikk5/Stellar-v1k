/**
 * ISRO Data Loader Service
 * Loads and parses real satellite ephemeris error data from ISRO
 * 
 * Data columns:
 * - utc_time: Timestamp in "M/D/YYYY H:MM" format
 * - x_error (m): Radial error in meters
 * - y_error (m): Along-track error in meters  
 * - z_error (m): Cross-track error in meters
 * - satclockerror (m): Clock error in meters
 */

// Cache for loaded data
const dataCache = {
    GEO_Train: null,
    GEO_Test: null,
    MEO_Train: null,
    MEO_Train2: null,  // Add Train2 variant
    MEO_Test: null,
    MEO_Test2: null    // Add Test2 variant
};

/**
 * Parse ISRO CSV data into usable format
 * @param {string} csvText - Raw CSV content
 * @returns {Array} Array of data points
 */
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const header = lines[0].split(',').map(h => h.trim());

    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = line.split(',');
        if (values.length < 5) continue;

        const timestamp = parseISRODate(values[0].trim());
        if (!timestamp) continue;

        const point = {
            timestamp,
            utc_time: values[0].trim(),
            // Convert to format expected by AI model
            radial: parseFloat(values[1]) || 0,   // x_error → radial
            along: parseFloat(values[2]) || 0,    // y_error → along-track
            cross: parseFloat(values[3]) || 0,    // z_error → cross-track
            clock: parseFloat(values[4]) / 0.3 || 0, // satclockerror (m → ns, speed of light factor)
            clockMeters: parseFloat(values[4]) || 0, // Keep original for display
        };

        data.push(point);
    }

    // Sort by timestamp
    data.sort((a, b) => a.timestamp - b.timestamp);

    return data;
}

/**
 * Parse ISRO date format "M/D/YYYY H:MM" to Date object
 */
function parseISRODate(dateStr) {
    try {
        // Handle format like "9/1/2025 6:00"
        const [datePart, timePart] = dateStr.split(' ');
        const [month, day, year] = datePart.split('/').map(Number);
        const [hour, minute] = timePart.split(':').map(Number);

        return new Date(year, month - 1, day, hour, minute).getTime();
    } catch {
        return null;
    }
}

/**
 * Load ISRO data for a specific orbit type
 * @param {string} orbitType - 'GEO' or 'MEO'
 * @param {string} split - 'Train', 'Train2', 'Test', or 'Test2'
 * @returns {Promise<Array>} Parsed data array
 */
export async function loadISROData(orbitType = 'GEO', split = 'Train') {
    const cacheKey = `${orbitType}_${split}`;

    // Return cached data if available
    if (dataCache[cacheKey]) {
        return dataCache[cacheKey];
    }

    try {
        const response = await fetch(`/data/DATA_${orbitType}_${split}.csv`);
        if (!response.ok) {
            throw new Error(`Failed to load ${cacheKey}: ${response.statusText}`);
        }

        const csvText = await response.text();
        const data = parseCSV(csvText);

        // Cache the data
        dataCache[cacheKey] = data;

        console.log(`📡 Loaded ${data.length} ISRO ${orbitType} ${split} data points`);

        return data;
    } catch (error) {
        console.error(`Failed to load ISRO data: ${error.message}`);
        return [];
    }
}

/**
 * Get combined train + test data
 */
export async function loadAllISROData(orbitType = 'GEO') {
    const [train, test] = await Promise.all([
        loadISROData(orbitType, 'Train'),
        loadISROData(orbitType, 'Test')
    ]);

    // Combine and sort by timestamp
    const combined = [...train, ...test].sort((a, b) => a.timestamp - b.timestamp);
    return combined;
}

/**
 * Get statistics about the ISRO data
 */
export function getDataStatistics(data) {
    if (!data || data.length === 0) {
        return null;
    }

    const stats = {
        count: data.length,
        timeRange: {
            start: new Date(data[0].timestamp).toISOString(),
            end: new Date(data[data.length - 1].timestamp).toISOString(),
            durationHours: (data[data.length - 1].timestamp - data[0].timestamp) / (1000 * 60 * 60)
        },
        radial: calculateStats(data.map(d => d.radial)),
        along: calculateStats(data.map(d => d.along)),
        cross: calculateStats(data.map(d => d.cross)),
        clock: calculateStats(data.map(d => d.clockMeters))
    };

    // Find anomalies (values > 2 std from mean)
    stats.anomalies = data.filter(d =>
        Math.abs(d.radial) > stats.radial.mean + 2 * stats.radial.std ||
        Math.abs(d.along) > stats.along.mean + 2 * stats.along.std ||
        Math.abs(d.cross) > stats.cross.mean + 2 * stats.cross.std ||
        Math.abs(d.clockMeters) > stats.clock.mean + 2 * stats.clock.std
    );

    return stats;
}

/**
 * Calculate basic statistics for an array of numbers
 */
function calculateStats(values) {
    const n = values.length;
    const mean = values.reduce((a, b) => a + b, 0) / n;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / n;
    const std = Math.sqrt(variance);
    const min = Math.min(...values);
    const max = Math.max(...values);

    return { mean, std, min, max, range: max - min };
}

/**
 * Prepare data for LSTM model (sliding window sequences)
 * @param {Array} data - Raw ISRO data
 * @param {number} sequenceLength - Length of each sequence
 * @returns {Array} Array of sequences ready for model input
 */
export function prepareSequences(data, sequenceLength = 96) {
    const sequences = [];

    for (let i = 0; i <= data.length - sequenceLength; i++) {
        const sequence = data.slice(i, i + sequenceLength).map(d => ({
            clock: d.clock,
            radial: d.radial,
            along: d.along,
            cross: d.cross
        }));

        sequences.push({
            input: sequence,
            timestamp: data[i + sequenceLength - 1].timestamp,
            label: data[i + sequenceLength - 1].utc_time
        });
    }

    return sequences;
}

export { parseCSV, calculateStats };
