import { useEffect, useRef } from 'react';

const Starfield = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Create stars
        const stars = [];
        const numStars = 200;

        for (let i = 0; i < numStars; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 1.5,
                opacity: Math.random(),
                twinkleSpeed: 0.005 + Math.random() * 0.01,
                twinklePhase: Math.random() * Math.PI * 2
            });
        }

        // Create shooting stars
        const shootingStars = [];

        const createShootingStar = () => {
            if (shootingStars.length < 2 && Math.random() < 0.002) {
                shootingStars.push({
                    x: Math.random() * canvas.width,
                    y: 0,
                    length: 50 + Math.random() * 100,
                    speed: 5 + Math.random() * 5,
                    angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2,
                    opacity: 1
                });
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw stars
            stars.forEach(star => {
                star.twinklePhase += star.twinkleSpeed;
                const opacity = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(star.twinklePhase));

                ctx.beginPath();
                ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
                ctx.fill();
            });

            // Update and draw shooting stars
            createShootingStar();

            for (let i = shootingStars.length - 1; i >= 0; i--) {
                const ss = shootingStars[i];

                const gradient = ctx.createLinearGradient(
                    ss.x, ss.y,
                    ss.x - Math.cos(ss.angle) * ss.length,
                    ss.y - Math.sin(ss.angle) * ss.length
                );
                gradient.addColorStop(0, `rgba(255, 255, 255, ${ss.opacity})`);
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

                ctx.beginPath();
                ctx.moveTo(ss.x, ss.y);
                ctx.lineTo(
                    ss.x - Math.cos(ss.angle) * ss.length,
                    ss.y - Math.sin(ss.angle) * ss.length
                );
                ctx.strokeStyle = gradient;
                ctx.lineWidth = 2;
                ctx.stroke();

                ss.x += Math.cos(ss.angle) * ss.speed;
                ss.y += Math.sin(ss.angle) * ss.speed;
                ss.opacity -= 0.01;

                if (ss.opacity <= 0 || ss.x > canvas.width || ss.y > canvas.height) {
                    shootingStars.splice(i, 1);
                }
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
            style={{ background: 'transparent' }}
        />
    );
};

export default Starfield;
