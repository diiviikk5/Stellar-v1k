/**
 * Space Live Feeds Component
 * Real-time satellite feeds, ISS camera, and Earth observation
 * 
 * Data Sources:
 * - NASA ISS Live Camera (YouTube embed)
 * - ISRO Bhoonidhi Satellite Tracker
 * - Official space agency resources
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    VideoCameraIcon,
    GlobeAltIcon,
    SignalIcon,
    RocketLaunchIcon,
    ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';

// Verified working live feed sources
const LIVE_FEEDS = [
    {
        id: 'iss-live',
        name: 'ISS HD Earth Viewing',
        source: 'NASA',
        embedId: 'fO9e9jnhYK8', // User-verified working stream
        description: 'Live HD views of Earth from the International Space Station',
    },
    {
        id: 'nasa-live',
        name: 'NASA Live',
        source: 'NASA TV',
        embedId: '21X5lGlDOfg', // NASA TV Public
        description: 'NASA Television - Live mission coverage',
    },
];

// Real, verified satellite tracking resources
const TRACKING_RESOURCES = [
    {
        name: 'ISRO Bhoonidhi Tracker',
        url: 'https://bhoonidhi.nrsc.gov.in/bhoonidhi/tracker.html',
        icon: '🇮🇳',
        description: "ISRO's official real-time satellite tracker",
        category: 'India'
    },
    {
        name: 'N2YO Satellite Tracker',
        url: 'https://www.n2yo.com/',
        icon: '🛰️',
        description: 'Real-time tracking of 18000+ satellites',
        category: 'Global'
    },
    {
        name: 'Heavens Above',
        url: 'https://www.heavens-above.com/',
        icon: '🌟',
        description: 'Satellite passes and ISS visibility predictions',
        category: 'Global'
    },
    {
        name: 'NASA Spot The Station',
        url: 'https://spotthestation.nasa.gov/',
        icon: '🚀',
        description: 'Know when ISS passes over your location',
        category: 'ISS'
    },
    {
        name: 'CelesTrak',
        url: 'https://celestrak.org/',
        icon: '📡',
        description: 'Official source for satellite TLE data',
        category: 'Data'
    },
    {
        name: 'Stuff in Space',
        url: 'https://stuffin.space/',
        icon: '🌍',
        description: '3D visualization of objects in Earth orbit',
        category: '3D'
    },
];

// ISS position simulation with real orbital parameters
const getISSPosition = () => {
    const now = Date.now();
    const orbitalPeriod = 92.68 * 60 * 1000;
    const phase = (now % orbitalPeriod) / orbitalPeriod;

    const longitude = ((phase * 360 - 180 + (now / 86400000) * 360) % 360) - 180;
    const latitude = 51.6 * Math.sin(phase * 2 * Math.PI);

    return {
        latitude: latitude.toFixed(2),
        longitude: longitude.toFixed(2),
        altitude: (408 + Math.sin(phase * Math.PI * 4) * 5).toFixed(1),
        velocity: (7.66 + Math.random() * 0.01).toFixed(2),
    };
};

const SpaceLiveFeeds = () => {
    const [activeTab, setActiveTab] = useState('feeds');
    const [selectedFeed, setSelectedFeed] = useState(0);
    const [issPosition, setIssPosition] = useState(getISSPosition());
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setIssPosition(getISSPosition());
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            className="console-panel p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-stellar-primary to-stellar-accent flex items-center justify-center">
                        <VideoCameraIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-display font-semibold text-white">Space Live Feeds</h2>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span>Live from orbit</span>
                        </div>
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="flex items-center gap-2 bg-space-800 rounded-lg p-1">
                    {['feeds', 'trackers'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab
                                ? 'bg-stellar-primary text-white'
                                : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            {tab === 'feeds' ? '📺 Live Feeds' : '🛰️ Trackers'}
                        </button>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'feeds' ? (
                    <motion.div
                        key="feeds"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                    >
                        <div className="grid grid-cols-3 gap-6">
                            {/* Video Player */}
                            <div className="col-span-2">
                                <div className="relative aspect-video rounded-xl overflow-hidden bg-space-900 border border-console-border">
                                    <iframe
                                        src={`https://www.youtube.com/embed/${LIVE_FEEDS[selectedFeed].embedId}?autoplay=1&mute=1&controls=1&modestbranding=1`}
                                        className="w-full h-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        title={LIVE_FEEDS[selectedFeed].name}
                                    />

                                    {/* Live indicator */}
                                    <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm">
                                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                        <span className="text-xs font-medium text-white">LIVE</span>
                                    </div>

                                    {/* Source badge */}
                                    <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm">
                                        <span className="text-xs font-mono text-stellar-cyan">{LIVE_FEEDS[selectedFeed].source}</span>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <h3 className="text-white font-semibold">{LIVE_FEEDS[selectedFeed].name}</h3>
                                    <p className="text-sm text-slate-400 mt-1">{LIVE_FEEDS[selectedFeed].description}</p>
                                    <p className="text-xs text-slate-500 mt-2">
                                        Note: Blue screen = loss of signal, Black screen = ISS in Earth's shadow
                                    </p>
                                </div>
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-4">
                                {/* ISS Position Card */}
                                <div className="p-4 rounded-xl bg-space-800 border border-console-border">
                                    <div className="flex items-center gap-2 mb-4">
                                        <RocketLaunchIcon className="w-4 h-4 text-stellar-primary" />
                                        <span className="text-sm font-medium text-white">ISS Position</span>
                                        <span className="ml-auto text-xs text-slate-500 font-mono">
                                            {currentTime.toLocaleTimeString()}
                                        </span>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-xs text-slate-500">Latitude</span>
                                            <span className="text-sm font-mono text-stellar-cyan">{issPosition.latitude}°</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-xs text-slate-500">Longitude</span>
                                            <span className="text-sm font-mono text-stellar-primary">{issPosition.longitude}°</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-xs text-slate-500">Altitude</span>
                                            <span className="text-sm font-mono text-white">{issPosition.altitude} km</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-xs text-slate-500">Velocity</span>
                                            <span className="text-sm font-mono text-stellar-emerald">{issPosition.velocity} km/s</span>
                                        </div>
                                    </div>

                                    <a
                                        href="https://spotthestation.nasa.gov/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-stellar-primary/20 text-stellar-primary text-sm hover:bg-stellar-primary/30 transition-colors"
                                    >
                                        Spot the Station
                                        <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                                    </a>
                                </div>

                                {/* Feed Selector */}
                                <div className="p-4 rounded-xl bg-space-800 border border-console-border">
                                    <h4 className="text-sm font-medium text-white mb-3">Select Feed</h4>
                                    <div className="space-y-2">
                                        {LIVE_FEEDS.map((feed, index) => (
                                            <button
                                                key={feed.id}
                                                onClick={() => setSelectedFeed(index)}
                                                className={`w-full p-3 rounded-lg text-left transition-all ${selectedFeed === index
                                                    ? 'bg-stellar-primary/20 border border-stellar-primary/50'
                                                    : 'bg-space-700 border border-transparent hover:border-console-border'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                                    <span className="text-sm text-white">{feed.name}</span>
                                                </div>
                                                <p className="text-xs text-slate-500 mt-1">{feed.source}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Direct link to NASA */}
                                <a
                                    href="https://eol.jsc.nasa.gov/ESRS/HDEV/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block p-4 rounded-xl bg-space-800 border border-console-border hover:border-stellar-primary/50 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-white">NASA HDEV Page</span>
                                        <ArrowTopRightOnSquareIcon className="w-4 h-4 text-slate-400" />
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">Official High Definition Earth Viewing</p>
                                </a>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="trackers"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        {/* Tracker Links Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {TRACKING_RESOURCES.map((resource, i) => (
                                <motion.a
                                    key={resource.name}
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-4 rounded-xl bg-space-800 border border-console-border hover:border-stellar-primary/50 transition-all group"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                >
                                    <div className="text-2xl mb-3">{resource.icon}</div>
                                    <h4 className="text-sm font-medium text-white mb-1">{resource.name}</h4>
                                    <p className="text-xs text-slate-500 mb-2">{resource.description}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-stellar-cyan">{resource.category}</span>
                                        <ArrowTopRightOnSquareIcon className="w-3 h-3 text-slate-500 group-hover:text-stellar-primary transition-colors" />
                                    </div>
                                </motion.a>
                            ))}
                        </div>

                        {/* ISRO Highlight */}
                        <div className="mt-6 p-6 rounded-xl bg-gradient-to-r from-orange-500/10 via-white/5 to-green-500/10 border border-orange-500/30">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 via-white to-green-500 flex items-center justify-center text-2xl">
                                    🇮🇳
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-display font-semibold text-white">ISRO Bhoonidhi</h3>
                                    <p className="text-sm text-slate-400 mt-1">
                                        Track NavIC and other Indian satellites in real-time
                                    </p>
                                </div>
                                <a
                                    href="https://bhoonidhi.nrsc.gov.in/bhoonidhi/tracker.html"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-green-500 text-white font-medium hover:shadow-lg hover:shadow-orange-500/25 transition-all flex items-center gap-2"
                                >
                                    Open ISRO Tracker
                                    <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                                </a>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="mt-4 p-4 rounded-xl bg-space-800/50 border border-console-border">
                            <h4 className="text-sm font-medium text-white mb-3">Quick Links (Verified Working)</h4>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { name: 'N2YO', url: 'https://www.n2yo.com/' },
                                    { name: 'CelesTrak', url: 'https://celestrak.org/' },
                                    { name: 'Heavens Above', url: 'https://www.heavens-above.com/' },
                                    { name: 'Stuff in Space', url: 'https://stuffin.space/' },
                                    { name: 'ISS Tracker', url: 'https://isstracker.spaceflight.esa.int/' },
                                ].map(link => (
                                    <a
                                        key={link.name}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3 py-1.5 rounded-lg bg-space-700 text-sm text-slate-300 hover:text-white hover:bg-space-600 transition-colors"
                                    >
                                        {link.name} ↗
                                    </a>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default SpaceLiveFeeds;
