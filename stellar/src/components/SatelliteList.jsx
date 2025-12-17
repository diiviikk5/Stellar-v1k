import { motion } from 'framer-motion';
import StatusBadge from './StatusBadge';

const SatelliteList = ({ satellites, selectedId, onSelect }) => {
    const groupedSatellites = satellites.reduce((acc, sat) => {
        if (!acc[sat.constellation]) acc[sat.constellation] = [];
        acc[sat.constellation].push(sat);
        return acc;
    }, {});

    return (
        <div className="space-y-4">
            {Object.entries(groupedSatellites).map(([constellation, sats]) => (
                <div key={constellation}>
                    <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2 px-2">
                        {constellation}
                    </div>
                    <div className="space-y-1">
                        {sats.map((sat, index) => (
                            <motion.button
                                key={sat.id}
                                onClick={() => onSelect(sat)}
                                className={`
                  w-full flex items-center justify-between px-3 py-2.5 rounded-lg
                  text-left transition-all duration-200
                  ${selectedId === sat.id
                                        ? 'bg-gradient-to-r from-stellar-primary/20 to-transparent border-l-2 border-stellar-primary'
                                        : 'hover:bg-white/5'
                                    }
                `}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ x: 4 }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`
                    w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold
                    ${selectedId === sat.id
                                            ? 'bg-stellar-primary/30 text-stellar-primary'
                                            : 'bg-space-700/50 text-slate-400'
                                        }
                  `}>
                                        {sat.id}
                                    </div>
                                    <div>
                                        <div className={`text-sm font-medium ${selectedId === sat.id ? 'text-white' : 'text-slate-300'}`}>
                                            {sat.name}
                                        </div>
                                        <div className="text-xs text-slate-500 font-mono">
                                            {sat.orbit} • PRN {sat.prn}
                                        </div>
                                    </div>
                                </div>
                                <StatusBadge status={sat.status} size="sm" />
                            </motion.button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SatelliteList;
