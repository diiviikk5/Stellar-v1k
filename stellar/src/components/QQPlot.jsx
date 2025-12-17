import { useMemo } from 'react';
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import { motion } from 'framer-motion';

const QQPlot = ({ residuals, height = 300 }) => {
    const qqData = useMemo(() => {
        if (!residuals || residuals.length === 0) return [];

        const sorted = [...residuals].sort((a, b) => a - b);
        const n = sorted.length;

        return sorted.map((value, i) => {
            const p = (i + 0.5) / n;
            // Inverse normal CDF approximation
            const theoretical = approximateInverseNormal(p);
            return {
                theoretical,
                actual: value,
                percentile: ((i + 1) / n * 100).toFixed(0)
            };
        });
    }, [residuals]);

    // Approximation of inverse normal CDF
    function approximateInverseNormal(p) {
        if (p <= 0) return -3;
        if (p >= 1) return 3;

        const a = [
            -3.969683028665376e+01,
            2.209460984245205e+02,
            -2.759285104469687e+02,
            1.383577518672690e+02,
            -3.066479806614716e+01,
            2.506628277459239e+00
        ];
        const b = [
            -5.447609879822406e+01,
            1.615858368580409e+02,
            -1.556989798598866e+02,
            6.680131188771972e+01,
            -1.328068155288572e+01
        ];
        const c = [
            -7.784894002430293e-03,
            -3.223964580411365e-01,
            -2.400758277161838e+00,
            -2.549732539343734e+00,
            4.374664141464968e+00,
            2.938163982698783e+00
        ];
        const d = [
            7.784695709041462e-03,
            3.224671290700398e-01,
            2.445134137142996e+00,
            3.754408661907416e+00
        ];

        const pLow = 0.02425;
        const pHigh = 1 - pLow;
        let q, r;

        if (p < pLow) {
            q = Math.sqrt(-2 * Math.log(p));
            return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
                ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
        } else if (p <= pHigh) {
            q = p - 0.5;
            r = q * q;
            return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
                (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
        } else {
            q = Math.sqrt(-2 * Math.log(1 - p));
            return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
                ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
        }
    }

    const CustomTooltip = ({ active, payload }) => {
        if (!active || !payload || !payload.length) return null;
        const data = payload[0].payload;

        return (
            <div className="stellar-tooltip">
                <div className="text-xs text-slate-400 mb-2">
                    Percentile: {data.percentile}%
                </div>
                <div className="flex justify-between gap-4">
                    <span className="text-slate-400">Theoretical:</span>
                    <span className="text-stellar-cyan font-mono">{data.theoretical.toFixed(3)}</span>
                </div>
                <div className="flex justify-between gap-4">
                    <span className="text-slate-400">Actual:</span>
                    <span className="text-stellar-primary font-mono">{data.actual.toFixed(3)}</span>
                </div>
            </div>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full"
        >
            <ResponsiveContainer width="100%" height={height}>
                <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(71, 85, 105, 0.3)"
                    />

                    <XAxis
                        type="number"
                        dataKey="theoretical"
                        name="Theoretical"
                        stroke="#64748b"
                        tick={{ fill: '#64748b', fontSize: 10 }}
                        axisLine={{ stroke: '#334155' }}
                        domain={[-3, 3]}
                        label={{
                            value: 'Theoretical Quantiles',
                            position: 'bottom',
                            offset: 0,
                            style: { fill: '#64748b', fontSize: 11 }
                        }}
                    />

                    <YAxis
                        type="number"
                        dataKey="actual"
                        name="Actual"
                        stroke="#64748b"
                        tick={{ fill: '#64748b', fontSize: 10 }}
                        axisLine={{ stroke: '#334155' }}
                        label={{
                            value: 'Sample Quantiles',
                            angle: -90,
                            position: 'insideLeft',
                            style: { fill: '#64748b', fontSize: 11 }
                        }}
                    />

                    <Tooltip content={<CustomTooltip />} />

                    {/* Reference line (y = x) */}
                    <ReferenceLine
                        segment={[{ x: -3, y: -3 }, { x: 3, y: 3 }]}
                        stroke="#10b981"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                    />

                    <Scatter
                        data={qqData}
                        fill="#3b82f6"
                        fillOpacity={0.7}
                    />
                </ScatterChart>
            </ResponsiveContainer>
        </motion.div>
    );
};

export default QQPlot;
