import { useState } from 'react';
import { motion } from 'framer-motion';

const HorizonSelector = ({ horizons, selectedHorizon, onSelect }) => {
    return (
        <div className="flex items-center gap-2 p-1 bg-space-800/50 rounded-lg border border-console-border">
            {horizons.map((horizon) => (
                <motion.button
                    key={horizon}
                    onClick={() => onSelect(horizon)}
                    className={`
            relative px-4 py-2 rounded-md text-sm font-mono font-medium
            transition-colors duration-200
            ${selectedHorizon === horizon
                            ? 'text-white'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }
          `}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {selectedHorizon === horizon && (
                        <motion.div
                            layoutId="horizonIndicator"
                            className="absolute inset-0 bg-gradient-to-r from-stellar-primary to-stellar-secondary rounded-md"
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                    )}
                    <span className="relative z-10">{horizon}</span>
                </motion.button>
            ))}
        </div>
    );
};

export default HorizonSelector;
