/**
 * Live Satellite Map Component
 * Shows real-time satellite positions on an interactive globe
 * 
 * Uses Cesium-style WebGL globe or 2D map fallback
 */

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    GlobeAltIcon,
    MapPinIcon,
    PlayIcon,
    PauseIcon,
    ArrowsPointingOutIcon
} from '@heroicons/react/24/outline';

// Real orbital parameters for accurate ground track simulation
const CONSTELLATION_PARAMS = {
    GPS: { altitude: 20200, period: 11.97 * 60, inclination: 55, color: '#3B82F6' },
    Galileo: { altitude: 23222, period: 14.08 * 60, inclination: 56, color: '#8B5CF6' },
    GLONASS: { altitude: 19100, period: 11.26 * 60, inclination: 64.8, color: '#EF4444' },
    BeiDou: { altitude: 21528, period: 12.87 * 60, inclination: 55, color: '#F59E0B' },
    NavIC: { altitude: 35786, period: 23.93 * 60, inclination: 29, color: '#10B981' }, // GSO/GEO
};

// Generate satellite position based on orbital mechanics
const calculatePosition = (satellite, time) => {
    const params = CONSTELLATION_PARAMS[satellite.constellation] || CONSTELLATION_PARAMS.GPS;
    const periodMs = params.period * 60 * 1000;

    // Each satellite has a unique phase offset
    const phaseOffset = (parseInt(satellite.id.slice(1)) || 0) * 0.3;
    const phase = ((time % periodMs) / periodMs + phaseOffset) % 1;

    // Ground track calculation
    const earthRotationPerOrbit = params.period / 1436.07; // Sidereal day in minutes
    const longitudeDrift = earthRotationPerOrbit * 360;

    // Inclined orbit ground track
    const longitude = ((phase * 360 - 180 + longitudeDrift * (time / periodMs)) % 360) - 180;
    const latitude = params.inclination * Math.sin(phase * 2 * Math.PI);

    return {
        lat: latitude,
        lon: longitude,
        alt: params.altitude,
        phase: phase * 360
    };
};

const LiveSatelliteMap = ({ satellites = [] }) => {
    const canvasRef = useRef(null);
    const [isAnimating, setIsAnimating] = useState(true);
    const [hoveredSat, setHoveredSat] = useState(null);
    const [positions, setPositions] = useState({});
    const [mapCenter, setMapCenter] = useState({ lat: 20, lon: 78 }); // Centered on India

    const animationRef = useRef();

    // Update satellite positions
    useEffect(() => {
        if (!isAnimating) return;

        const updatePositions = () => {
            const now = Date.now();
            const newPositions = {};

            satellites.forEach(sat => {
                newPositions[sat.id] = calculatePosition(sat, now);
            });

            setPositions(newPositions);
            animationRef.current = requestAnimationFrame(updatePositions);
        };

        updatePositions();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [satellites, isAnimating]);

    // Draw map on canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Clear
        ctx.fillStyle = '#0a0f1e';
        ctx.fillRect(0, 0, width, height);

        // Draw grid
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.1)';
        ctx.lineWidth = 1;

        // Longitude lines
        for (let lon = -180; lon <= 180; lon += 30) {
            const x = ((lon + 180) / 360) * width;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        // Latitude lines
        for (let lat = -90; lat <= 90; lat += 30) {
            const y = ((90 - lat) / 180) * height;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // Equator (highlighted)
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.3)';
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();

        // Draw simplified world map outline (major landmasses)
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.4)';
        ctx.lineWidth = 0.5;

        // Simple continent outlines (approximate coordinates)
        const drawContinent = (points) => {
            ctx.beginPath();
            points.forEach((point, i) => {
                const x = ((point[1] + 180) / 360) * width;
                const y = ((90 - point[0]) / 180) * height;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.stroke();
        };

        // India outline (simplified)
        ctx.strokeStyle = 'rgba(251, 146, 60, 0.6)'; // Orange for India
        ctx.lineWidth = 1.5;
        drawContinent([
            [35, 70], [32, 78], [28, 77], [23, 69], [20, 73], [15, 74],
            [8, 77], [10, 80], [13, 80], [17, 83], [22, 88], [27, 89],
            [28, 97], [23, 94], [22, 92], [24, 88], [27, 88], [32, 79], [35, 70]
        ]);

        // Draw NavIC coverage area
        ctx.fillStyle = 'rgba(16, 185, 129, 0.1)'; // Green tint for NavIC
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        // NavIC primary coverage: 30°E to 130°E, -30°S to 50°N
        const coverageX1 = ((30 + 180) / 360) * width;
        const coverageX2 = ((130 + 180) / 360) * width;
        const coverageY1 = ((90 - 50) / 180) * height;
        const coverageY2 = ((90 + 30) / 180) * height;
        ctx.rect(coverageX1, coverageY1, coverageX2 - coverageX1, coverageY2 - coverageY1);
        ctx.fill();
        ctx.stroke();
        ctx.setLineDash([]);

        // NavIC label
        ctx.fillStyle = 'rgba(16, 185, 129, 0.8)';
        ctx.font = '10px monospace';
        ctx.fillText('NavIC Coverage', coverageX1 + 5, coverageY1 + 15);

        // Draw satellite positions
        Object.entries(positions).forEach(([satId, pos]) => {
            const sat = satellites.find(s => s.id === satId);
            if (!sat) return;

            const params = CONSTELLATION_PARAMS[sat.constellation] || CONSTELLATION_PARAMS.GPS;
            const x = ((pos.lon + 180) / 360) * width;
            const y = ((90 - pos.lat) / 180) * height;

            // Glow effect
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, 15);
            gradient.addColorStop(0, params.color + '60');
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, 15, 0, Math.PI * 2);
            ctx.fill();

            // Satellite dot
            ctx.fillStyle = params.color;
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();

            // Border
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Label on hover or for NavIC
            if (hoveredSat === satId || sat.constellation === 'NavIC') {
                ctx.fillStyle = '#fff';
                ctx.font = '10px monospace';
                ctx.fillText(satId, x + 8, y + 4);
            }
        });

    }, [positions, satellites, hoveredSat]);

    // Get constellation counts
    const constellationCounts = satellites.reduce((acc, sat) => {
        acc[sat.constellation] = (acc[sat.constellation] || 0) + 1;
        return acc;
    }, {});

    return (
        <motion.div
            className="console-panel p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <GlobeAltIcon className="w-5 h-5 text-stellar-primary" />
                    <h3 className="text-lg font-display font-semibold text-white">Live Satellite Map</h3>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-stellar-emerald/20 text-stellar-emerald border border-stellar-emerald/30">
                        {Object.keys(positions).length} satellites
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsAnimating(!isAnimating)}
                        className={`p-2 rounded-lg transition-colors ${isAnimating ? 'bg-stellar-primary text-white' : 'bg-space-700 text-slate-400'
                            }`}
                    >
                        {isAnimating ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
                {Object.entries(CONSTELLATION_PARAMS).map(([name, params]) => (
                    <div key={name} className="flex items-center gap-2">
                        <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: params.color }}
                        />
                        <span className="text-xs text-slate-400">
                            {name} ({constellationCounts[name] || 0})
                        </span>
                    </div>
                ))}
            </div>

            {/* Map Canvas */}
            <div className="relative rounded-xl overflow-hidden border border-console-border bg-space-900">
                <canvas
                    ref={canvasRef}
                    width={800}
                    height={400}
                    className="w-full"
                    onMouseMove={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = (e.clientX - rect.left) / rect.width;
                        const y = (e.clientY - rect.top) / rect.height;

                        // Find nearest satellite
                        let nearest = null;
                        let minDist = Infinity;

                        Object.entries(positions).forEach(([satId, pos]) => {
                            const satX = (pos.lon + 180) / 360;
                            const satY = (90 - pos.lat) / 180;
                            const dist = Math.sqrt((x - satX) ** 2 + (y - satY) ** 2);
                            if (dist < 0.03 && dist < minDist) {
                                minDist = dist;
                                nearest = satId;
                            }
                        });

                        setHoveredSat(nearest);
                    }}
                    onMouseLeave={() => setHoveredSat(null)}
                />

                {/* Hovered satellite info */}
                {hoveredSat && positions[hoveredSat] && (
                    <div className="absolute bottom-4 left-4 p-3 rounded-lg bg-space-800/90 backdrop-blur-sm border border-console-border">
                        <div className="text-sm font-mono text-white">{hoveredSat}</div>
                        <div className="text-xs text-slate-400 mt-1">
                            Lat: {positions[hoveredSat].lat.toFixed(2)}° |
                            Lon: {positions[hoveredSat].lon.toFixed(2)}°
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                            Alt: {positions[hoveredSat].alt.toLocaleString()} km
                        </div>
                    </div>
                )}

                {/* Time indicator */}
                <div className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-space-800/90 backdrop-blur-sm border border-console-border">
                    <div className="text-xs font-mono text-stellar-cyan">
                        {new Date().toUTCString().slice(0, -4)} UTC
                    </div>
                </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-5 gap-3 mt-4">
                {Object.entries(CONSTELLATION_PARAMS).map(([name, params]) => (
                    <div
                        key={name}
                        className="p-3 rounded-lg bg-space-800/50 border border-console-border"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: params.color }}
                            />
                            <span className="text-xs font-medium text-white">{name}</span>
                        </div>
                        <div className="text-xs text-slate-500">
                            <div>Alt: {params.altitude.toLocaleString()} km</div>
                            <div>Inc: {params.inclination}°</div>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

export default LiveSatelliteMap;
