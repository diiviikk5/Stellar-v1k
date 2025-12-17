/**
 * STELLAR-v1k Live Data Service
 * Simulates real-time satellite telemetry with realistic patterns
 * 
 * Based on:
 * - Real orbital parameters from official constellation documentation
 * - IGS error characteristics for realistic clock and ephemeris behavior
 * - ISRO NavIC ICD for Indian satellite behavior
 */

import { IGS_ERROR_CHARACTERISTICS, ORBITAL_PARAMETERS } from '../data/realSatelliteData';

// Orbital mechanics parameters for realistic simulation
// Values from official sources (GPS.gov, ESA, ISRO, etc.)
const ORBITAL_PARAMS = {
    GPS: {
        period: 11.97 * 60,    // minutes to seconds
        semiMajor: 26559,       // km
        inclination: 55,        // degrees
        clockRMS: 5.0,          // ns (IGS broadcast clock RMS)
        orbitRMS: 0.5           // m (radial component RMS)
    },
    Galileo: {
        period: 14.08 * 60,
        semiMajor: 29600,
        inclination: 56,
        clockRMS: 3.0,          // Better due to PHM clocks
        orbitRMS: 0.3
    },
    GLONASS: {
        period: 11.26 * 60,
        semiMajor: 25510,
        inclination: 64.8,
        clockRMS: 10.0,         // Higher error than GPS/Galileo
        orbitRMS: 1.0
    },
    BeiDou: {
        period: 12.87 * 60,
        semiMajor: 27906,
        inclination: 55,
        clockRMS: 7.0,
        orbitRMS: 0.8
    },
    NavIC: {
        // ISRO NavIC - Geosynchronous orbit
        period: 23.93 * 60,     // GEO/GSO - ~24 hour period
        semiMajor: 42164,       // km
        inclination: 29,        // GSO inclination (0 for GEO)
        clockRMS: 8.0,          // Based on ISRO reports
        orbitRMS: 0.6,
        coverage: 'India regional'   // Primary + extended coverage
    },
    QZSS: {
        period: 23.93 * 60,
        semiMajor: 42164,
        inclination: 41,
        clockRMS: 6.0,
        orbitRMS: 0.5
    }
};

// Storage for live data streams
const liveDataStreams = new Map();
const dataCallbacks = new Map();

/**
 * Start live data streaming for a satellite
 */
export function startLiveStream(satelliteId, callback, intervalMs = 1000) {
    if (liveDataStreams.has(satelliteId)) {
        stopLiveStream(satelliteId);
    }

    // Get constellation from satellite ID
    const constellation = getConstellation(satelliteId);
    const params = ORBITAL_PARAMS[constellation];

    // Initialize state with constellation-specific characteristics
    const state = {
        clockBias: (Math.random() - 0.5) * params.clockRMS * 0.4,
        radial: (Math.random() - 0.5) * params.orbitRMS,
        alongTrack: (Math.random() - 0.5) * params.orbitRMS * 2,
        crossTrack: (Math.random() - 0.5) * params.orbitRMS * 0.6,
        trend: (Math.random() - 0.5) * 0.001,
        phase: Math.random() * Math.PI * 2,
        history: [],
        constellation
    };

    const interval = setInterval(() => {
        const update = generateLiveUpdate(satelliteId, state);
        state.history.push(update);
        if (state.history.length > 672) { // Keep 7 days at 15-min intervals
            state.history = state.history.slice(-672);
        }
        callback(update, state.history);
    }, intervalMs);

    liveDataStreams.set(satelliteId, { interval, state });
    dataCallbacks.set(satelliteId, callback);

    return { streamId: satelliteId, status: 'active' };
}

/**
 * Get constellation from satellite ID
 */
function getConstellation(satelliteId) {
    if (satelliteId.startsWith('G')) return 'GPS';
    if (satelliteId.startsWith('E')) return 'Galileo';
    if (satelliteId.startsWith('R')) return 'GLONASS';
    if (satelliteId.startsWith('C')) return 'BeiDou';
    if (satelliteId.startsWith('I') || satelliteId.startsWith('N')) return 'NavIC';  // IRNSS/NVS
    return 'GPS';
}

/**
 * Stop live data streaming
 */
export function stopLiveStream(satelliteId) {
    const stream = liveDataStreams.get(satelliteId);
    if (stream) {
        clearInterval(stream.interval);
        liveDataStreams.delete(satelliteId);
        dataCallbacks.delete(satelliteId);
    }
}

/**
 * Generate realistic live update
 */
function generateLiveUpdate(satelliteId, state) {
    const now = new Date();
    const t = now.getTime() / 1000;

    const constellation = state.constellation || getConstellation(satelliteId);
    const params = ORBITAL_PARAMS[constellation];

    // Orbital dynamics affect errors
    const orbitalPhase = (t / (params.period * 60)) * 2 * Math.PI;

    // Clock bias: mainly random walk with small periodic component
    // Scale by constellation-specific characteristics
    const clockScale = params.clockRMS / 5.0;
    const clockNoise = (Math.random() - 0.5) * 0.02 * clockScale;
    const clockPeriodic = Math.sin(orbitalPhase + state.phase) * 0.05 * clockScale;
    state.clockBias += clockNoise + state.trend;
    state.clockBias += clockPeriodic * 0.1;

    // Ephemeris errors: more structured patterns
    const orbitScale = params.orbitRMS / 0.5;

    // Radial: smallest, mainly periodic
    const radialPeriodic = Math.sin(orbitalPhase * 2) * 0.1 * orbitScale;
    const radialNoise = (Math.random() - 0.5) * 0.02 * orbitScale;
    state.radial = state.radial * 0.95 + radialPeriodic * 0.3 + radialNoise;

    // Along-track: largest, accumulates over time
    const alongNoise = (Math.random() - 0.5) * 0.05 * orbitScale;
    const alongDrift = Math.sin(t / 3600) * 0.01 * orbitScale;
    state.alongTrack += alongNoise + alongDrift;
    state.alongTrack *= 0.99; // Mean reversion

    // Cross-track: smooth, periodic
    const crossPeriodic = Math.cos(orbitalPhase) * 0.15 * orbitScale;
    const crossNoise = (Math.random() - 0.5) * 0.01 * orbitScale;
    state.crossTrack = state.crossTrack * 0.9 + crossPeriodic * 0.3 + crossNoise;

    // Occasional anomalies (1% chance)
    const isAnomalous = Math.random() < 0.01;
    let anomalyType = null;
    if (isAnomalous) {
        const anomalyTypes = ['clock_jump', 'orbit_maneuver', 'solar_pressure', 'eclipse_exit'];
        anomalyType = anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)];

        switch (anomalyType) {
            case 'clock_jump':
                state.clockBias += (Math.random() - 0.5) * 0.5 * clockScale;
                break;
            case 'orbit_maneuver':
                state.radial += (Math.random() - 0.5) * 0.3 * orbitScale;
                state.alongTrack += (Math.random() - 0.5) * 0.5 * orbitScale;
                break;
            case 'solar_pressure':
                state.radial += Math.sign(state.radial) * 0.1 * orbitScale;
                break;
            case 'eclipse_exit':
                state.clockBias += 0.2 * clockScale; // Clock tends to jump after eclipse
                break;
        }
    }

    return {
        satelliteId,
        constellation,
        timestamp: now.toISOString(),
        unixTime: now.getTime(),
        clock: {
            bias: state.clockBias,
            drift: state.trend * 1000, // ns/s
            unit: 'ns'
        },
        ephemeris: {
            radial: state.radial,
            alongTrack: state.alongTrack,
            crossTrack: state.crossTrack,
            unit: 'm'
        },
        quality: {
            signalStrength: 40 + Math.random() * 15, // dB-Hz
            multipath: Math.random() * 0.5,
            ionosphericDelay: 2 + Math.random() * 5,
            troposphericDelay: 2 + Math.random() * 0.5
        },
        status: isAnomalous ? 'anomaly' : 'nominal',
        anomalyType,
        orbitalPhase: (orbitalPhase % (2 * Math.PI)) / (2 * Math.PI) * 360, // degrees
    };
}

/**
 * Get historical data for a satellite
 */
export function getLiveHistory(satelliteId) {
    const stream = liveDataStreams.get(satelliteId);
    return stream ? stream.state.history : [];
}

/**
 * Get all active streams
 */
export function getActiveStreams() {
    return Array.from(liveDataStreams.keys());
}

/**
 * Generate batch historical data
 */
export function generateHistoricalData(satelliteId, days = 7, intervalMinutes = 15) {
    const pointsPerDay = (24 * 60) / intervalMinutes;
    const totalPoints = Math.floor(days * pointsPerDay);
    const data = [];

    const state = {
        clockBias: (Math.random() - 0.5) * 2,
        radial: (Math.random() - 0.5) * 0.5,
        alongTrack: (Math.random() - 0.5) * 1.0,
        crossTrack: (Math.random() - 0.5) * 0.3,
        trend: (Math.random() - 0.5) * 0.001,
        phase: Math.random() * Math.PI * 2
    };

    // Use the same constellation detection as live data
    const constellation = getConstellation(satelliteId);

    const params = ORBITAL_PARAMS[constellation];
    const startTime = Date.now() - days * 24 * 60 * 60 * 1000;

    for (let i = 0; i < totalPoints; i++) {
        const time = new Date(startTime + i * intervalMinutes * 60 * 1000);
        const t = time.getTime() / 1000;
        const orbitalPhase = (t / (params.period * 60)) * 2 * Math.PI;

        // Clock dynamics
        const clockNoise = (Math.random() - 0.5) * 0.02;
        const clockPeriodic = Math.sin(orbitalPhase + state.phase) * 0.05;
        state.clockBias += clockNoise + state.trend + clockPeriodic * 0.1;

        // Ephemeris dynamics
        state.radial = state.radial * 0.95 + Math.sin(orbitalPhase * 2) * 0.03 + (Math.random() - 0.5) * 0.02;
        state.alongTrack += (Math.random() - 0.5) * 0.05;
        state.alongTrack *= 0.99;
        state.crossTrack = state.crossTrack * 0.9 + Math.cos(orbitalPhase) * 0.05 + (Math.random() - 0.5) * 0.01;

        data.push({
            timestamp: time.toISOString(),
            time: time.getTime(),
            clock: state.clockBias,
            radial: state.radial,
            along: state.alongTrack,
            cross: state.crossTrack
        });
    }

    return data;
}

/**
 * Subscribe to all satellites
 */
export function subscribeToAllSatellites(satellites, callback, intervalMs = 2000) {
    satellites.forEach(sat => {
        startLiveStream(sat.id, (update, history) => {
            callback(sat.id, update, history);
        }, intervalMs);
    });

    return {
        unsubscribe: () => {
            satellites.forEach(sat => stopLiveStream(sat.id));
        }
    };
}

/**
 * Get aggregated fleet statistics
 */
export function getFleetStatistics() {
    const streams = Array.from(liveDataStreams.entries());

    if (streams.length === 0) {
        return null;
    }

    const stats = {
        activeSatellites: streams.length,
        avgClockBias: 0,
        avgRadialError: 0,
        avgAlongTrackError: 0,
        avgCrossTrackError: 0,
        anomaliesDetected: 0,
        lastUpdate: new Date().toISOString()
    };

    streams.forEach(([id, stream]) => {
        const lastPoint = stream.state.history[stream.state.history.length - 1];
        if (lastPoint) {
            stats.avgClockBias += Math.abs(lastPoint.clock?.bias || 0);
            stats.avgRadialError += Math.abs(lastPoint.ephemeris?.radial || 0);
            stats.avgAlongTrackError += Math.abs(lastPoint.ephemeris?.alongTrack || 0);
            stats.avgCrossTrackError += Math.abs(lastPoint.ephemeris?.crossTrack || 0);
            if (lastPoint.status === 'anomaly') stats.anomaliesDetected++;
        }
    });

    if (streams.length > 0) {
        stats.avgClockBias /= streams.length;
        stats.avgRadialError /= streams.length;
        stats.avgAlongTrackError /= streams.length;
        stats.avgCrossTrackError /= streams.length;
    }

    return stats;
}
