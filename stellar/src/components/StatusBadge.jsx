import { motion } from 'framer-motion';

const StatusBadge = ({ status, size = 'md' }) => {
    const getStatusConfig = () => {
        switch (status) {
            case 'healthy':
                return {
                    label: 'Healthy',
                    bgClass: 'bg-stellar-emerald/20',
                    textClass: 'text-stellar-emerald',
                    borderClass: 'border-stellar-emerald/30',
                    dotClass: 'bg-stellar-emerald'
                };
            case 'warning':
                return {
                    label: 'Warning',
                    bgClass: 'bg-stellar-amber/20',
                    textClass: 'text-stellar-amber',
                    borderClass: 'border-stellar-amber/30',
                    dotClass: 'bg-stellar-amber'
                };
            case 'flagged':
                return {
                    label: 'Flagged',
                    bgClass: 'bg-stellar-rose/20',
                    textClass: 'text-stellar-rose',
                    borderClass: 'border-stellar-rose/30',
                    dotClass: 'bg-stellar-rose'
                };
            default:
                return {
                    label: 'Unknown',
                    bgClass: 'bg-slate-500/20',
                    textClass: 'text-slate-400',
                    borderClass: 'border-slate-500/30',
                    dotClass: 'bg-slate-500'
                };
        }
    };

    const config = getStatusConfig();
    const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

    return (
        <span className={`
      inline-flex items-center gap-1.5 ${sizeClasses} rounded-full font-mono font-medium
      ${config.bgClass} ${config.textClass} border ${config.borderClass}
    `}>
            <motion.span
                className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`}
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
            />
            {config.label}
        </span>
    );
};

export default StatusBadge;
