import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const OrbitVisualizer = ({ satellites, selectedId }) => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        let angle = 0;

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw Earth
            const earthRadius = 25;
            const earthGradient = ctx.createRadialGradient(
                centerX - 5, centerY - 5, 0,
                centerX, centerY, earthRadius
            );
            earthGradient.addColorStop(0, '#60a5fa');
            earthGradient.addColorStop(0.5, '#3b82f6');
            earthGradient.addColorStop(1, '#1d4ed8');

            ctx.beginPath();
            ctx.arc(centerX, centerY, earthRadius, 0, Math.PI * 2);
            ctx.fillStyle = earthGradient;
            ctx.fill();

            // Earth glow
            ctx.beginPath();
            ctx.arc(centerX, centerY, earthRadius + 3, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Orbit paths
            const orbits = [
                { radius: 60, type: 'MEO', color: 'rgba(6, 182, 212, 0.3)' },
                { radius: 90, type: 'GSO', color: 'rgba(139, 92, 246, 0.3)' },
                { radius: 110, type: 'GEO', color: 'rgba(245, 158, 11, 0.3)' }
            ];

            orbits.forEach(orbit => {
                ctx.beginPath();
                ctx.arc(centerX, centerY, orbit.radius, 0, Math.PI * 2);
                ctx.strokeStyle = orbit.color;
                ctx.lineWidth = 1;
                ctx.setLineDash([4, 4]);
                ctx.stroke();
                ctx.setLineDash([]);
            });

            // Draw satellites
            satellites.forEach((sat, i) => {
                const orbitRadius = sat.orbit === 'GEO' ? 110 : sat.orbit === 'GSO' ? 90 : 60;
                const speed = sat.orbit === 'GEO' ? 0.3 : sat.orbit === 'GSO' ? 0.5 : 0.8;
                const phase = (i / satellites.length) * Math.PI * 2;

                const x = centerX + Math.cos(angle * speed + phase) * orbitRadius;
                const y = centerY + Math.sin(angle * speed + phase) * orbitRadius;

                const isSelected = sat.id === selectedId;
                const satRadius = isSelected ? 6 : 4;

                // Satellite glow
                if (isSelected) {
                    ctx.beginPath();
                    ctx.arc(x, y, satRadius + 8, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
                    ctx.fill();
                }

                // Satellite
                ctx.beginPath();
                ctx.arc(x, y, satRadius, 0, Math.PI * 2);

                let satColor = '#10b981';
                if (sat.status === 'warning') satColor = '#f59e0b';
                if (sat.status === 'flagged') satColor = '#f43f5e';
                if (isSelected) satColor = '#3b82f6';

                ctx.fillStyle = satColor;
                ctx.fill();

                // Satellite outline
                ctx.strokeStyle = isSelected ? '#60a5fa' : 'rgba(255,255,255,0.3)';
                ctx.lineWidth = isSelected ? 2 : 1;
                ctx.stroke();

                // Label for selected
                if (isSelected) {
                    ctx.font = '10px JetBrains Mono';
                    ctx.fillStyle = '#fff';
                    ctx.textAlign = 'center';
                    ctx.fillText(sat.id, x, y - 12);
                }
            });

            angle += 0.005;
            animationRef.current = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [satellites, selectedId]);

    return (
        <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
        >
            <canvas
                ref={canvasRef}
                width={250}
                height={250}
                className="rounded-xl"
            />

            {/* Legend */}
            <div className="absolute bottom-2 left-2 space-y-1">
                <div className="flex items-center gap-2 text-[10px] font-mono">
                    <span className="w-2 h-2 rounded-full bg-stellar-cyan/50" />
                    <span className="text-slate-400">MEO</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono">
                    <span className="w-2 h-2 rounded-full bg-stellar-accent/50" />
                    <span className="text-slate-400">GSO</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono">
                    <span className="w-2 h-2 rounded-full bg-stellar-amber/50" />
                    <span className="text-slate-400">GEO</span>
                </div>
            </div>
        </motion.div>
    );
};

export default OrbitVisualizer;
