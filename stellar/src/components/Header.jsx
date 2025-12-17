import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    MagnifyingGlassIcon,
    BellIcon,
    UserCircleIcon,
    Cog6ToothIcon
} from '@heroicons/react/24/outline';

const Header = ({ title, subtitle }) => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <motion.header
            className="sticky top-0 z-30 backdrop-blur-xl bg-space-900/60 border-b border-amber-500/10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="px-8 py-4 flex items-center justify-between">
                {/* Left: Page Title */}
                <div>
                    <motion.h1
                        className="text-2xl font-display font-bold text-white tracking-wide"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        {title}
                    </motion.h1>
                    {subtitle && (
                        <motion.p
                            className="text-sm text-slate-400 mt-1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            {subtitle}
                        </motion.p>
                    )}
                </div>

                {/* Right: Clock, Search, Actions */}
                <div className="flex items-center gap-6">
                    {/* UTC Clock */}
                    <motion.div
                        className="text-right"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="font-mono text-xl font-semibold text-amber-400">
                            {formatTime(currentTime)}
                            <span className="text-amber-400/60 text-xs ml-2">UTC</span>
                        </div>
                        <div className="font-mono text-xs text-slate-500">
                            {formatDate(currentTime)}
                        </div>
                    </motion.div>

                    {/* Divider */}
                    <div className="w-px h-10 bg-amber-500/10" />

                    {/* Search */}
                    <motion.div
                        className="relative"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search satellites..."
                            className="w-48 pl-10 pr-4 py-2 rounded-lg bg-space-800/50 border border-amber-500/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/30 transition-colors"
                        />
                    </motion.div>

                    {/* Action Icons */}
                    <motion.div
                        className="flex items-center gap-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <button className="relative p-2 rounded-lg hover:bg-white/5 transition-colors group">
                            <BellIcon className="w-5 h-5 text-slate-400 group-hover:text-amber-400 transition-colors" />
                            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-white/5 transition-colors group">
                            <Cog6ToothIcon className="w-5 h-5 text-slate-400 group-hover:text-amber-400 transition-colors" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-white/5 transition-colors group">
                            <UserCircleIcon className="w-6 h-6 text-slate-400 group-hover:text-amber-400 transition-colors" />
                        </button>
                    </motion.div>
                </div>
            </div>
        </motion.header>
    );
};

export default Header;
