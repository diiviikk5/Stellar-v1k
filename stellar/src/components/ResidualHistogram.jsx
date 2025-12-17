import { useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    Cell
} from 'recharts';
import { motion } from 'framer-motion';

const ResidualHistogram = ({ residuals, height = 300 }) => {
    const histogramData = useMemo(() => {
        if (!residuals || residuals.length === 0) return [];

        const min = Math.min(...residuals);
        const max = Math.max(...residuals);
        const numBins = 25;
        const binWidth = (max - min) / numBins;

        const bins = Array(numBins).fill(0).map((_, i) => ({
            x: min + (i + 0.5) * binWidth,
            label: (min + (i + 0.5) * binWidth).toFixed(2),
            count: 0,
            binStart: min + i * binWidth,
            binEnd: min + (i + 1) * binWidth
        }));

        residuals.forEach(value => {
            const binIndex = Math.min(Math.floor((value - min) / binWidth), numBins - 1);
            if (binIndex >= 0 && binIndex < numBins) {
                bins[binIndex].count++;
            }
        });

        // Normalize for density
        const totalCount = residuals.length;
        bins.forEach(bin => {
            bin.density = bin.count / totalCount;
        });

        return bins;
    }, [residuals]);

    const mean = useMemo(() => {
        if (!residuals || residuals.length === 0) return 0;
        return residuals.reduce((a, b) => a + b, 0) / residuals.length;
    }, [residuals]);

    const CustomTooltip = ({ active, payload }) => {
        if (!active || !payload || !payload.length) return null;
        const data = payload[0].payload;

        return (
            <div className="stellar-tooltip">
                <div className="text-xs text-slate-400 mb-1">
                    Range: [{data.binStart.toFixed(3)}, {data.binEnd.toFixed(3)})
                </div>
                <div className="flex justify-between gap-4">
                    <span className="text-slate-400">Count:</span>
                    <span className="text-stellar-cyan font-mono">{data.count}</span>
                </div>
                <div className="flex justify-between gap-4">
                    <span className="text-slate-400">Density:</span>
                    <span className="text-stellar-primary font-mono">{(data.density * 100).toFixed(1)}%</span>
                </div>
            </div>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full"
        >
            <ResponsiveContainer width="100%" height={height}>
                <BarChart data={histogramData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity={0.6} />
                        </linearGradient>
                    </defs>

                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(71, 85, 105, 0.3)"
                        vertical={false}
                    />

                    <XAxis
                        dataKey="x"
                        stroke="#64748b"
                        tick={{ fill: '#64748b', fontSize: 10 }}
                        axisLine={{ stroke: '#334155' }}
                        tickFormatter={(v) => v.toFixed(1)}
                        label={{
                            value: 'Residual Value',
                            position: 'bottom',
                            offset: 0,
                            style: { fill: '#64748b', fontSize: 11 }
                        }}
                    />

                    <YAxis
                        stroke="#64748b"
                        tick={{ fill: '#64748b', fontSize: 10 }}
                        axisLine={{ stroke: '#334155' }}
                        label={{
                            value: 'Count',
                            angle: -90,
                            position: 'insideLeft',
                            style: { fill: '#64748b', fontSize: 11 }
                        }}
                    />

                    <Tooltip content={<CustomTooltip />} />

                    <ReferenceLine
                        x={mean}
                        stroke="#f59e0b"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        label={{
                            value: `μ=${mean.toFixed(3)}`,
                            position: 'top',
                            fill: '#f59e0b',
                            fontSize: 10
                        }}
                    />

                    <ReferenceLine
                        x={0}
                        stroke="#10b981"
                        strokeWidth={1}
                    />

                    <Bar
                        dataKey="count"
                        fill="url(#barGradient)"
                        radius={[4, 4, 0, 0]}
                    >
                        {histogramData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={Math.abs(entry.x) < 0.3 ? '#10b981' : '#3b82f6'}
                                fillOpacity={0.8}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </motion.div>
    );
};

export default ResidualHistogram;
