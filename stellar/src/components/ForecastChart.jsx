import { useMemo } from 'react';
import {
    ComposedChart,
    Line,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    Legend
} from 'recharts';
import { motion } from 'framer-motion';

const ForecastChart = ({
    pastData,
    forecastData,
    showBaseline = false,
    showConfidence = true,
    height = 400
}) => {
    const combinedData = useMemo(() => {
        const past = pastData.map(d => ({
            ...d,
            historical: d.value,
            time: new Date(d.time).getTime()
        }));

        const now = past.length > 0 ? past[past.length - 1].time : Date.now();

        const forecast = forecastData.map(d => ({
            ...d,
            predicted: d.value,
            time: new Date(d.time).getTime()
        }));

        // Add connection point
        if (past.length > 0 && forecast.length > 0) {
            forecast[0] = {
                ...forecast[0],
                historical: past[past.length - 1].historical
            };
        }

        return [...past, ...forecast];
    }, [pastData, forecastData]);

    const nowTimestamp = pastData.length > 0
        ? new Date(pastData[pastData.length - 1].time).getTime()
        : Date.now();

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload || !payload.length) return null;

        const data = payload[0]?.payload;
        const isForecast = data?.type === 'forecast';

        return (
            <div className="stellar-tooltip min-w-[200px]">
                <div className="text-xs text-slate-400 mb-2 border-b border-console-border pb-2">
                    {new Date(label).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    })}
                </div>

                {data?.historical !== undefined && (
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-slate-400">Historical:</span>
                        <span className="text-stellar-cyan font-mono">{data.historical.toFixed(4)} ns</span>
                    </div>
                )}

                {data?.predicted !== undefined && (
                    <>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-slate-400">Predicted:</span>
                            <span className="text-stellar-primary font-mono">{data.predicted.toFixed(4)} ns</span>
                        </div>
                        {showConfidence && data?.upper95 !== undefined && (
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500">95% CI:</span>
                                <span className="text-slate-400 font-mono">
                                    [{data.lower95.toFixed(4)}, {data.upper95.toFixed(4)}]
                                </span>
                            </div>
                        )}
                    </>
                )}

                {isForecast && (
                    <div className="mt-2 pt-2 border-t border-console-border">
                        <span className="badge badge-info text-[10px]">Forecast</span>
                    </div>
                )}
            </div>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full"
        >
            <ResponsiveContainer width="100%" height={height}>
                <ComposedChart data={combinedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <defs>
                        <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
                        </linearGradient>
                        <linearGradient id="historicalGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#06b6d4" />
                            <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                        <linearGradient id="forecastGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                    </defs>

                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(71, 85, 105, 0.3)"
                        vertical={false}
                    />

                    <XAxis
                        dataKey="time"
                        type="number"
                        domain={['dataMin', 'dataMax']}
                        tickFormatter={formatTime}
                        stroke="#64748b"
                        tick={{ fill: '#64748b', fontSize: 11 }}
                        axisLine={{ stroke: '#334155' }}
                    />

                    <YAxis
                        stroke="#64748b"
                        tick={{ fill: '#64748b', fontSize: 11 }}
                        axisLine={{ stroke: '#334155' }}
                        tickFormatter={(v) => v.toFixed(2)}
                        label={{
                            value: 'Clock Error (ns)',
                            angle: -90,
                            position: 'insideLeft',
                            style: { fill: '#64748b', fontSize: 11 }
                        }}
                    />

                    <Tooltip content={<CustomTooltip />} />

                    <Legend
                        wrapperStyle={{ paddingTop: 20 }}
                        formatter={(value) => <span className="text-slate-300 text-sm">{value}</span>}
                    />

                    {/* Now reference line */}
                    <ReferenceLine
                        x={nowTimestamp}
                        stroke="#f59e0b"
                        strokeDasharray="5 5"
                        strokeWidth={2}
                        label={{
                            value: 'NOW',
                            position: 'top',
                            fill: '#f59e0b',
                            fontSize: 10,
                            fontWeight: 'bold'
                        }}
                    />

                    {/* Confidence band */}
                    {showConfidence && (
                        <Area
                            dataKey="upper95"
                            stroke="none"
                            fill="url(#confidenceGradient)"
                            name="95% Confidence"
                            stackId="confidence"
                        />
                    )}

                    {/* Historical line */}
                    <Line
                        type="monotone"
                        dataKey="historical"
                        stroke="url(#historicalGradient)"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, fill: '#06b6d4' }}
                        name="Historical"
                    />

                    {/* Forecast line */}
                    <Line
                        type="monotone"
                        dataKey="predicted"
                        stroke="url(#forecastGradient)"
                        strokeWidth={2.5}
                        strokeDasharray="5 3"
                        dot={false}
                        activeDot={{ r: 5, fill: '#8b5cf6' }}
                        name="Forecast"
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </motion.div>
    );
};

export default ForecastChart;
