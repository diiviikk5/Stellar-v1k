import { motion } from 'framer-motion';

const LoadingSpinner = ({ text = 'Processing...', size = 'md' }) => {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16'
    };

    return (
        <div className="flex flex-col items-center justify-center gap-4">
            <div className={`relative ${sizeClasses[size]}`}>
                {/* Outer ring */}
                <motion.div
                    className="absolute inset-0 rounded-full border-2 border-stellar-primary/30"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                />

                {/* Middle ring */}
                <motion.div
                    className="absolute inset-1 rounded-full border-2 border-t-stellar-cyan border-r-transparent border-b-transparent border-l-transparent"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />

                {/* Inner ring */}
                <motion.div
                    className="absolute inset-2 rounded-full border-2 border-t-transparent border-r-stellar-accent border-b-transparent border-l-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                />

                {/* Center dot */}
                <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                >
                    <div className="w-2 h-2 rounded-full bg-stellar-primary shadow-glow" />
                </motion.div>
            </div>

            {text && (
                <motion.p
                    className="text-sm font-mono text-slate-400"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    {text}
                </motion.p>
            )}
        </div>
    );
};

export default LoadingSpinner;
