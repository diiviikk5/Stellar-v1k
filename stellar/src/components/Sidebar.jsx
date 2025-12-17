import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    HomeIcon,
    GlobeAltIcon,
    BeakerIcon,
    ChartBarIcon,
    DocumentArrowDownIcon,
    SignalIcon
} from '@heroicons/react/24/outline';

const navigation = [
    { name: 'Command Deck', href: '/dashboard', icon: HomeIcon },
    { name: 'Satellite Console', href: '/console', icon: GlobeAltIcon },
    { name: 'Forecast Lab', href: '/forecast-lab', icon: BeakerIcon },
    { name: 'Uncertainty & Residuals', href: '/residuals', icon: ChartBarIcon },
    { name: 'Export Bulletin', href: '/export', icon: DocumentArrowDownIcon },
];

const Sidebar = () => {
    const location = useLocation();

    return (
        <aside className="fixed left-0 top-0 h-full w-64 bg-space-900/80 backdrop-blur-xl border-r border-amber-500/10 z-40">
            {/* Logo Section */}
            <div className="p-6 border-b border-amber-500/10">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-glow">
                            <SignalIcon className="w-6 h-6 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 shadow-glow-amber animate-pulse" />
                    </div>
                    <div>
                        <h1 className="font-display font-bold text-lg tracking-wider text-white">
                            STELLAR
                        </h1>
                        <p className="text-[10px] font-mono text-amber-400/80 tracking-widest">
                            v1k • GNSS CONSOLE
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="p-4 space-y-1">
                {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                        <NavLink
                            key={item.name}
                            to={item.href}
                            className="block"
                        >
                            <motion.div
                                className={`
                                    relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                                    ${isActive
                                        ? 'bg-amber-500/10 text-amber-400'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }
                                `}
                                whileHover={{ x: 4 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="text-sm">{item.name}</span>
                                {isActive && (
                                    <motion.div
                                        layoutId="activeIndicator"
                                        className="absolute right-3 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-glow-amber"
                                    />
                                )}
                            </motion.div>
                        </NavLink>
                    );
                })}
            </nav>

            {/* System Status */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-amber-500/10">
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-mono">System Status</span>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                            <span className="text-amber-400 font-mono">ONLINE</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 font-mono">CPU Load</span>
                            <span className="text-slate-300 font-mono">23%</span>
                        </div>
                        <div className="h-1 bg-space-700 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" style={{ width: '23%' }} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-mono">Last Sync</span>
                        <span className="text-amber-400/80 font-mono">
                            {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </span>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
