import { motion } from 'framer-motion';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, MinusIcon } from '@heroicons/react/24/solid';

const KPICard = ({
    label,
    value,
    unit = '',
    trend = 'stable',
    subtitle,
    icon: Icon,
    color = 'blue',
    delay = 0
}) => {
    const getTrendIcon = () => {
        switch (trend) {
            case 'up':
                return <ArrowTrendingUpIcon className="w-4 h-4 text-stellar-emerald" />;
            case 'down':
                return <ArrowTrendingDownIcon className="w-4 h-4 text-stellar-rose" />;
            default:
                return <MinusIcon className="w-4 h-4 text-slate-400" />;
        }
    };

    const getColorClasses = () => {
        switch (color) {
            case 'cyan':
                return 'from-stellar-cyan to-blue-400';
            case 'emerald':
                return 'from-stellar-emerald to-green-400';
            case 'amber':
                return 'from-stellar-amber to-yellow-400';
            case 'rose':
                return 'from-stellar-rose to-pink-400';
            case 'purple':
                return 'from-stellar-accent to-purple-400';
            default:
                return 'from-stellar-primary to-stellar-secondary';
        }
    };

    const getGlowClass = () => {
        switch (color) {
            case 'cyan':
                return 'shadow-glow-cyan';
            case 'emerald':
                return 'shadow-glow-emerald';
            case 'amber':
                return 'shadow-glow-amber';
            case 'rose':
                return 'shadow-glow-rose';
            default:
                return 'shadow-glow';
        }
    };

    return (
        <motion.div
            className="kpi-card group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            whileHover={{ scale: 1.02, y: -2 }}
        >
            {/* Glow effect on hover */}
            <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${getGlowClass()} blur-xl`} />

            <div className="relative">
                <div className="flex items-start justify-between mb-3">
                    <span className="kpi-label">{label}</span>
                    {Icon && (
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${getColorClasses()} bg-opacity-20`}>
                            <Icon className="w-4 h-4 text-white/80" />
                        </div>
                    )}
                </div>

                <div className="flex items-end gap-2">
                    <span className={`kpi-value bg-gradient-to-r ${getColorClasses()} bg-clip-text text-transparent`}>
                        {value}
                    </span>
                    {unit && (
                        <span className="text-lg text-slate-400 font-mono mb-1">{unit}</span>
                    )}
                    <div className="ml-auto mb-1">
                        {getTrendIcon()}
                    </div>
                </div>

                {subtitle && (
                    <p className="kpi-subtitle mt-2">{subtitle}</p>
                )}
            </div>
        </motion.div>
    );
};

export default KPICard;
