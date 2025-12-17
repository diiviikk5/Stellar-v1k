import { motion } from 'framer-motion';
import { CpuChipIcon, ClockIcon, CubeTransparentIcon, ChartBarIcon, BoltIcon, CircleStackIcon } from '@heroicons/react/24/outline';

const ArchitectureDiagram = () => {
    const layers = [
        {
            id: 'input',
            name: 'Input Layer',
            icon: CircleStackIcon,
            description: '7-day error time series',
            detail: '672 points × N satellites',
            color: 'from-blue-500 to-cyan-500'
        },
        {
            id: 'embed',
            name: 'Temporal Embedding',
            icon: ClockIcon,
            description: 'Position + time encoding',
            detail: '256-dim vectors',
            color: 'from-cyan-500 to-teal-500'
        },
        {
            id: 'transformer',
            name: 'Transformer Encoder',
            icon: CubeTransparentIcon,
            description: 'Self-attention layers',
            detail: '6 heads × 4 layers',
            color: 'from-teal-500 to-emerald-500'
        },
        {
            id: 'lstm',
            name: 'LSTM Bridge',
            icon: BoltIcon,
            description: 'Sequence memory',
            detail: 'Bidirectional × 2 layers',
            color: 'from-emerald-500 to-green-500'
        },
        {
            id: 'horizon',
            name: 'Multi-Horizon Head',
            icon: ChartBarIcon,
            description: 'Parallel decoders',
            detail: '8 horizons (15m → 24h)',
            color: 'from-violet-500 to-purple-500'
        },
        {
            id: 'output',
            name: 'Uncertainty Estimation',
            icon: CpuChipIcon,
            description: 'Gaussian mixture output',
            detail: 'Mean + Variance',
            color: 'from-purple-500 to-pink-500'
        }
    ];

    return (
        <div className="space-y-6">
            {/* Architecture Flow */}
            <div className="flex flex-col items-center gap-3">
                {layers.map((layer, index) => (
                    <motion.div
                        key={layer.id}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="w-full max-w-md"
                    >
                        <div className={`
              relative flex items-center gap-4 p-4 rounded-xl
              bg-gradient-to-r ${layer.color} bg-opacity-10
              border border-white/10 backdrop-blur-sm
              hover:border-white/20 transition-all duration-300
              group
            `}>
                            <div className={`
                w-12 h-12 rounded-lg flex items-center justify-center
                bg-gradient-to-br ${layer.color} shadow-lg
              `}>
                                <layer.icon className="w-6 h-6 text-white" />
                            </div>

                            <div className="flex-1">
                                <h4 className="text-white font-semibold text-sm">{layer.name}</h4>
                                <p className="text-slate-400 text-xs">{layer.description}</p>
                            </div>

                            <div className="text-right">
                                <span className="text-slate-500 text-xs font-mono">{layer.detail}</span>
                            </div>

                            {/* Connection line */}
                            {index < layers.length - 1 && (
                                <div className="absolute left-[30px] bottom-0 translate-y-full w-0.5 h-3 bg-gradient-to-b from-stellar-primary/50 to-transparent" />
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Model Specs */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8"
            >
                {[
                    { label: 'Parameters', value: '12.4M' },
                    { label: 'Training Time', value: '4.2h (A100)' },
                    { label: 'Inference', value: '< 50ms' },
                    { label: 'GPU Memory', value: '2.1 GB' }
                ].map((spec) => (
                    <div key={spec.label} className="text-center p-4 rounded-lg bg-space-800/50 border border-console-border">
                        <div className="text-xl font-display font-bold text-stellar-cyan">{spec.value}</div>
                        <div className="text-xs text-slate-500 font-mono mt-1">{spec.label}</div>
                    </div>
                ))}
            </motion.div>
        </div>
    );
};

export default ArchitectureDiagram;
