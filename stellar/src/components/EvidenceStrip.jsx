import { motion } from 'framer-motion';

const EvidenceStrip = ({
    validationWindow = 'Day 7 → Day 8',
    baselineRMSE = '0.42',
    stellarRMSE = '0.18',
    improvement = '57%'
}) => {
    return (
        <motion.div
            className="evidence-strip"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
        >
            <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-stellar-primary animate-pulse" />
                <span className="text-slate-400 font-medium">Evidence</span>
            </div>

            <div className="h-4 w-px bg-console-border" />

            <div className="metric">
                <span className="metric-label">Validation:</span>
                <span className="metric-value">{validationWindow}</span>
            </div>

            <div className="h-4 w-px bg-console-border" />

            <div className="metric">
                <span className="metric-label">Baseline RMSE:</span>
                <span className="text-stellar-amber">{baselineRMSE}</span>
            </div>

            <div className="h-4 w-px bg-console-border" />

            <div className="metric">
                <span className="metric-label">Stellar-v1k RMSE:</span>
                <span className="text-stellar-emerald">{stellarRMSE}</span>
            </div>

            <div className="h-4 w-px bg-console-border" />

            <div className="metric">
                <span className="metric-label">Improvement:</span>
                <span className="text-stellar-cyan font-semibold">{improvement}</span>
            </div>
        </motion.div>
    );
};

export default EvidenceStrip;
