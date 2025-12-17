import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
    RocketLaunchIcon,
    GlobeAltIcon,
    ShieldCheckIcon,
    BoltIcon,
    ChartBarIcon,
    ClockIcon,
    SignalIcon,
    ArrowDownIcon,
    SparklesIcon,
    CpuChipIcon,
    ArrowLongRightIcon
} from '@heroicons/react/24/outline';
import Galaxy from '../components/Galaxy';

// Detect if device is mobile for optimizations
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

// Feature Card Component - simplified animations for performance
const FeatureCard = ({ icon: Icon, title, description, delay, gradient }) => (
    <motion.div
        className="relative group pointer-events-auto"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-20px" }}
        transition={{ delay: isMobile ? 0 : delay, duration: 0.5, ease: "easeOut" }}
    >
        <div
            className="absolute inset-0 opacity-0 group-hover:opacity-60 transition-opacity duration-500 rounded-2xl blur-2xl will-change-transform"
            style={{ background: gradient }}
        />
        <div className="relative p-6 md:p-8 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/[0.08] hover:border-amber-500/20 transition-colors duration-300 h-full">
            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-5 md:mb-6`}>
                <Icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </div>
            <h3 className="text-lg md:text-xl font-display font-bold text-white mb-2 md:mb-3">{title}</h3>
            <p className="text-slate-400 leading-relaxed text-sm md:text-[15px]">{description}</p>
        </div>
    </motion.div>
);

// Stats Counter Component - optimized with reduced re-renders
const StatCounter = ({ value, label, suffix = '', delay }) => {
    const [count, setCount] = useState(0);
    const [hasStarted, setHasStarted] = useState(false);
    const numValue = parseFloat(value);

    useEffect(() => {
        if (!hasStarted) return;

        const duration = 2000;
        const steps = 40; // Reduced steps for better performance
        const increment = numValue / steps;
        let current = 0;

        const interval = setInterval(() => {
            current += increment;
            if (current >= numValue) {
                setCount(numValue);
                clearInterval(interval);
            } else {
                setCount(current);
            }
        }, duration / steps);

        return () => clearInterval(interval);
    }, [numValue, hasStarted]);

    return (
        <motion.div
            className="text-center pointer-events-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: isMobile ? 0 : delay, duration: 0.4 }}
            onViewportEnter={() => setHasStarted(true)}
        >
            <div className="text-4xl sm:text-5xl md:text-6xl font-display font-bold bg-gradient-to-r from-amber-400 via-orange-500 to-amber-300 bg-clip-text text-transparent">
                {value.includes('.') ? count.toFixed(1) : Math.floor(count)}{suffix}
            </div>
            <div className="text-slate-500 mt-2 md:mt-3 text-[10px] md:text-xs uppercase tracking-[0.15em] md:tracking-[0.2em]">{label}</div>
        </motion.div>
    );
};

const Landing = () => {
    const navigate = useNavigate();
    const { scrollYProgress } = useScroll();
    const [showGalaxy, setShowGalaxy] = useState(false);

    // Simplified transforms for smoother scrolling
    const heroOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);
    const heroY = useTransform(scrollYProgress, [0, 0.12], [0, -60]);

    // Overlapping fade for seamless transition
    const videoOpacity = useTransform(scrollYProgress, [0, 0.1, 0.18], [1, 1, 0]);
    const galaxyOpacity = useTransform(scrollYProgress, [0.06, 0.15], [0, 1]);

    // Only mount Galaxy after scrolling past 5% to prevent GPU contention with video
    useEffect(() => {
        const unsubscribe = scrollYProgress.on("change", (value) => {
            if (value > 0.05 && !showGalaxy) {
                setShowGalaxy(true);
            }
        });
    }, [scrollYProgress, showGalaxy]);

    const handleEnterConsole = () => {
        navigate('/dashboard');
    };

    return (
        <div className="relative text-white overflow-x-hidden bg-black">

            {/* ==================== FIXED BACKGROUNDS ==================== */}

            {/* Video Background - Optimized for HQ video */}
            <motion.div
                className="fixed inset-0 z-0"
                style={{ opacity: videoOpacity }}
            >
                <video
                    key="hero-video-v2"
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    className="absolute w-full h-full object-cover"
                    src="/hole.mp4?v=2"
                />

                {/* Lighter overlays to showcase HQ video quality */}
                <div className="absolute inset-0 bg-black/35 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/30 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/15 pointer-events-none" />
            </motion.div>

            {/* Galaxy Background - Only mounts after scrolling to prevent GPU contention */}
            {showGalaxy && (
                <motion.div
                    className="fixed inset-0 z-0"
                    style={{ opacity: galaxyOpacity }}
                >
                    <Galaxy
                        hueShift={30}
                        density={isMobile ? 0.7 : 1.0}
                        speed={0.4}
                        glowIntensity={isMobile ? 0.3 : 0.45}
                        saturation={0.35}
                        twinkleIntensity={isMobile ? 0.25 : 0.4}
                        rotationSpeed={0.008}
                        mouseRepulsion={!isMobile}
                        repulsionStrength={1.5}
                    />
                </motion.div>
            )}

            {/* ==================== HERO SECTION ==================== */}
            <motion.section
                className="relative min-h-screen flex items-center z-10"
                style={{ opacity: heroOpacity, y: heroY }}
            >
                {/* Hero Content - Responsive */}
                <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 md:px-16 lg:px-24">
                    <div className="max-w-xl">
                        {/* Glowing line accent */}
                        <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                            className="w-16 md:w-20 h-[2px] bg-gradient-to-r from-orange-500 to-amber-400 rounded-full mb-6 md:mb-10 origin-left"
                        />

                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                            className="inline-flex items-center gap-2 md:gap-3 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-white/[0.05] border border-white/[0.1] backdrop-blur-sm mb-6 md:mb-8"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                            <span className="text-[10px] md:text-xs font-mono text-white/70 tracking-wider">GNSS MISSION CONTROL</span>
                        </motion.div>

                        {/* Main Title */}
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.7 }}
                            className="mb-6 md:mb-8"
                        >
                            <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-display font-black tracking-tight text-white leading-[0.9]">
                                STELLAR
                            </span>
                            <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-extralight tracking-[0.2em] md:tracking-[0.25em] text-orange-200/80 mt-2 md:mt-3">
                                v1k
                            </span>
                        </motion.h1>

                        {/* Tagline */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7, duration: 0.6 }}
                            className="text-base md:text-lg lg:text-xl text-white/60 mb-2 md:mb-3 leading-relaxed font-light"
                        >
                            Peer into the depths of satellite navigation.
                        </motion.p>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8, duration: 0.6 }}
                            className="text-sm md:text-base text-white/40 mb-8 md:mb-12 leading-relaxed max-w-md"
                        >
                            AI-Powered Early Warning System that predicts GNSS errors{' '}
                            <span className="text-orange-300/80">before they happen</span>.
                        </motion.p>

                        {/* CTA Button */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1, duration: 0.6 }}
                            className="flex flex-col sm:flex-row items-start gap-4 md:gap-6"
                        >
                            <motion.button
                                onClick={handleEnterConsole}
                                className="group relative px-6 md:px-8 py-3 md:py-4 rounded-full font-medium text-sm tracking-wide bg-white text-black hover:bg-orange-50 transition-colors duration-200 active:scale-95"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <span className="relative flex items-center gap-2 md:gap-3">
                                    ENTER MISSION CONTROL
                                    <ArrowLongRightIcon className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform duration-200" />
                                </span>
                            </motion.button>

                            <motion.a
                                href="#discover"
                                className="hidden sm:flex px-4 py-4 font-light text-sm text-white/40 hover:text-orange-300/80 transition-colors duration-200 items-center gap-2"
                            >
                                Scroll to explore
                                <ArrowDownIcon className="w-3.5 h-3.5" />
                            </motion.a>
                        </motion.div>

                        {/* Stats Preview - Hidden on small mobile */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.2, duration: 0.6 }}
                            className="hidden sm:flex gap-6 md:gap-10 mt-12 md:mt-20 pt-6 md:pt-8 border-t border-white/[0.06]"
                        >
                            {[
                                { value: '98.2%', label: 'Accuracy' },
                                { value: '57%', label: 'Error Reduction' },
                                { value: '<50ms', label: 'Inference' },
                            ].map((stat, i) => (
                                <div key={stat.label} className="text-left">
                                    <div className="text-lg md:text-xl lg:text-2xl font-display font-semibold text-white/90">{stat.value}</div>
                                    <div className="text-[9px] md:text-[10px] text-white/30 uppercase tracking-[0.12em] md:tracking-[0.15em] mt-1">{stat.label}</div>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    transition={{ delay: 2 }}
                >
                    <motion.div
                        animate={{ y: [0, 6, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <ArrowDownIcon className="w-4 h-4 text-white/50" />
                    </motion.div>
                </motion.div>
            </motion.section>

            {/* ==================== SCROLLABLE CONTENT ==================== */}
            <div className="relative z-10">

                {/* Stats Section */}
                <section id="discover" className="relative py-20 md:py-40 px-4 md:px-6 pointer-events-none">
                    <div className="max-w-5xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="text-center mb-12 md:mb-20"
                        >
                            <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-semibold text-white mb-3 md:mb-4">
                                Performance Metrics
                            </h2>
                            <p className="text-slate-500 text-xs md:text-sm">Real-world validated results</p>
                        </motion.div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-16">
                            <StatCounter value="98.2" suffix="%" label="Accuracy" delay={0} />
                            <StatCounter value="57" suffix="%" label="Error Reduction" delay={0.1} />
                            <StatCounter value="12" label="Satellites" delay={0.2} />
                            <StatCounter value="24" suffix="h" label="Horizon" delay={0.3} />
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="relative py-16 md:py-32 px-4 md:px-6 pointer-events-none">
                    <div className="max-w-7xl mx-auto">
                        {/* Section Header */}
                        <motion.div
                            className="text-center mb-12 md:mb-20"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-white/[0.03] border border-white/[0.08] mb-6 md:mb-8 pointer-events-auto">
                                <SparklesIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-500" />
                                <span className="text-[10px] md:text-xs font-mono text-white/60 tracking-wider">ADVANCED CAPABILITIES</span>
                            </div>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-semibold mb-3 md:mb-5">
                                <span className="text-white">Predictive Intelligence</span>
                            </h2>
                            <p className="text-base md:text-xl text-slate-500 font-light">for GNSS Operations</p>
                        </motion.div>

                        {/* Feature Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                            <FeatureCard
                                icon={CpuChipIcon}
                                title="Transformer-LSTM Hybrid"
                                description="Neural architecture combining attention with sequential memory for superior forecasting."
                                delay={0}
                                gradient="from-amber-500 to-orange-600"
                            />
                            <FeatureCard
                                icon={ClockIcon}
                                title="Multi-Horizon Prediction"
                                description="Forecasts across 8 time horizons from 15 minutes to 24 hours."
                                delay={0.05}
                                gradient="from-orange-500 to-red-500"
                            />
                            <FeatureCard
                                icon={ShieldCheckIcon}
                                title="Uncertainty Quantification"
                                description="Calibrated confidence intervals for every prediction you make."
                                delay={0.1}
                                gradient="from-amber-600 to-yellow-500"
                            />
                            <FeatureCard
                                icon={GlobeAltIcon}
                                title="Multi-Constellation"
                                description="Monitor GPS, Galileo, GLONASS, BeiDou satellites."
                                delay={0.15}
                                gradient="from-orange-400 to-amber-500"
                            />
                            <FeatureCard
                                icon={BoltIcon}
                                title="Real-Time Processing"
                                description="Sub-50ms inference time for real-time predictions."
                                delay={0.2}
                                gradient="from-red-500 to-orange-500"
                            />
                            <FeatureCard
                                icon={ChartBarIcon}
                                title="Operational Bulletins"
                                description="Export in industry-standard formats."
                                delay={0.25}
                                gradient="from-amber-500 to-orange-500"
                            />
                        </div>
                    </div>
                </section>

                {/* How It Works - Simplified for mobile */}
                <section className="relative py-16 md:py-32 px-4 md:px-6 pointer-events-none">
                    <div className="max-w-5xl mx-auto">
                        <motion.div
                            className="text-center mb-12 md:mb-20"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-semibold text-white mb-3 md:mb-4">
                                How It Works
                            </h2>
                            <p className="text-slate-500 text-sm md:text-base font-light max-w-lg mx-auto">
                                From satellite telemetry to predictions
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-8">
                            {[
                                { step: '01', title: 'Ingest', description: '7 days of error measurements', icon: SignalIcon },
                                { step: '02', title: 'Process', description: 'AI learns temporal patterns', icon: CpuChipIcon },
                                { step: '03', title: 'Predict', description: 'Day-8 forecasts generated', icon: ChartBarIcon },
                            ].map((item, index) => (
                                <motion.div
                                    key={item.step}
                                    className="relative text-center pointer-events-auto"
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: isMobile ? 0 : index * 0.1, duration: 0.5 }}
                                >
                                    <div className="w-16 h-16 md:w-20 md:h-20 mx-auto rounded-2xl flex items-center justify-center mb-5 md:mb-8 bg-white/[0.03] border border-white/[0.08]">
                                        <item.icon className="w-7 h-7 md:w-9 md:h-9 text-amber-400/70" />
                                    </div>
                                    <h3 className="text-lg md:text-xl font-display font-semibold text-white mb-2 md:mb-3">{item.title}</h3>
                                    <p className="text-slate-500 text-xs md:text-sm">{item.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="relative py-16 md:py-32 px-4 md:px-6 pointer-events-none">
                    <div className="max-w-3xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="relative p-8 md:p-16 lg:p-24 rounded-2xl md:rounded-3xl overflow-hidden pointer-events-auto"
                        >
                            <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-xl" />
                            <div className="absolute inset-0 border border-white/[0.06] rounded-2xl md:rounded-3xl" />

                            <div className="relative z-10">
                                <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-semibold text-white mb-4 md:mb-5">
                                    Ready for Liftoff?
                                </h2>
                                <p className="text-sm md:text-lg text-slate-400 mb-8 md:mb-12 font-light max-w-md mx-auto">
                                    Enter Mission Control and experience the future of GNSS prediction.
                                </p>

                                <motion.button
                                    onClick={handleEnterConsole}
                                    className="group px-8 md:px-10 py-4 md:py-5 rounded-full font-medium text-sm md:text-base tracking-wide bg-white text-black hover:bg-slate-100 transition-colors duration-200 active:scale-95"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <span className="flex items-center gap-2 md:gap-3">
                                        <RocketLaunchIcon className="w-4 h-4 md:w-5 md:h-5" />
                                        LAUNCH MISSION CONTROL
                                    </span>
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="relative py-10 md:py-16 px-4 md:px-6 border-t border-white/[0.04] pointer-events-none">
                    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
                        <div className="flex items-center gap-3 md:gap-4 pointer-events-auto">
                            <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                                <SignalIcon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                            </div>
                            <div>
                                <div className="font-display font-semibold text-white text-xs md:text-sm">STELLAR-v1k</div>
                                <div className="text-[10px] md:text-[11px] text-slate-600">GNSS Forecasting Console</div>
                            </div>
                        </div>

                        <div className="text-[10px] md:text-xs text-slate-600">
                            © 2024 Stellar Mission Control
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default Landing;
